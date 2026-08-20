// backend/src/routes/matches.js
const auth = require('../middleware/auth');

module.exports = (prisma) => {
  const router = require('express').Router();

  // GET /matches/next – get a potential match (exclude blocked, already matched, self)
  router.get('/next', auth, async (req, res) => {
    try {
      const userId = req.user.id;

      // Get list of users this user has blocked
      const blockedByUser = await prisma.block.findMany({
        where: { blocker_id: userId },
        select: { blocked_id: true }
      });
      const blockedIds = blockedByUser.map(b => b.blocked_id);

      // Get list of users who have blocked this user
      const blockedByOthers = await prisma.block.findMany({
        where: { blocked_id: userId },
        select: { blocker_id: true }
      });
      const blockerIds = blockedByOthers.map(b => b.blocker_id);

      // Get existing matches (both directions)
      const existingMatches = await prisma.match.findMany({
        where: {
          OR: [
            { user1_id: userId },
            { user2_id: userId }
          ]
        },
        select: { user1_id: true, user2_id: true }
      });
      const matchedIds = existingMatches.flatMap(m => [m.user1_id, m.user2_id])
                                           .filter(id => id !== userId);

      // Exclude self, blocked, blockers, and already matched
      const excludedIds = [userId, ...blockedIds, ...blockerIds, ...matchedIds];

      // Find a random user who is active, age verified, and not excluded
      const candidates = await prisma.user.findMany({
        where: {
          id: { notIn: excludedIds },
          is_active: true,
          age_verified: true,
          // Optional: add more filters (gender preference, location, etc.)
        },
        select: {
          id: true,
          username: true,
          display_name: true,
          profile_photo: true,
          age_verified: true,
          bio: true,
          interests: true,
          location: true
        },
        take: 10 // limit to 10 random candidates
      });

      if (candidates.length === 0) {
        return res.status(404).json({ error: 'No matches available' });
      }

      // Pick one random candidate
      const randomIndex = Math.floor(Math.random() * candidates.length);
      const match = candidates[randomIndex];

      // Optionally, you could store that this user was shown to the current user
      // to avoid repeating soon. For now, just return the match.

      res.json(match);
    } catch (e) {
      console.error('Error fetching next match:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // POST /matches/accept – accept a match
  router.post('/accept', auth, async (req, res) => {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ error: 'targetUserId is required' });
    }
    try {
      const userId = req.user.id;
      // Check if a match already exists
      const existing = await prisma.match.findFirst({
        where: {
          OR: [
            { user1_id: userId, user2_id: targetUserId },
            { user1_id: targetUserId, user2_id: userId }
          ]
        }
      });
      if (existing) {
        // Match already exists – return it
        return res.json({ matched: true, matchId: existing.id, existing: true });
      }

      // Check if the target user has already accepted the current user
      // We need to see if there's a pending match from the target user to this user.
      // For simplicity, we'll just create a match immediately when both accept.
      // But since we don't have a "pending" state, we'll just create the match now.
      // This simulates both accepting at the same time.
      // In a real app, you'd have a pending state and then create match when both accept.
      // For now, we'll just create the match and notify both.

      const newMatch = await prisma.match.create({
        data: {
          user1_id: userId,
          user2_id: targetUserId
        }
      });

      // Create a chat entry or notification (optional)
      // For now, just return the match

      res.json({ matched: true, matchId: newMatch.id, existing: false });
    } catch (e) {
      console.error('Error accepting match:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // POST /matches/skip – skip a match
  router.post('/skip', auth, async (req, res) => {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ error: 'targetUserId is required' });
    }
    try {
      // We could record the skip to avoid showing the same user again soon.
      // For simplicity, we'll just return success.
      res.json({ success: true });
    } catch (e) {
      console.error('Error skipping match:', e);
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
