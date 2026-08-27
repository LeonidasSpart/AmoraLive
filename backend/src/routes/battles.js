// backend/src/routes/battles.js
//
// PK ("head-to-head") battles between two live hosts. Invites are ephemeral
// (in-memory, auto-expiring) since they're a short-lived handshake, not
// something that needs to survive a server restart. Once accepted, the
// battle itself lives in Postgres (PkBattle) so score updates from gifts.js
// are durable and the result can be looked back on later.

const auth = require('../middleware/auth');
const { awardXp } = require('../lib/xp');
const { incrementMissionProgress } = require('../lib/missions');

const INVITE_TTL_MS = 30 * 1000;
const DEFAULT_DURATION_SECS = 180;
const ALLOWED_DURATIONS = [60, 120, 180, 300, 600];

module.exports = (prisma, io) => {
  const router = require('express').Router();

  // targetRoomId -> { fromRoomId, fromHostId, durationSecs, expiresAt, timer }
  const pendingInvites = new Map();
  // battleId -> Timeout
  const battleTimers = new Map();

  async function loadLiveRoom(roomId) {
    return prisma.liveRoom.findUnique({ where: { id: roomId }, include: { host: { select: { id: true, username: true, display_name: true, profile_photo: true } } } });
  }

  function clearInviteTimer(targetRoomId) {
    const invite = pendingInvites.get(targetRoomId);
    if (invite?.timer) clearTimeout(invite.timer);
    pendingInvites.delete(targetRoomId);
  }

  async function endBattle(battleId, reason) {
    const timer = battleTimers.get(battleId);
    if (timer) {
      clearTimeout(timer);
      battleTimers.delete(battleId);
    }

    const battle = await prisma.pkBattle.findUnique({ where: { id: battleId } });
    if (!battle || battle.status === 'ended') return null;

    const winnerRoomId = battle.score_a === battle.score_b ? null : (battle.score_a > battle.score_b ? battle.room_a_id : battle.room_b_id);

    const [ended] = await prisma.$transaction([
      prisma.pkBattle.update({
        where: { id: battleId },
        data: { status: 'ended', ended_at: new Date(), winner_room_id: winnerRoomId }
      }),
      prisma.liveRoom.update({ where: { id: battle.room_a_id }, data: { active_battle_id: null } }),
      prisma.liveRoom.update({ where: { id: battle.room_b_id }, data: { active_battle_id: null } })
    ]);

    io.to(`live-${battle.room_a_id}`).to(`live-${battle.room_b_id}`).emit('battle:ended', {
      battleId,
      scoreA: battle.score_a,
      scoreB: battle.score_b,
      winnerRoomId,
      reason: reason || 'time_up'
    });

    // XP for both participants + a winner bonus, kept in its own
    // transaction outside the battle-ending one above so a rewards issue
    // can never prevent a battle from actually ending.
    try {
      const [roomA, roomB] = await Promise.all([
        prisma.liveRoom.findUnique({ where: { id: battle.room_a_id }, select: { host_id: true } }),
        prisma.liveRoom.findUnique({ where: { id: battle.room_b_id }, select: { host_id: true } })
      ]);
      const participants = [
        { userId: roomA?.host_id, isWinner: winnerRoomId === battle.room_a_id },
        { userId: roomB?.host_id, isWinner: winnerRoomId === battle.room_b_id }
      ].filter((p) => p.userId);

      for (const p of participants) {
        const amount = 30 + (p.isWinner ? 50 : 0);
        const xpResult = await prisma.$transaction((tx) =>
          awardXp(tx, {
            userId: p.userId,
            amount,
            reason: p.isWinner ? 'battle_win' : 'battle_participation',
            metadata: { battleId },
            dailyCap: 400
          })
        );
        if (xpResult?.leveledUp) {
          io.to(`user-${p.userId}`).emit('level-up', { newLevel: xpResult.newLevel, badge: xpResult.newBadge });
        }
        await prisma.$transaction((tx) => incrementMissionProgress(tx, p.userId, 'battles_participated', 1));
      }
    } catch (xpErr) {
      console.error('XP award (battle) failed:', xpErr.message);
    }

    return ended;
  }

  // Battle end-timers are only ever held in memory (setTimeout). Every
  // server restart — including a normal redeploy — wipes them, so any
  // battle that was active at that moment never gets its scheduled
  // endBattle() call and is stuck "active" in the database forever, with
  // both rooms' active_battle_id still pointing at it. On boot, sweep for
  // exactly that case and end them immediately.
  (async () => {
    try {
      const stale = await prisma.pkBattle.findMany({ where: { status: 'active' } });
      for (const battle of stale) {
        const deadline = new Date(battle.started_at).getTime() + battle.duration_secs * 1000;
        if (Date.now() >= deadline) {
          await endBattle(battle.id, 'server_restart_cleanup');
        } else {
          // Still genuinely mid-battle when the server restarted — resume
          // its timer for the remaining time instead of leaving it stuck.
          battleTimers.set(battle.id, setTimeout(() => endBattle(battle.id, 'time_up'), deadline - Date.now()));
        }
      }
    } catch (err) {
      console.error('Stale battle cleanup failed:', err.message);
    }
  })();

  router.get('/:id/battle', async (req, res) => {
    try {
      const room = await loadLiveRoom(req.params.id);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      if (!room.active_battle_id) return res.json({ active: false });

      const battle = await prisma.pkBattle.findUnique({ where: { id: room.active_battle_id } });
      if (!battle || battle.status !== 'active') return res.json({ active: false });

      const opponentId = battle.room_a_id === room.id ? battle.room_b_id : battle.room_a_id;
      const opponentRoom = await loadLiveRoom(opponentId);
      const mySide = battle.room_a_id === room.id ? 'a' : 'b';

      res.json({
        active: true,
        battleId: battle.id,
        mySide,
        scoreA: battle.score_a,
        scoreB: battle.score_b,
        endsAt: new Date(battle.started_at).getTime() + battle.duration_secs * 1000,
        opponent: opponentRoom ? { id: opponentRoom.id, title: opponentRoom.title, host: opponentRoom.host } : null
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  router.post('/:id/battle/invite', auth, async (req, res) => {
    const { id } = req.params;
    const { targetRoomId, durationSecs } = req.body;
    const duration = ALLOWED_DURATIONS.includes(Number(durationSecs)) ? Number(durationSecs) : DEFAULT_DURATION_SECS;

    if (!targetRoomId || targetRoomId === id) {
      return res.status(400).json({ error: 'A valid targetRoomId is required.' });
    }

    try {
      const [myRoom, targetRoom] = await Promise.all([loadLiveRoom(id), loadLiveRoom(targetRoomId)]);
      if (!myRoom || myRoom.status !== 'live') return res.status(400).json({ error: 'Your room is not live.' });
      if (myRoom.host_id !== req.user.id) return res.status(403).json({ error: 'Only the host can start a battle.' });
      if (!targetRoom || targetRoom.status !== 'live') return res.status(404).json({ error: 'That streamer is not currently live.' });
      if (myRoom.active_battle_id || targetRoom.active_battle_id) return res.status(409).json({ error: 'One of these streams is already in a battle.' });
      if (pendingInvites.has(targetRoomId)) return res.status(409).json({ error: 'That streamer already has a pending battle invite.' });

      const expiresAt = Date.now() + INVITE_TTL_MS;
      const timer = setTimeout(() => {
        clearInviteTimer(targetRoomId);
        io.to(`live-${targetRoomId}`).to(`live-${id}`).emit('battle:invite_expired', { fromRoomId: id, targetRoomId });
      }, INVITE_TTL_MS);
      pendingInvites.set(targetRoomId, { fromRoomId: id, fromHostId: req.user.id, durationSecs: duration, expiresAt, timer });

      io.to(`live-${targetRoomId}`).emit('battle:invite', {
        fromRoomId: id,
        fromHost: myRoom.host,
        fromTitle: myRoom.title,
        durationSecs: duration,
        expiresAt
      });

      res.json({ success: true, expiresAt });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  router.post('/:id/battle/accept', auth, async (req, res) => {
    const { id } = req.params;
    try {
      const invite = pendingInvites.get(id);
      if (!invite || invite.expiresAt < Date.now()) {
        return res.status(404).json({ error: 'No pending invite to accept.' });
      }

      const [myRoom, fromRoom] = await Promise.all([loadLiveRoom(id), loadLiveRoom(invite.fromRoomId)]);
      if (!myRoom || myRoom.host_id !== req.user.id) return res.status(403).json({ error: 'Only the host can accept a battle.' });
      if (!myRoom || myRoom.status !== 'live' || !fromRoom || fromRoom.status !== 'live') {
        clearInviteTimer(id);
        return res.status(409).json({ error: 'One of these streams is no longer live.' });
      }
      if (myRoom.active_battle_id || fromRoom.active_battle_id) {
        clearInviteTimer(id);
        return res.status(409).json({ error: 'One of these streams already started a different battle.' });
      }

      clearInviteTimer(id);

      const battle = await prisma.$transaction(async (tx) => {
        const created = await tx.pkBattle.create({
          data: { room_a_id: invite.fromRoomId, room_b_id: id, duration_secs: invite.durationSecs }
        });
        await tx.liveRoom.update({ where: { id: invite.fromRoomId }, data: { active_battle_id: created.id } });
        await tx.liveRoom.update({ where: { id }, data: { active_battle_id: created.id } });
        return created;
      });

      const endsAt = Date.now() + invite.durationSecs * 1000;
      battleTimers.set(battle.id, setTimeout(() => endBattle(battle.id, 'time_up'), invite.durationSecs * 1000));

      const payloadFor = (mySide, opponentRoom) => ({
        battleId: battle.id,
        mySide,
        durationSecs: invite.durationSecs,
        endsAt,
        opponent: { id: opponentRoom.id, title: opponentRoom.title, host: opponentRoom.host }
      });

      io.to(`live-${invite.fromRoomId}`).emit('battle:started', payloadFor('a', myRoom));
      io.to(`live-${id}`).emit('battle:started', payloadFor('b', fromRoom));

      res.json({ success: true, battleId: battle.id, endsAt });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  router.post('/:id/battle/decline', auth, async (req, res) => {
    const { id } = req.params;
    try {
      const invite = pendingInvites.get(id);
      if (!invite) return res.status(404).json({ error: 'No pending invite to decline.' });
      clearInviteTimer(id);
      io.to(`live-${invite.fromRoomId}`).emit('battle:invite_declined', { targetRoomId: id });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  router.post('/:id/battle/cancel', auth, async (req, res) => {
    const { id } = req.params;
    const { targetRoomId } = req.body;
    try {
      const invite = pendingInvites.get(targetRoomId);
      if (!invite || invite.fromRoomId !== id) return res.status(404).json({ error: 'No matching pending invite.' });
      clearInviteTimer(targetRoomId);
      io.to(`live-${targetRoomId}`).emit('battle:invite_cancelled', { fromRoomId: id });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  router.post('/:id/battle/end', auth, async (req, res) => {
    const { id } = req.params;
    try {
      const room = await loadLiveRoom(id);
      if (!room?.active_battle_id) return res.status(404).json({ error: 'No active battle on this room.' });
      if (room.host_id !== req.user.id) return res.status(403).json({ error: 'Only a host in this battle can end it.' });

      const ended = await endBattle(room.active_battle_id, 'ended_early');
      if (!ended) return res.status(404).json({ error: 'Battle already ended.' });
      res.json({ success: true, battle: ended });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  return router;
};
