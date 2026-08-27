// backend/src/routes/notifications.js
const auth = require('../middleware/auth');

module.exports = (prisma, io) => {
  const router = require('express').Router();

  // GET /notifications – get user's notifications (paginated)
  router.get('/', auth, async (req, res) => {
    const { limit = 30, page = 1, unreadOnly = 'false' } = req.query;
    const skip = (page - 1) * limit;
    try {
      const where = {
        user_id: req.user.id,
        ...(unreadOnly === 'true' ? { is_read: false } : {})
      };
      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { created_at: 'desc' },
          take: Number(limit),
          skip: Number(skip)
        }),
        prisma.notification.count({ where })
      ]);
      res.json({
        notifications,
        total,
        page: Number(page),
        limit: Number(limit),
        unreadCount: await prisma.notification.count({
          where: { user_id: req.user.id, is_read: false }
        })
      });
    } catch (e) {
      console.error('Notifications error:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // GET /notifications/unread-count – quick unread count (for badge)
  router.get('/unread-count', auth, async (req, res) => {
    try {
      const count = await prisma.notification.count({
        where: { user_id: req.user.id, is_read: false }
      });
      res.json({ count });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // PATCH /notifications/:id/read – mark a notification as read
  router.patch('/:id/read', auth, async (req, res) => {
    const { id } = req.params;
    try {
      const notification = await prisma.notification.findUnique({
        where: { id }
      });
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      if (notification.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not your notification' });
      }
      const updated = await prisma.notification.update({
        where: { id },
        data: { is_read: true }
      });
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // POST /notifications/mark-all-read – mark all as read
  router.post('/mark-all-read', auth, async (req, res) => {
    try {
      await prisma.notification.updateMany({
        where: { user_id: req.user.id, is_read: false },
        data: { is_read: true }
      });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // POST /notifications/preferences – update notification preferences
  router.post('/preferences', auth, async (req, res) => {
    const { message, match, gift, live_event, follow, purchase, membership, security } = req.body;
    try {
      // Preferences are stored as JSON on the User record. Merge with
      // whatever is already stored so a partial update doesn't silently
      // reset every unspecified preference back to its default.
      const existingUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { notification_preferences: true }
      });
      const current = existingUser?.notification_preferences || {};

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          notification_preferences: {
            message: message ?? current.message ?? true,
            match: match ?? current.match ?? true,
            gift: gift ?? current.gift ?? true,
            live_event: live_event ?? current.live_event ?? true,
            follow: follow ?? current.follow ?? true,
            purchase: purchase ?? current.purchase ?? true,
            membership: membership ?? current.membership ?? true,
            security: security ?? current.security ?? true
          }
        }
      });
      res.json({ success: true, preferences: user.notification_preferences });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // GET /notifications/preferences – get notification preferences
  router.get('/preferences', auth, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { notification_preferences: true }
      });
      res.json(user?.notification_preferences || {});
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // DELETE /notifications/:id – delete a notification
  router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
      const notification = await prisma.notification.findUnique({
        where: { id }
      });
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      if (notification.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not your notification' });
      }
      await prisma.notification.delete({ where: { id } });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  return router;
};
