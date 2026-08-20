const auth = require('../middleware/auth');

module.exports = (prisma, io) => {
  const router = require('express').Router();

  router.get('/active', auth, async (req, res) => {
    const event = await prisma.event.findFirst({
      where: { is_active: true, starts_at: { lte: new Date() }, ends_at: { gte: new Date() } }
    });
    if (!event) return res.status(404).json({ error: 'No active event.' });
    const timeLeft = Math.floor((event.ends_at - new Date()) / 1000);
    res.json({ ...event, timeLeft });
  });

  router.post('/join', auth, async (req, res) => {
    const { eventId, team } = req.body;
    const score = await prisma.eventScore.upsert({
      where: { user_id_event_id: { user_id: req.user.id, event_id: eventId } },
      update: { team_side: team },
      create: { user_id: req.user.id, event_id: eventId, team_side: team }
    });
    res.json(score);
  });

  router.get('/leaderboard/:eventId', auth, async (req, res) => {
    const scores = await prisma.eventScore.findMany({
      where: { event_id: req.params.eventId },
      orderBy: { total_gifts_sent: 'desc' },
      take: 100,
      include: { user: { select: { username: true, display_name: true, profile_photo: true } } }
    });
    io.to(`event-${req.params.eventId}`).emit('leaderboard-update', scores);
    res.json(scores);
  });

  return router;
};
