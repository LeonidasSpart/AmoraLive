const auth = require('../middleware/auth');

module.exports = (prisma, io) => {
  const router = require('express').Router();

  router.get('/catalog', async (req, res) => {
    const gifts = await prisma.giftCatalog.findMany({ where: { is_active: true } });
    res.json(gifts);
  });

  router.post('/send', auth, async (req, res) => {
    const { giftId, receiverId, roomId, tx_id } = req.body;
    // Minimal implementation
    res.json({ success: true });
  });

  return router;
};
