// backend/src/routes/safety.js
const auth = require('../middleware/auth');
const REPORT_CATEGORIES = ['harassment', 'spam', 'nudity_or_sexual_content', 'hate_speech', 'violence', 'scam_or_fraud', 'underage', 'impersonation', 'other'];

module.exports = (prisma) => {
  const router = require('express').Router();

  // ---------- GET /safety/report-categories ----------
  router.get('/report-categories', (req, res) => res.json(REPORT_CATEGORIES));

  // ---------- POST /safety/report ----------
  // Generalizes the old /users/report (still kept working there for
  // backward compatibility) — this one accepts any target type and
  // resolves reported_id itself server-side rather than trusting whatever
  // the client claims it is.
  router.post('/report', auth, async (req, res) => {
    const targetType = ['user', 'message', 'livestream', 'content'].includes(req.body.targetType) ? req.body.targetType : null;
    const targetId = String(req.body.targetId || '');
    const category = REPORT_CATEGORIES.includes(req.body.category) ? req.body.category : null;
    const description = req.body.description ? String(req.body.description).slice(0, 1000) : null;

    if (!targetType || !targetId || !category) {
      return res.status(400).json({ error: 'targetType, targetId, and a valid category are required.', code: 'INVALID_REPORT' });
    }

    try {
      let reportedId;
      if (targetType === 'user') {
        const user = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true } });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        reportedId = user.id;
      } else if (targetType === 'message') {
        const message = await prisma.message.findUnique({ where: { id: targetId }, select: { sender_id: true } });
        if (!message) return res.status(404).json({ error: 'Message not found.' });
        reportedId = message.sender_id;
      } else if (targetType === 'livestream') {
        const room = await prisma.liveRoom.findUnique({ where: { id: targetId }, select: { host_id: true } });
        if (!room) return res.status(404).json({ error: 'Livestream not found.' });
        reportedId = room.host_id;
      } else {
        // "content" — currently resolves against Stories, the one
        // free-standing content type that isn't already a user/message/
        // livestream. If other content types are added later, extend this
        // branch rather than widen targetType's meaning.
        const story = await prisma.story.findUnique({ where: { id: targetId }, select: { user_id: true } });
        if (!story) return res.status(404).json({ error: 'Content not found.' });
        reportedId = story.user_id;
      }

      if (reportedId === req.user.id) {
        return res.status(400).json({ error: 'You cannot report your own content.' });
      }

      const report = await prisma.report.create({
        data: { reporter_id: req.user.id, reported_id: reportedId, target_type: targetType, target_id: targetId, category, description }
      });
      res.status(201).json({ success: true, reportId: report.id });
    } catch (e) {
      console.error('Report creation error:', e);
      res.status(500).json({ error: 'Unable to submit report.', code: 'REPORT_FAILED' });
    }
  });

  // ---------- GET /safety/my-reports ----------
  router.get('/my-reports', auth, async (req, res) => {
    try {
      const reports = await prisma.report.findMany({
        where: { reporter_id: req.user.id },
        orderBy: { created_at: 'desc' },
        take: 50,
        select: { id: true, target_type: true, category: true, status: true, created_at: true, reviewed_at: true }
      });
      res.json(reports);
    } catch (e) {
      res.status(500).json({ error: 'Unable to load your reports.', code: 'MY_REPORTS_FAILED' });
    }
  });

  // ---------- Mute ----------
  router.post('/mute', auth, async (req, res) => {
    const targetId = String(req.body.userId || '');
    if (!targetId) return res.status(400).json({ error: 'userId is required.' });
    if (targetId === req.user.id) return res.status(400).json({ error: 'You cannot mute yourself.' });
    try {
      await prisma.mute.upsert({
        where: { muter_id_muted_id: { muter_id: req.user.id, muted_id: targetId } },
        update: {},
        create: { muter_id: req.user.id, muted_id: targetId }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.post('/unmute', auth, async (req, res) => {
    const targetId = String(req.body.userId || '');
    try {
      await prisma.mute.deleteMany({ where: { muter_id: req.user.id, muted_id: targetId } });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.get('/muted', auth, async (req, res) => {
    try {
      const mutes = await prisma.mute.findMany({
        where: { muter_id: req.user.id },
        include: { muted: { select: { id: true, username: true, display_name: true, profile_photo: true, is_verified: true, membership_tier: true } } }
      });
      res.json(mutes.map((m) => m.muted));
    } catch (e) {
      res.status(500).json({ error: 'Unable to load muted users.', code: 'MUTED_LOAD_FAILED' });
    }
  });

  // ---------- Sessions / device management ----------
  router.get('/sessions', auth, async (req, res) => {
    try {
      const sessions = await prisma.session.findMany({
        where: { user_id: req.user.id, expires_at: { gt: new Date() } },
        orderBy: { created_at: 'desc' },
        select: { id: true, device_info: true, ip_address: true, created_at: true, expires_at: true }
      });
      // The refresh token itself never leaves the DB in this response —
      // only enough to tell sessions apart and revoke them by id.
      res.json(sessions);
    } catch (e) {
      res.status(500).json({ error: 'Unable to load sessions.', code: 'SESSIONS_LOAD_FAILED' });
    }
  });

  router.delete('/sessions/:sessionId', auth, async (req, res) => {
    try {
      const session = await prisma.session.findUnique({ where: { id: req.params.sessionId } });
      if (!session || session.user_id !== req.user.id) {
        return res.status(404).json({ error: 'Session not found.' });
      }
      await prisma.session.delete({ where: { id: req.params.sessionId } });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Unable to revoke session.', code: 'REVOKE_FAILED' });
    }
  });

  // Logs out every other device. currentRefreshToken (sent from
  // localStorage, which the frontend already has) is excluded so this
  // never logs the caller themselves out — pass nothing to revoke
  // everywhere including the current session.
  router.post('/sessions/revoke-others', auth, async (req, res) => {
    const currentRefreshToken = req.body.currentRefreshToken || null;
    try {
      const result = await prisma.session.deleteMany({
        where: {
          user_id: req.user.id,
          ...(currentRefreshToken ? { refresh_token: { not: currentRefreshToken } } : {})
        }
      });
      res.json({ success: true, revokedCount: result.count });
    } catch (e) {
      res.status(500).json({ error: 'Unable to revoke sessions.', code: 'REVOKE_ALL_FAILED' });
    }
  });

  return router;
};
