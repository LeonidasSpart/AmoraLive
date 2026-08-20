const auth = require('../middleware/auth');

module.exports = (prisma) => {
  const router = require('express').Router();

  router.get('/catalog', auth, async (req, res) => {
    const cosmetics = await prisma.cosmetic.findMany({ where: { is_active: true } });
    res.json(cosmetics);
  });

  router.post('/purchase', auth, async (req, res) => {
    const { cosmeticId } = req.body;
    const userId = req.user.id;

    const cosmetic = await prisma.cosmetic.findUnique({ where: { id: cosmeticId } });
    if (!cosmetic) return res.status(404).json({ error: 'Cosmetic not found.' });

    const wallet = await prisma.wallet.findUnique({ where: { user_id: userId } });
    if (!wallet || wallet.balance < cosmetic.price_coins) {
      return res.status(400).json({ error: 'Insufficient coins.' });
    }

    await prisma.$transaction([
      prisma.wallet.update({ where: { user_id: userId }, data: { balance: { decrement: cosmetic.price_coins } } }),
      prisma.userCosmetic.create({
        data: {
          user_id: userId,
          cosmetic_id: cosmeticId,
          expires_at: cosmetic.duration_days ? new Date(Date.now() + cosmetic.duration_days * 86400000) : null,
          is_equipped: true
        }
      })
    ]);

    res.json({ success: true, message: 'Cosmetic equipped!' });
  });

  return router;
};
