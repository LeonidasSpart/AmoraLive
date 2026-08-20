// backend/src/routes/store.js
const auth = require('../middleware/auth');

module.exports = (prisma) => {
  const router = require('express').Router();

  // GET /store/catalog – list all available cosmetics
  router.get('/catalog', async (req, res) => {
    try {
      const cosmetics = await prisma.cosmetic.findMany({
        where: { is_active: true },
        orderBy: { price_coins: 'asc' }
      });
      res.json(cosmetics);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /store/my – get user's owned cosmetics (with expiration and equipped status)
  router.get('/my', auth, async (req, res) => {
    try {
      const owned = await prisma.userCosmetic.findMany({
        where: { user_id: req.user.id },
        include: { cosmetic: true }
      });
      res.json(owned);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /store/purchase – buy a cosmetic (deduct coins, create record)
  router.post('/purchase', auth, async (req, res) => {
    const { cosmeticId } = req.body;
    if (!cosmeticId) {
      return res.status(400).json({ error: 'cosmeticId is required' });
    }
    try {
      const cosmetic = await prisma.cosmetic.findUnique({
        where: { id: cosmeticId }
      });
      if (!cosmetic) {
        return res.status(404).json({ error: 'Cosmetic not found' });
      }

      // Check user's wallet
      const wallet = await prisma.wallet.findUnique({
        where: { user_id: req.user.id }
      });
      if (!wallet || wallet.balance < cosmetic.price_coins) {
        return res.status(400).json({ error: 'Insufficient coins' });
      }

      // Check if already owned and not expired
      const existing = await prisma.userCosmetic.findFirst({
        where: {
          user_id: req.user.id,
          cosmetic_id: cosmeticId,
          OR: [
            { expires_at: null },
            { expires_at: { gt: new Date() } }
          ]
        }
      });
      if (existing) {
        return res.status(400).json({ error: 'You already own this cosmetic' });
      }

      // Deduct coins and create purchase record
      const expiresAt = cosmetic.duration_days
        ? new Date(Date.now() + cosmetic.duration_days * 24 * 60 * 60 * 1000)
        : null;

      await prisma.$transaction([
        prisma.wallet.update({
          where: { user_id: req.user.id },
          data: { balance: { decrement: cosmetic.price_coins } }
        }),
        prisma.userCosmetic.create({
          data: {
            user_id: req.user.id,
            cosmetic_id: cosmeticId,
            expires_at: expiresAt,
            is_equipped: false
          }
        })
      ]);

      res.json({ success: true, message: 'Cosmetic purchased successfully' });
    } catch (e) {
      console.error('Purchase error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // POST /store/equip – equip a cosmetic (unequip others of same type automatically)
  router.post('/equip', auth, async (req, res) => {
    const { userCosmeticId } = req.body;
    if (!userCosmeticId) {
      return res.status(400).json({ error: 'userCosmeticId is required' });
    }
    try {
      // Get the userCosmetic record
      const userCosmetic = await prisma.userCosmetic.findUnique({
        where: { id: userCosmeticId },
        include: { cosmetic: true }
      });
      if (!userCosmetic) {
        return res.status(404).json({ error: 'Item not found' });
      }
      if (userCosmetic.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not your item' });
      }
      if (userCosmetic.expires_at && userCosmetic.expires_at < new Date()) {
        return res.status(400).json({ error: 'Item has expired' });
      }

      // Unequip any other equipped cosmetic of the same type
      await prisma.userCosmetic.updateMany({
        where: {
          user_id: req.user.id,
          cosmetic: { type: userCosmetic.cosmetic.type },
          is_equipped: true,
          id: { not: userCosmeticId }
        },
        data: { is_equipped: false }
      });

      // Equip this one
      await prisma.userCosmetic.update({
        where: { id: userCosmeticId },
        data: { is_equipped: true }
      });

      res.json({ success: true });
    } catch (e) {
      console.error('Equip error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // POST /store/unequip – unequip a cosmetic
  router.post('/unequip', auth, async (req, res) => {
    const { userCosmeticId } = req.body;
    if (!userCosmeticId) {
      return res.status(400).json({ error: 'userCosmeticId is required' });
    }
    try {
      await prisma.userCosmetic.update({
        where: { id: userCosmeticId },
        data: { is_equipped: false }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
