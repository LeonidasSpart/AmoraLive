const auth = require('../middleware/auth');

module.exports = (prisma, io) => {
  const router = require('express').Router();

  // Get all live rooms
  router.get('/', async (req, res) => {
    const rooms = await prisma.liveRoom.findMany({ where: { status: 'live' } });
    res.json(rooms);
  });

  // Create a live room
  router.post('/', auth, async (req, res) => {
    const { title, category } = req.body;
    const room = await prisma.liveRoom.create({
      data: {
        host_id: req.user.id,
        title,
        category,
        stream_key: 'stream_' + Date.now(),
      }
    });
    res.json(room);
  });

  return router;
};
