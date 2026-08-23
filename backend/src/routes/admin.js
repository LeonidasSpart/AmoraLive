// backend/src/routes/admin.js
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

module.exports = (prisma, io) => {
  const router = require('express').Router();
  const adminCheck = adminMiddleware(prisma);

  // ---------- Admin coin grants — admin support tool, not a purchase ----------
  // Lets an admin top up any user's wallet (including their own) directly,
  // for support/testing purposes. Every grant is logged to AuditLog and
  // notifies the recipient, same as any other wallet change.
  router.get('/wallet/lookup', auth, adminCheck, async (req, res) => {
    const query = String(req.query.query || '').trim();
    if (!query) return res.json([]);
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { display_name: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: { id: true, username: true, display_name: true, email: true, profile_photo: true, wallet: { select: { balance: true } } },
        take: 10
      });
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/wallet/grant', auth, adminCheck, async (req, res) => {
    const { userId, amount, note } = req.body;
    const grantAmount = Number(amount);
    if (!userId || !Number.isInteger(grantAmount) || grantAmount === 0) {
      return res.status(400).json({ error: 'userId and a non-zero integer amount are required.' });
    }
    if (Math.abs(grantAmount) > 100000000) {
      return res.status(400).json({ error: 'That amount is too large for a single grant.' });
    }
    try {
      const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true } });
      if (!target) return res.status(404).json({ error: 'User not found.' });

      const wallet = await prisma.wallet.upsert({
        where: { user_id: userId },
        create: { user_id: userId, balance: Math.max(grantAmount, 0), lifetime_earned: Math.max(grantAmount, 0) },
        update: grantAmount > 0
          ? { balance: { increment: grantAmount }, lifetime_earned: { increment: grantAmount } }
          : { balance: { increment: grantAmount } }
      });

      await Promise.all([
        prisma.notification.create({
          data: {
            user_id: userId,
            type: 'admin_coin_grant',
            payload: { amount: grantAmount, note: note || null, balance: wallet.balance }
          }
        }).catch(() => {}),
        prisma.auditLog.create({
          data: {
            admin_id: req.user.id,
            action: grantAmount > 0 ? 'wallet_grant' : 'wallet_deduct',
            target_type: 'user',
            target_id: userId,
            details: { amount: grantAmount, note: note || null }
          }
        }).catch(() => {})
      ]);

      res.json({ success: true, balance: wallet.balance, username: target.username });
    } catch (e) {
      console.error('Wallet grant error:', e);
      res.status(500).json({ error: e.message });
    }
  });

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
        prisma.user.count({ where: { deleted_at: null } }),
        prisma.user.count({ where: { deleted_at: null, online_status: 'online' } }),
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
    const { page = 1, limit = 20, search = '', includeDeleted = 'false' } = req.query;
    const skip = (page - 1) * limit;
    try {
      const where = {
        ...(includeDeleted === 'true' ? {} : { deleted_at: null }),
        ...(search ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { display_name: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };
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
    const { role, is_active, is_verified, membership_tier, level } = req.body;
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role, is_active, is_verified, membership_tier, level }
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
        data: { is_active: false, deleted_at: new Date() }
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
      // Without this, anyone currently watching (or the host's own camera
      // connection) never finds out the room was force-ended by an admin —
      // it would just silently drop off the next time Discover refetches.
      io.to(`live-${roomId}`).emit('room-ended', { roomId });
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

  // Self-service catalog seeding — upserts Amora's default 50-gift catalog
  // and starter coin packages. Exists so a fresh/empty catalog can be
  // populated from the admin UI directly, without needing Railway console
  // access to run `npx prisma db seed`.
  router.post('/gifts/seed-defaults', auth, adminCheck, async (req, res) => {
    try {
      const { GIFTS, COIN_PACKAGES } = require('../data/defaultCatalog');
      let giftsCreated = 0, giftsUpdated = 0, packagesCreated = 0, packagesUpdated = 0;

      for (const gift of GIFTS) {
        const existing = await prisma.giftCatalog.findFirst({ where: { name: gift.name } });
        if (existing) {
          await prisma.giftCatalog.update({ where: { id: existing.id }, data: { ...gift, is_active: true } });
          giftsUpdated++;
        } else {
          await prisma.giftCatalog.create({ data: gift });
          giftsCreated++;
        }
      }
      for (const pkg of COIN_PACKAGES) {
        const existing = await prisma.coinPackage.findFirst({ where: { name: pkg.name, platform: pkg.platform } });
        if (existing) {
          await prisma.coinPackage.update({ where: { id: existing.id }, data: { ...pkg, is_active: true } });
          packagesUpdated++;
        } else {
          await prisma.coinPackage.create({ data: pkg });
          packagesCreated++;
        }
      }

      res.json({
        success: true,
        gifts: { created: giftsCreated, updated: giftsUpdated, total: GIFTS.length },
        packages: { created: packagesCreated, updated: packagesUpdated, total: COIN_PACKAGES.length }
      });
    } catch (e) {
      console.error('Seed defaults error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/gifts', auth, adminCheck, async (req, res) => {
    const { name, description, image_url, animation_url, sound_url, coin_price, rarity, category, glyph, min_tier, sort_order, is_active } = req.body;
    try {
      const gift = await prisma.giftCatalog.create({
        data: { name, description, image_url: image_url || '', animation_url, sound_url, coin_price, rarity, category, glyph, min_tier: min_tier || 'free', sort_order: sort_order ?? 0, is_active: is_active ?? true }
      });
      res.status(201).json(gift);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.patch('/gifts/:giftId', auth, adminCheck, async (req, res) => {
    const { giftId } = req.params;
    const { name, description, image_url, animation_url, sound_url, coin_price, rarity, category, glyph, min_tier, sort_order, is_active } = req.body;
    try {
      const updated = await prisma.giftCatalog.update({
        where: { id: giftId },
        data: { name, description, image_url, animation_url, sound_url, coin_price, rarity, category, glyph, min_tier, sort_order, is_active }
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
    const { name, price_cents, coins_amount, bonus_coins, is_promotion, is_active, region, platform, stripe_price_id } = req.body;
    try {
      const updated = await prisma.coinPackage.update({
        where: { id: packageId },
        data: { name, price_cents, coins_amount, bonus_coins, is_promotion, is_active, region, platform, stripe_price_id }
      });
      res.json(updated);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // Soft delete: packages are commonly referenced by past Purchase rows, so
  // a hard delete would fail on the foreign-key constraint (or silently
  // orphan purchase history if it didn't). Deactivating keeps history intact
  // and matches the same pattern already used for GiftCatalog/Cosmetic.
  router.delete('/packages/:packageId', auth, adminCheck, async (req, res) => {
    const { packageId } = req.params;
    try {
      const updated = await prisma.coinPackage.update({
        where: { id: packageId },
        data: { is_active: false }
      });
      res.json({ success: true, package: updated });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.post('/packages/:packageId/reactivate', auth, adminCheck, async (req, res) => {
    const { packageId } = req.params;
    try {
      const updated = await prisma.coinPackage.update({
        where: { id: packageId },
        data: { is_active: true }
      });
      res.json({ success: true, package: updated });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- Team-battle Events ----------
  router.get('/events', auth, adminCheck, async (req, res) => {
    try {
      const events = await prisma.event.findMany({ orderBy: { starts_at: 'desc' }, take: 50 });
      res.json(events);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/events', auth, adminCheck, async (req, res) => {
    const { title, description, banner_url, starts_at, ends_at, event_type, teams } = req.body;
    if (!title || !starts_at || !ends_at || !event_type) {
      return res.status(400).json({ error: 'title, starts_at, ends_at, and event_type are required.' });
    }
    const teamList = Array.isArray(teams) ? teams.filter(Boolean) : [];
    if (teamList.length < 2) {
      return res.status(400).json({ error: 'Provide at least two teams for people to pick between.' });
    }
    try {
      const event = await prisma.event.create({
        data: {
          title,
          description: description || null,
          banner_url: banner_url || null,
          starts_at: new Date(starts_at),
          ends_at: new Date(ends_at),
          event_type,
          teams: teamList
        }
      });
      res.status(201).json(event);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.post('/events/:eventId/end', auth, adminCheck, async (req, res) => {
    try {
      const event = await prisma.event.update({
        where: { id: req.params.eventId },
        data: { is_active: false, ends_at: new Date() }
      });
      res.json(event);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  router.delete('/events/:eventId', auth, adminCheck, async (req, res) => {
    try {
      await prisma.eventScore.deleteMany({ where: { event_id: req.params.eventId } });
      await prisma.event.delete({ where: { id: req.params.eventId } });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- Withdrawals ----------
  router.get('/withdrawals', auth, adminCheck, async (req, res) => {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    try {
      const where = status ? { status } : {};
      const [withdrawals, total] = await Promise.all([
        prisma.withdrawal.findMany({
          where,
          orderBy: { requested_at: 'desc' },
          skip: Number(skip),
          take: Number(limit),
          include: { user: { select: { username: true, display_name: true, email: true } } }
        }),
        prisma.withdrawal.count({ where })
      ]);
      res.json({ withdrawals, total, page: Number(page), limit: Number(limit) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Valid transitions: pending -> approved | rejected; approved -> paid.
  // A rejection from "pending" refunds the held coins back to the
  // creator's wallet; rejecting from any other state isn't allowed, which
  // is what prevents a double refund if this is ever called twice.
  router.patch('/withdrawals/:id', auth, adminCheck, async (req, res) => {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected', 'paid'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved, rejected, or paid.' });
    }
    try {
      const withdrawal = await prisma.withdrawal.findUnique({ where: { id: req.params.id } });
      if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found.' });

      const validTransition =
        (withdrawal.status === 'pending' && ['approved', 'rejected'].includes(status)) ||
        (withdrawal.status === 'approved' && status === 'paid');
      if (!validTransition) {
        return res.status(409).json({ error: `Cannot move a withdrawal from "${withdrawal.status}" to "${status}".` });
      }

      const updated = await prisma.$transaction(async (tx) => {
        if (status === 'rejected') {
          await tx.wallet.update({
            where: { user_id: withdrawal.user_id },
            data: { balance: { increment: withdrawal.coins_amount } }
          });
        }
        return tx.withdrawal.update({
          where: { id: req.params.id },
          data: { status, admin_note: adminNote || null, processed_by: req.user.id, processed_at: new Date() }
        });
      });

      await prisma.notification.create({
        data: {
          user_id: withdrawal.user_id,
          type: `withdrawal_${status}`,
          payload: { withdrawalId: withdrawal.id, coins: withdrawal.coins_amount, usdCents: withdrawal.usd_cents }
        }
      }).catch(err => console.error('Failed to create withdrawal notification:', err.message));

      await prisma.auditLog.create({
        data: {
          admin_id: req.user.id,
          action: `withdrawal_${status}`,
          target_type: 'withdrawal',
          target_id: req.params.id,
          details: { coins: withdrawal.coins_amount, usdCents: withdrawal.usd_cents, adminNote: adminNote || null }
        }
      }).catch(err => console.error('Failed to write audit log:', err.message));

      res.json(updated);
    } catch (e) {
      console.error('Withdrawal review error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
