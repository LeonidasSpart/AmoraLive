// backend/src/routes/matches.js
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { incrementMissionProgress } = require('../lib/missions');
const { sendPushToUser } = require('../lib/push');
const { calculateAge, compatibilityScore } = require('../lib/compatibility');

const publicProfileSelect = {
  id: true,
  username: true,
  display_name: true,
  profile_photo: true,
  age_verified: true,
  bio: true,
  interests: true,
  location: true,
  online_status: true,
  gender: true,
  relationship_intent: true,
  date_of_birth: true,
  is_verified: true,
  membership_tier: true
};

const SUPERLIKE_DAILY_LIMIT = 3;

module.exports = (prisma) => {
  const router = require('express').Router();

  // ---------- GET /matches/preferences ----------
  router.get('/preferences', auth, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { dating_preferences: true, gender: true } });
      res.json({ gender: user?.gender || null, ...(user?.dating_preferences || {}) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // ---------- PATCH /matches/preferences ----------
  router.patch('/preferences', auth, async (req, res) => {
    const { gender, showMe, minAge, maxAge } = req.body;
    try {
      const prefs = {};
      if (Array.isArray(showMe)) prefs.showMe = showMe;
      if (Number.isInteger(minAge)) prefs.minAge = Math.max(18, minAge);
      if (Number.isInteger(maxAge)) prefs.maxAge = maxAge;

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(gender !== undefined ? { gender } : {}),
          dating_preferences: prefs
        },
        select: { gender: true, dating_preferences: true }
      });
      res.json({ gender: updated.gender, ...updated.dating_preferences });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // GET /matches/next – get a potential match card. Excludes: self, blocked
  // (either direction), already-matched, and anyone already swiped on
  // (like OR pass) so the same person never reappears in the deck. Also
  // applies this viewer's dating preferences (show_me / age range) when
  // set — unset preferences mean no filtering, so this never breaks for
  // an account that hasn't configured them.
  router.get('/next', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { interests: true, relationship_intent: true, location: true, dating_preferences: true }
      });

      const [blockedByUser, blockedByOthers, existingMatches, priorSwipes] = await Promise.all([
        prisma.block.findMany({ where: { blocker_id: userId }, select: { blocked_id: true } }),
        prisma.block.findMany({ where: { blocked_id: userId }, select: { blocker_id: true } }),
        prisma.match.findMany({ where: { OR: [{ user1_id: userId }, { user2_id: userId }] }, select: { user1_id: true, user2_id: true } }),
        prisma.swipe.findMany({ where: { swiper_id: userId }, select: { target_id: true } })
      ]);

      const excludedIds = new Set([
        userId,
        ...blockedByUser.map(b => b.blocked_id),
        ...blockedByOthers.map(b => b.blocker_id),
        ...existingMatches.flatMap(m => [m.user1_id, m.user2_id]),
        ...priorSwipes.map(s => s.target_id)
      ]);

      const prefs = me?.dating_preferences || {};
      const where = {
        id: { notIn: [...excludedIds] },
        is_active: true,
        age_verified: true,
        ...(Array.isArray(prefs.showMe) && prefs.showMe.length > 0 ? { gender: { in: prefs.showMe } } : {})
      };

      let candidates = await prisma.user.findMany({ where, select: publicProfileSelect, take: 40 });

      if (prefs.minAge || prefs.maxAge) {
        candidates = candidates.filter((c) => {
          const age = calculateAge(c.date_of_birth);
          if (age == null) return true; // don't hide someone just because we can't compute their age
          if (prefs.minAge && age < prefs.minAge) return false;
          if (prefs.maxAge && age > prefs.maxAge) return false;
          return true;
        });
      }

      if (candidates.length === 0) {
        return res.status(404).json({ error: 'No matches available' });
      }

      const match = candidates[Math.floor(Math.random() * candidates.length)];
      const { date_of_birth, ...safeMatch } = match;
      res.json({ ...safeMatch, age: calculateAge(date_of_birth), compatibility: compatibilityScore(me, match) });
    } catch (e) {
      console.error('Error fetching next match:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  async function recordSwipe({ userId, targetUserId, decision, source }) {
    await prisma.swipe.upsert({
      where: { swiper_id_target_id: { swiper_id: userId, target_id: targetUserId } },
      update: { decision, source },
      create: { swiper_id: userId, target_id: targetUserId, decision, source }
    });

    if (decision === 'pass') return { matched: false };

    // Super Like counts as a like for match purposes, but also gets its
    // sender a distinct, immediate notification to the target — that
    // "someone super liked you" visibility is the entire point of it, not
    // just a stronger like that behaves identically until reciprocated.
    if (decision === 'superlike') {
      const sender = await prisma.user.findUnique({ where: { id: userId }, select: { display_name: true, username: true } });
      await prisma.notification.create({
        data: { user_id: targetUserId, type: 'super_liked', payload: { fromId: userId, fromName: sender?.display_name || sender?.username } }
      }).catch(err => console.error('Failed to create super-like notification:', err.message));
      sendPushToUser(prisma, targetUserId, {
        title: 'Someone super liked you! ⭐',
        body: `${sender?.display_name || sender?.username || 'Someone'} thinks you're special.`,
        data: { type: 'super_liked', fromId: userId }
      });
    }

    const reciprocal = await prisma.swipe.findUnique({
      where: { swiper_id_target_id: { swiper_id: targetUserId, target_id: userId } }
    });

    if (!reciprocal || (reciprocal.decision !== 'like' && reciprocal.decision !== 'superlike')) {
      return { matched: false, pending: true };
    }

    const [user1_id, user2_id] = [userId, targetUserId].sort();
    const match = await prisma.match.upsert({
      where: { user1_id_user2_id: { user1_id, user2_id } },
      update: {},
      create: { user1_id, user2_id, source }
    });

    // Notify both sides — a mutual match is worth surfacing even if neither
    // person is online right now to see the socket event.
    await prisma.notification.createMany({
      data: [
        { user_id: userId, type: 'new_match', payload: { peerId: targetUserId, source } },
        { user_id: targetUserId, type: 'new_match', payload: { peerId: userId, source } }
      ]
    }).catch(err => console.error('Failed to create match notifications:', err.message));

    const [userInfo, targetInfo] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { display_name: true, username: true } }),
      prisma.user.findUnique({ where: { id: targetUserId }, select: { display_name: true, username: true } })
    ]);
    sendPushToUser(prisma, userId, { title: "It's a match! 💕", body: `You and ${targetInfo?.display_name || targetInfo?.username || 'someone'} liked each other.`, data: { type: 'new_match', peerId: targetUserId } });
    sendPushToUser(prisma, targetUserId, { title: "It's a match! 💕", body: `You and ${userInfo?.display_name || userInfo?.username || 'someone'} liked each other.`, data: { type: 'new_match', peerId: userId } });

    prisma.$transaction(async (tx) => {
      await incrementMissionProgress(tx, userId, 'matches_made', 1);
      await incrementMissionProgress(tx, targetUserId, 'matches_made', 1);
    }).catch(err => console.error('Mission progress (matches_made) failed:', err.message));

    return { matched: true, matchId: `${match.user1_id}_${match.user2_id}`, targetUserId };
  }

  // POST /matches/swipe – the real decision endpoint. Records the swipe and
  // only creates a Match when BOTH people have liked (or super liked) each
  // other.
  router.post('/swipe', auth, async (req, res) => {
    const userId = req.user.id;
    const targetUserId = String(req.body.targetUserId || '');
    const decision = ['like', 'pass', 'superlike'].includes(req.body.decision) ? req.body.decision : null;
    const source = req.body.source === 'video_match' ? 'video_match' : 'browse';

    if (!targetUserId || !decision) {
      return res.status(400).json({ error: 'targetUserId and decision ("like", "pass", or "superlike") are required.' });
    }
    if (targetUserId === userId) {
      return res.status(400).json({ error: 'You cannot swipe on yourself.' });
    }

    try {
      if (decision === 'superlike') {
        const since = new Date();
        since.setUTCHours(0, 0, 0, 0);
        const usedToday = await prisma.swipe.count({ where: { swiper_id: userId, decision: 'superlike', created_at: { gte: since } } });
        if (usedToday >= SUPERLIKE_DAILY_LIMIT) {
          return res.status(429).json({ error: `You've used all ${SUPERLIKE_DAILY_LIMIT} Super Likes for today.`, code: 'SUPERLIKE_LIMIT_REACHED' });
        }
      }

      const result = await recordSwipe({ userId, targetUserId, decision, source });
      res.json(result);
    } catch (e) {
      console.error('Error recording swipe:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // Legacy aliases kept for older clients — both now route through the same
  // mutual-consent logic instead of creating a one-sided match immediately.
  router.post('/accept', auth, async (req, res) => {
    const targetUserId = String(req.body.targetUserId || '');
    if (!targetUserId) return res.status(400).json({ error: 'targetUserId is required' });
    if (targetUserId === req.user.id) return res.status(400).json({ error: 'You cannot swipe on yourself.' });
    try {
      const result = await recordSwipe({ userId: req.user.id, targetUserId, decision: 'like', source: 'browse' });
      res.json({ ...result, existing: false });
    } catch (e) {
      console.error('Error accepting match:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  router.post('/skip', auth, async (req, res) => {
    const userId = req.user.id;
    const targetUserId = String(req.body.targetUserId || '');
    if (!targetUserId) return res.status(400).json({ error: 'targetUserId is required' });
    try {
      await recordSwipe({ userId, targetUserId, decision: 'pass', source: 'browse' });
      res.json({ success: true });
    } catch (e) {
      console.error('Error skipping match:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // GET /matches – list confirmed matches with the peer's public profile
  // and a compatibility score for each.
  router.get('/', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { interests: true, relationship_intent: true, location: true }
      });
      const matches = await prisma.match.findMany({
        where: { OR: [{ user1_id: userId }, { user2_id: userId }] },
        orderBy: { created_at: 'desc' },
        include: {
          user1: { select: publicProfileSelect },
          user2: { select: publicProfileSelect }
        }
      });
      const shaped = matches.map(m => {
        const peer = m.user1_id === userId ? m.user2 : m.user1;
        const { date_of_birth, ...safePeer } = peer;
        return {
          matchId: `${m.user1_id}_${m.user2_id}`,
          matchedAt: m.created_at,
          source: m.source,
          peer: { ...safePeer, age: calculateAge(date_of_birth) },
          compatibility: compatibilityScore(me, peer)
        };
      });
      res.json(shaped);
    } catch (e) {
      console.error('Error listing matches:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // ---------- POST /matches/:matchId/unmatch ----------
  // matchId is "user1_id_user2_id" (sorted), exactly as returned by the
  // list/swipe endpoints above. Deletes the Match permanently — the prior
  // Swipe records stay intact, which is what keeps this person correctly
  // excluded from ever resurfacing in either side's deck afterward.
  router.post('/:matchId/unmatch', auth, async (req, res) => {
    const userId = req.user.id;
    const parts = String(req.params.matchId || '').split('_');
    if (parts.length !== 2) return res.status(400).json({ error: 'Invalid match id.' });
    const [user1_id, user2_id] = parts;
    if (![user1_id, user2_id].includes(userId)) {
      return res.status(403).json({ error: 'You are not part of this match.' });
    }

    try {
      const existing = await prisma.match.findUnique({ where: { user1_id_user2_id: { user1_id, user2_id } } });
      if (!existing) return res.status(404).json({ error: 'Match not found.' });

      await prisma.match.delete({ where: { user1_id_user2_id: { user1_id, user2_id } } });
      res.json({ success: true });
    } catch (e) {
      console.error('Error unmatching:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // ---------- GET /matches/:matchId/video-date/token ----------
  // A private 1:1 LiveKit room for two already-matched people — distinct
  // from the random short "first impression" VideoMatchSession pairing
  // that happens before a match exists. Both sides can publish (unlike
  // live.js's host-only viewer model), and the room name is deterministic
  // from the match id so both people land in the same LiveKit room without
  // either needing to create/share it.
  router.get('/:matchId/video-date/token', auth, async (req, res) => {
    const userId = req.user.id;
    const parts = String(req.params.matchId || '').split('_');
    if (parts.length !== 2) return res.status(400).json({ error: 'Invalid match id.' });
    const [user1_id, user2_id] = parts;
    if (![user1_id, user2_id].includes(userId)) {
      return res.status(403).json({ error: 'You are not part of this match.' });
    }

    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_URL) {
      return res.status(503).json({ error: 'Video is not configured on this server.' });
    }

    try {
      const existing = await prisma.match.findUnique({ where: { user1_id_user2_id: { user1_id, user2_id } } });
      if (!existing) return res.status(404).json({ error: 'You are no longer matched.' });

      const roomName = `date-${user1_id}-${user2_id}`;
      const token = jwt.sign({
        iss: process.env.LIVEKIT_API_KEY,
        sub: userId,
        name: userId,
        video: { roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, canPublishData: true }
      }, process.env.LIVEKIT_API_SECRET, { expiresIn: '1h' });

      res.json({ token, url: process.env.LIVEKIT_URL, roomName });
    } catch (e) {
      console.error('Video date token error:', e);
      res.status(500).json({ error: 'Unable to start video date.' });
    }
  });

  return router;
};

