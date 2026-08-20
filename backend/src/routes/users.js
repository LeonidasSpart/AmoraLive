const auth = require('../middleware/auth');

module.exports = (prisma) => {
  const router = require('express').Router();

  // Get current user profile
  router.get('/me', auth, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { wallet: true }
      });
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Update profile
  router.patch('/me', auth, async (req, res) => {
    try {
      const { display_name, bio, interests, languages, relationship_intent, location } = req.body;
      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: { display_name, bio, interests, languages, relationship_intent, location }
      });
      res.json(updated);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // Block user
  router.post('/block', auth, async (req, res) => {
    const { userId } = req.body;
    try {
      await prisma.block.create({
        data: { blocker_id: req.user.id, blocked_id: userId }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // Report user
  router.post('/report', auth, async (req, res) => {
    const { userId, category, description } = req.body;
    try {
      await prisma.report.create({
        data: {
          reporter_id: req.user.id,
          reported_id: userId,
          target_type: 'user',
          category,
          description
        }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // Delete account (soft delete)
  router.delete('/me', auth, async (req, res) => {
    try {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { is_active: false }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  return router;
};
