// backend/src/routes/matches.js
const auth = require('../middleware/auth');
const { incrementMissionProgress } = require('../lib/missions');

const publicProfileSelect = {
  id: true,
  username: true,
  display_name: true,
  profile_photo: true,
  age_verified: true,
  bio: true,
  interests: true,
  location: true,
  online_status: true
};

module.exports = (prisma) => {
  const router = require('express').Router();

  // GET /matches/next – get a potential match card. Excludes: self, blocked
  // (either direction), already-matched, and anyone already swiped on
  // (like OR pass) so the same person never reappears in the deck.
  router.get('/next', auth, async (req, res) => {
    try {
      const userId = req.user.id;

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

      const candidates = await prisma.user.findMany({
        where: {
          id: { notIn: [...excludedIds] },
          is_active: true,
          age_verified: true
        },
        select: publicProfileSelect,
        take: 20
      });

      if (candidates.length === 0) {
        return res.status(404).json({ error: 'No matches available' });
      }

      const match = candidates[Math.floor(Math.random() * candidates.length)];
      res.json(match);
    } catch (e) {
      console.error('Error fetching next match:', e);
      res.status(500).json({ error: e.message });
    }
  });

  async function recordSwipe({ userId, targetUserId, decision, source }) {
    await prisma.swipe.upsert({
      where: { swiper_id_target_id: { swiper_id: userId, target_id: targetUserId } },
      update: { decision, source },
      create: { swiper_id: userId, target_id: targetUserId, decision, source }
    });

    if (decision === 'pass') return { matched: false };

    const reciprocal = await prisma.swipe.findUnique({
      where: { swiper_id_target_id: { swiper_id: targetUserId, target_id: userId } }
    });

    if (!reciprocal || reciprocal.decision !== 'like') {
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

    prisma.$transaction(async (tx) => {
      await incrementMissionProgress(tx, userId, 'matches_made', 1);
      await incrementMissionProgress(tx, targetUserId, 'matches_made', 1);
    }).catch(err => console.error('Mission progress (matches_made) failed:', err.message));

    return { matched: true, matchId: `${match.user1_id}_${match.user2_id}`, targetUserId };
  }

  // POST /matches/swipe – the real decision endpoint. Records the swipe and
  // only creates a Match when BOTH people have liked each other.
  router.post('/swipe', auth, async (req, res) => {
    const userId = req.user.id;
    const targetUserId = String(req.body.targetUserId || '');
    const decision = req.body.decision === 'like' ? 'like' : req.body.decision === 'pass' ? 'pass' : null;
    const source = req.body.source === 'video_match' ? 'video_match' : 'browse';

    if (!targetUserId || !decision) {
      return res.status(400).json({ error: 'targetUserId and decision ("like" or "pass") are required.' });
    }
    if (targetUserId === userId) {
      return res.status(400).json({ error: 'You cannot swipe on yourself.' });
    }

    try {
      const result = await recordSwipe({ userId, targetUserId, decision, source });
      res.json(result);
    } catch (e) {
      console.error('Error recording swipe:', e);
      res.status(500).json({ error: e.message });
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
      res.status(500).json({ error: e.message });
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
      res.status(500).json({ error: e.message });
    }
  });

  // GET /matches – list confirmed matches with the peer's public profile.
  router.get('/', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const matches = await prisma.match.findMany({
        where: { OR: [{ user1_id: userId }, { user2_id: userId }] },
        orderBy: { created_at: 'desc' },
        include: {
          user1: { select: publicProfileSelect },
          user2: { select: publicProfileSelect }
        }
      });
      const shaped = matches.map(m => ({
        matchId: `${m.user1_id}_${m.user2_id}`,
        matchedAt: m.created_at,
        source: m.source,
        peer: m.user1_id === userId ? m.user2 : m.user1
      }));
      res.json(shaped);
    } catch (e) {
      console.error('Error listing matches:', e);
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
