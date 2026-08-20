// backend/src/routes/admin.js
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

module.exports = (prisma) => {
  const router = require('express').Router();
  const adminCheck = adminMiddleware(prisma);

  // ---------- Dashboard Stats ----------
  router.get('/stats', auth, adminCheck, async (req, res) => {
    try {
      const [
        totalUsers,
        activeUsers,
        totalRooms,
        activeRooms,
        totalGifts,
        totalRevenue,
        pendingReports
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { online_status: 'online' } }),
        prisma.liveRoom.count(),
        prisma.liveRoom.count({ where: { status: 'live' } }),
        prisma.giftTransaction.count({ where: { status: 'completed' } }),
        prisma.wallet.aggregate({ _sum: { lifetime_spent: true } }),
        prisma.report.count({ where: { status: 'pending' } })
      ]);
      res.json({
        totalUsers,
        activeUsers,
        totalRooms,
        activeRooms,
        totalGifts,
        totalRevenue: totalRevenue._sum.lifetime_spent || 0,
        pendingReports
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- User Management ----------
  router.get('/users', auth, adminCheck, async (req, res) => {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;
    try {
      const where = search ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { display_name: { contains: search, mode: 'insensitive' } }
        ]
      } : {};
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: Number(skip),
          take: Number(limit),
          orderBy: { created_at: 'desc' },
          include: { wallet: true }
        }),
        prisma.user.count({ where })
      ]);
      res.json({ users, total, page: Number(page), limit: Number(limit) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.patch('/users/:userId', auth, adminCheck, async (req, res) => {
    const { userId } = req.params;
    const { role, is_active, membership_tier, level } = req.body;
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role, is_active, membership_tier, level }
      });
      const { password_hash, ...safeUser } = updated;
      res.json(safeUser);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.delete('/users/:userId', auth, adminCheck, async (req, res) => {
    const { userId } = req.params;
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { is_active: false }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- Live Rooms ----------
  router.get('/rooms', auth, adminCheck, async (req, res) => {
    const { page = 1, limit = 20, status = '' } = req.query;
    const skip = (page - 1) * limit;
    try {
      const where = status ? { status } : {};
      const [rooms, total] = await Promise.all([
        prisma.liveRoom.findMany({
          where,
          skip: Number(skip),
          take: Number(limit),
          orderBy: { created_at: 'desc' },
          include: { host: { select: { username: true, display_name: true } } }
        }),
        prisma.liveRoom.count({ where })
      ]);
      res.json({ rooms, total, page: Number(page), limit: Number(limit) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/rooms/:roomId/end', auth, adminCheck, async (req, res) => {
    const { roomId } = req.params;
    try {
      await prisma.liveRoom.update({
        where: { id: roomId },
        data: { status: 'ended', end_time: new Date() }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- Gifts Catalog ----------
  router.get('/gifts', auth, adminCheck, async (req, res) => {
    try {
      const gifts = await prisma.giftCatalog.findMany({ orderBy: { coin_price: 'asc' } });
      res.json(gifts);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/gifts', auth, adminCheck, async (req, res) => {
    const { name, description, image_url, animation_url, coin_price, rarity, category, is_active } = req.body;
    try {
      const gift = await prisma.giftCatalog.create({
        data: { name, description, image_url, animation_url, coin_price, rarity, category, is_active: is_active ?? true }
      });
      res.status(201).json(gift);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.patch('/gifts/:giftId', auth, adminCheck, async (req, res) => {
    const { giftId } = req.params;
    const { name, description, image_url, animation_url, coin_price, rarity, category, is_active } = req.body;
    try {
      const updated = await prisma.giftCatalog.update({
        where: { id: giftId },
        data: { name, description, image_url, animation_url, coin_price, rarity, category, is_active }
      });
      res.json(updated);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.delete('/gifts/:giftId', auth, adminCheck, async (req, res) => {
    const { giftId } = req.params;
    try {
      await prisma.giftCatalog.update({
        where: { id: giftId },
        data: { is_active: false }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- Reports ----------
  router.get('/reports', auth, adminCheck, async (req, res) => {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const skip = (page - 1) * limit;
    try {
      const where = status ? { status } : {};
      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          skip: Number(skip),
          take: Number(limit),
          orderBy: { created_at: 'desc' },
          include: {
            reporter: { select: { username: true, display_name: true } },
            reported: { select: { username: true, display_name: true } }
          }
        }),
        prisma.report.count({ where })
      ]);
      res.json({ reports, total, page: Number(page), limit: Number(limit) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.patch('/reports/:reportId', auth, adminCheck, async (req, res) => {
    const { reportId } = req.params;
    const { status, action_taken } = req.body;
    try {
      const updated = await prisma.report.update({
        where: { id: reportId },
        data: { status, action_taken, reviewed_at: new Date() }
      });
      res.json(updated);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- Coin Packages ----------
  router.get('/packages', auth, adminCheck, async (req, res) => {
    try {
      const packages = await prisma.coinPackage.findMany({ orderBy: { coins_amount: 'asc' } });
      res.json(packages);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/packages', auth, adminCheck, async (req, res) => {
    const { name, price_cents, coins_amount, bonus_coins, is_promotion, region, platform, stripe_price_id } = req.body;
    try {
      const pkg = await prisma.coinPackage.create({
        data: { name, price_cents, coins_amount, bonus_coins: bonus_coins || 0, is_promotion: is_promotion || false, region, platform, stripe_price_id }
      });
      res.status(201).json(pkg);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.patch('/packages/:packageId', auth, adminCheck, async (req, res) => {
    const { packageId } = req.params;
    const { name, price_cents, coins_amount, bonus_coins, is_promotion, region, platform, stripe_price_id } = req.body;
    try {
      const updated = await prisma.coinPackage.update({
        where: { id: packageId },
        data: { name, price_cents, coins_amount, bonus_coins, is_promotion, region, platform, stripe_price_id }
      });
      res.json(updated);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.delete('/packages/:packageId', auth, adminCheck, async (req, res) => {
    const { packageId } = req.params;
    try {
      await prisma.coinPackage.delete({ where: { id: packageId } });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  return router;
};
