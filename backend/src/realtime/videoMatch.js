// backend/src/realtime/videoMatch.js
//
// Implements the "quick video match" feature: two online users are paired
// into a short live 1:1 LiveKit video session (10-20s). When the timer ends
// both sides get a brief window to decide like/pass. A Match (and open
// chat) is only created if BOTH people liked each other.
//
// NOTE: this queue lives in the process memory of a single server instance.
// That's fine for a single Railway service, but if AmoraLive is ever scaled
// to multiple API instances this needs to move to a Redis-backed queue
// (the codebase already has a Redis pub/sub adapter wired up for Socket.IO
// - see index.js - so a follow-up would route pairing through Redis too).

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const DEFAULT_DURATION_SECS = 15; // within the requested 10-20s window
const DECISION_WINDOW_SECS = 15;
const RECENT_PAIR_COOLDOWN_MS = 60 * 60 * 1000; // don't re-pair the same two people for an hour

function liveKitConfigured() {
  return Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && process.env.LIVEKIT_URL);
}

function signLiveKitToken(userId, roomName) {
  return jwt.sign(
    {
      iss: process.env.LIVEKIT_API_KEY,
      sub: userId,
      name: userId,
      video: { roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, canPublishData: true }
    },
    process.env.LIVEKIT_API_SECRET,
    { expiresIn: '5m' }
  );
}

function calculateAge(dob) {
  if (!dob) return null;
  const now = new Date();
  const d = new Date(dob);
  let age = now.getFullYear() - d.getFullYear();
  const month = now.getMonth() - d.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

module.exports = function registerVideoMatch(io, prisma) {
  const waitingQueue = new Map(); // userId -> socket
  const recentPairs = new Map(); // "idA:idB" (sorted) -> timestamp
  const activeSessions = new Map(); // sessionId -> session state
  const userToSession = new Map(); // userId -> sessionId

  function pairKey(a, b) {
    return [a, b].sort().join(':');
  }

  function recentlyPaired(a, b) {
    const ts = recentPairs.get(pairKey(a, b));
    return Boolean(ts && Date.now() - ts < RECENT_PAIR_COOLDOWN_MS);
  }

  async function isBlockedEitherWay(a, b) {
    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { blocker_id: a, blocked_id: b },
          { blocker_id: b, blocked_id: a }
        ]
      }
    });
    return Boolean(block);
  }

  async function safePreview(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { date_of_birth: true, location: true, interests: true }
    }).catch(() => null);
    if (!user) return { age: null, location: null, interests: [] };
    return {
      age: calculateAge(user.date_of_birth),
      location: user.location?.country || user.location?.city || null,
      interests: (user.interests || []).slice(0, 3)
    };
  }

  async function fullProfile(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, display_name: true, profile_photo: true, bio: true, online_status: true }
    });
  }

  function clearSessionTimers(session) {
    if (session.startTimer) clearTimeout(session.startTimer);
    if (session.decisionTimer) clearTimeout(session.decisionTimer);
  }

  function cleanupSession(session) {
    clearSessionTimers(session);
    activeSessions.delete(session.id);
    userToSession.delete(session.userAId);
    userToSession.delete(session.userBId);
  }

  async function persistSwipe(swiperId, targetId, decision) {
    await prisma.swipe.upsert({
      where: { swiper_id_target_id: { swiper_id: swiperId, target_id: targetId } },
      update: { decision, source: 'video_match' },
      create: { swiper_id: swiperId, target_id: targetId, decision, source: 'video_match' }
    }).catch(err => console.error('video match swipe persist failed:', err.message));
  }

  async function resolveSession(session, reason) {
    if (session.resolved) return;
    session.resolved = true;
    clearSessionTimers(session);

    const decisionA = session.userADecision || 'pass';
    const decisionB = session.userBDecision || 'pass';
    const matched = decisionA === 'like' && decisionB === 'like';

    await Promise.all([
      persistSwipe(session.userAId, session.userBId, decisionA),
      persistSwipe(session.userBId, session.userAId, decisionB)
    ]);

    let matchId = null;
    if (matched) {
      const [user1_id, user2_id] = [session.userAId, session.userBId].sort();
      const match = await prisma.match.upsert({
        where: { user1_id_user2_id: { user1_id, user2_id } },
        update: {},
        create: { user1_id, user2_id, source: 'video_match' }
      }).catch(err => { console.error('video match Match upsert failed:', err.message); return null; });
      if (match) {
        matchId = `${match.user1_id}_${match.user2_id}`;
        await prisma.notification.createMany({
          data: [
            { user_id: session.userAId, type: 'new_match', payload: { peerId: session.userBId, source: 'video_match' } },
            { user_id: session.userBId, type: 'new_match', payload: { peerId: session.userAId, source: 'video_match' } }
          ]
        }).catch(err => console.error('Failed to create video match notifications:', err.message));
      }
    } else {
      recentPairs.set(pairKey(session.userAId, session.userBId), Date.now());
    }

    await prisma.videoMatchSession.update({
      where: { id: session.id },
      data: {
        status: matched ? 'matched' : 'ended',
        user_a_decision: decisionA,
        user_b_decision: decisionB,
        decided_at: new Date(),
        ended_reason: reason || 'completed'
      }
    }).catch(err => console.error('video match session update failed:', err.message));

    if (matched) {
      const [peerForA, peerForB] = await Promise.all([fullProfile(session.userBId), fullProfile(session.userAId)]);
      session.socketA?.emit('video_match:result', { sessionId: session.id, matched: true, matchId, peer: peerForA });
      session.socketB?.emit('video_match:result', { sessionId: session.id, matched: true, matchId, peer: peerForB });
    } else {
      session.socketA?.emit('video_match:result', { sessionId: session.id, matched: false });
      session.socketB?.emit('video_match:result', { sessionId: session.id, matched: false });
    }

    cleanupSession(session);
  }

  async function startDecisionPhase(session) {
    if (session.status !== 'active') return;
    session.status = 'deciding';
    const deadline = Date.now() + DECISION_WINDOW_SECS * 1000;
    session.socketA?.emit('video_match:decide_now', { sessionId: session.id, deadline });
    session.socketB?.emit('video_match:decide_now', { sessionId: session.id, deadline });
    session.decisionTimer = setTimeout(() => resolveSession(session, 'timeout'), DECISION_WINDOW_SECS * 1000);
  }

  async function createSession(userAId, socketA, userBId, socketB) {
    const roomName = `vm_${crypto.randomBytes(12).toString('hex')}`;
    const duration = DEFAULT_DURATION_SECS;

    let dbSession;
    try {
      dbSession = await prisma.videoMatchSession.create({
        data: { user_a_id: userAId, user_b_id: userBId, room_name: roomName, duration_secs: duration }
      });
    } catch (e) {
      console.error('Unable to create video match session:', e.message);
      socketA.emit('video_match:error', { error: 'Unable to start video match. Please try again.' });
      socketB.emit('video_match:error', { error: 'Unable to start video match. Please try again.' });
      return;
    }

    const session = {
      id: dbSession.id,
      userAId,
      userBId,
      socketA,
      socketB,
      roomName,
      status: 'active',
      userADecision: null,
      userBDecision: null,
      resolved: false
    };
    activeSessions.set(session.id, session);
    userToSession.set(userAId, session.id);
    userToSession.set(userBId, session.id);

    const deadline = Date.now() + duration * 1000;
    const configured = liveKitConfigured();
    const [previewForA, previewForB] = await Promise.all([safePreview(userBId), safePreview(userAId)]);

    const payloadFor = (userId, preview) => ({
      sessionId: session.id,
      roomName,
      deadline,
      durationSecs: duration,
      peerPreview: preview,
      liveKit: configured
        ? { token: signLiveKitToken(userId, roomName), url: process.env.LIVEKIT_URL }
        : null
    });

    socketA.emit('video_match:paired', payloadFor(userAId, previewForA));
    socketB.emit('video_match:paired', payloadFor(userBId, previewForB));

    if (!configured) {
      console.warn('LIVEKIT_* env vars not set — video match paired without live video (preview-only mode).');
    }

    session.startTimer = setTimeout(() => startDecisionPhase(session), duration * 1000);
  }

  async function tryPairFromQueue(newUserId, newSocket) {
    for (const [candidateId, candidateSocket] of waitingQueue) {
      if (candidateId === newUserId) continue;
      if (candidateSocket.disconnected) {
        waitingQueue.delete(candidateId);
        continue;
      }
      if (recentlyPaired(newUserId, candidateId)) continue;
      // eslint-disable-next-line no-await-in-loop
      if (await isBlockedEitherWay(newUserId, candidateId)) continue;

      waitingQueue.delete(candidateId);
      waitingQueue.delete(newUserId);
      await createSession(newUserId, newSocket, candidateId, candidateSocket);
      return true;
    }
    return false;
  }

  io.on('connection', (socket) => {
    socket.on('video_match:queue_join', async () => {
      const userId = socket.userId;
      if (!userId) return; // not authenticated yet
      if (userToSession.has(userId) || waitingQueue.has(userId)) return;

      waitingQueue.set(userId, socket);
      socket.emit('video_match:queued', { position: waitingQueue.size });

      await tryPairFromQueue(userId, socket);
    });

    socket.on('video_match:queue_leave', () => {
      if (socket.userId) waitingQueue.delete(socket.userId);
    });

    socket.on('video_match:decide', async ({ sessionId, decision } = {}) => {
      const userId = socket.userId;
      if (!userId || !sessionId) return;
      const session = activeSessions.get(sessionId);
      if (!session || (session.userAId !== userId && session.userBId !== userId)) return;
      const normalized = decision === 'like' ? 'like' : 'pass';

      if (session.userAId === userId) session.userADecision = normalized;
      else session.userBDecision = normalized;

      if (session.userADecision && session.userBDecision) {
        await resolveSession(session, 'completed');
      }
    });

    socket.on('disconnect', () => {
      const userId = socket.userId;
      if (!userId) return;
      waitingQueue.delete(userId);

      const sessionId = userToSession.get(userId);
      if (!sessionId) return;
      const session = activeSessions.get(sessionId);
      if (!session) return;

      // A disconnect counts as a pass from the disconnecting side.
      if (session.userAId === userId) session.userADecision = session.userADecision || 'pass';
      else session.userBDecision = session.userBDecision || 'pass';

      const peerSocket = session.userAId === userId ? session.socketB : session.socketA;
      peerSocket?.emit('video_match:peer_left', { sessionId });

      resolveSession(session, 'disconnect');
    });
  });
};
