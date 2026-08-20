// backend/src/routes/store.js
const auth = require('../middleware/auth');

module.exports = (prisma) => {
  const router = require('express').Router();

  // GET /store/catalog – list all available cosmetics (optionally filter by type)
  router.get('/catalog', async (req, res) => {
    try {
      const { type } = req.query;
      const where = { is_active: true };
      if (type) {
        where.type = type;
      }
      const cosmetics = await prisma.cosmetic.findMany({
        where,
        orderBy: { price_coins: 'asc' }
      });
      res.json(cosmetics);
    } catch (e) {
      console.error('Catalog error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // GET /store/my – get user's owned cosmetics (with expiration and equipped status)
  router.get('/my', auth, async (req, res) => {
    try {
      const owned = await prisma.userCosmetic.findMany({
        where: {
          user_id: req.user.id,
          OR: [
            { expires_at: null },
            { expires_at: { gt: new Date() } }
          ]
        },
        include: { cosmetic: true }
      });
      res.json(owned);
    } catch (e) {
      console.error('My items error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // GET /store/equipped – get currently equipped items (useful for profile effects)
  router.get('/equipped', auth, async (req, res) => {
    try {
      const equipped = await prisma.userCosmetic.findMany({
        where: {
          user_id: req.user.id,
          is_equipped: true,
          OR: [
            { expires_at: null },
            { expires_at: { gt: new Date() } }
          ]
        },
        include: { cosmetic: true }
      });
      res.json(equipped);
    } catch (e) {
      console.error('Equipped error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // POST /store/purchase – buy a cosmetic (deduct coins, create or extend record)
  router.post('/purchase', auth, async (req, res) => {
    const { cosmeticId } = req.body;
    if (!cosmeticId) {
      return res.status(400).json({ error: 'cosmeticId is required' });
    }

    try {
      // 1. Get cosmetic details
      const cosmetic = await prisma.cosmetic.findUnique({
        where: { id: cosmeticId }
      });
      if (!cosmetic) {
        return res.status(404).json({ error: 'Cosmetic not found' });
      }

      // 2. Get or create user wallet
      let wallet = await prisma.wallet.findUnique({
        where: { user_id: req.user.id }
      });
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: { user_id: req.user.id, balance: 0 }
        });
      }

      // 3. Check balance
      if (wallet.balance < cosmetic.price_coins) {
        return res.status(400).json({ error: 'Insufficient coins' });
      }

      // 4. Check if user already owns this cosmetic (not expired)
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

      let expiresAt = cosmetic.duration_days
        ? new Date(Date.now() + cosmetic.duration_days * 24 * 60 * 60 * 1000)
        : null;

      // 5. If already owned, extend duration instead of creating new
      if (existing) {
        // Calculate new expiry (add duration to current expiry, or if permanent, keep null)
        if (existing.expires_at) {
          const additionalDays = cosmetic.duration_days || 0;
          const newExpiry = new Date(existing.expires_at.getTime() + additionalDays * 24 * 60 * 60 * 1000);
          expiresAt = newExpiry;
        } else {
          // Permanent item – cannot buy again
          return res.status(400).json({ error: 'You already own this permanent cosmetic' });
        }

        // Update transaction: deduct coins + update expiry
        await prisma.$transaction([
          prisma.wallet.update({
            where: { user_id: req.user.id },
            data: { balance: { decrement: cosmetic.price_coins } }
          }),
          prisma.userCosmetic.update({
            where: { id: existing.id },
            data: { expires_at: expiresAt }
          })
        ]);

        return res.json({
          success: true,
          message: 'Cosmetic extended successfully',
          expires_at: expiresAt
        });
      }

      // 6. Otherwise create new purchase
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

      res.json({
        success: true,
        message: 'Cosmetic purchased successfully',
        expires_at: expiresAt
      });
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
      if (userCosmetic.is_equipped) {
        return res.status(400).json({ error: 'Already equipped' });
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
      const userCosmetic = await prisma.userCosmetic.findUnique({
        where: { id: userCosmeticId }
      });
      if (!userCosmetic) {
        return res.status(404).json({ error: 'Item not found' });
      }
      if (userCosmetic.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not your item' });
      }
      if (!userCosmetic.is_equipped) {
        return res.status(400).json({ error: 'Already unequipped' });
      }

      await prisma.userCosmetic.update({
        where: { id: userCosmeticId },
        data: { is_equipped: false }
      });

      res.json({ success: true });
    } catch (e) {
      console.error('Unequip error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
