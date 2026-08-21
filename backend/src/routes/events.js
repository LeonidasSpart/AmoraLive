const auth = require('../middleware/auth');

module.exports = (prisma, io) => {
  const router = require('express').Router();

  router.get('/active', auth, async (req, res) => {
    const event = await prisma.event.findFirst({
      where: { is_active: true, starts_at: { lte: new Date() }, ends_at: { gte: new Date() } },
      orderBy: { starts_at: 'desc' }
    });
    if (!event) return res.status(404).json({ error: 'No active event.' });

    const myScore = await prisma.eventScore.findUnique({
      where: { user_id_event_id: { user_id: req.user.id, event_id: event.id } }
    });

    const timeLeft = Math.floor((event.ends_at - new Date()) / 1000);
    res.json({ ...event, timeLeft, myTeam: myScore?.team_side || null });
  });

  router.post('/join', auth, async (req, res) => {
    const { eventId, team } = req.body;
    if (!eventId || !team) {
      return res.status(400).json({ error: 'eventId and team are required.' });
    }
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || !event.is_active || event.ends_at < new Date()) {
      return res.status(404).json({ error: 'This event is not active.' });
    }
    if (event.teams.length > 0 && !event.teams.includes(team)) {
      return res.status(400).json({ error: `Team must be one of: ${event.teams.join(', ')}` });
    }

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

    // Per-team totals, so the UI can show an overall score bar, not just an
    // individual leaderboard.
    const teamTotals = {};
    for (const s of scores) {
      teamTotals[s.team_side] = (teamTotals[s.team_side] || 0) + s.total_gifts_sent + s.total_gifts_received;
    }

    res.json({ scores, teamTotals });
  });

  return router;
};
