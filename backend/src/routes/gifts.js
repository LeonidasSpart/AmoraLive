const auth = require('../middleware/auth');
const crypto = require('crypto');
const { awardXp } = require('../lib/xp');

module.exports = (prisma, io) => {
  const router = require('express').Router();

  router.get('/catalog', async (req, res) => {
    try {
      const now = new Date();
      const gifts = await prisma.giftCatalog.findMany({
        where: {
          is_active: true,
          OR: [{ available_from: null }, { available_from: { lte: now } }],
          AND: [{ OR: [{ available_to: null }, { available_to: { gte: now } }] }]
        },
        orderBy: [{ category: 'asc' }, { sort_order: 'asc' }, { coin_price: 'asc' }]
      });
      res.json(gifts);
    } catch (e) {
      res.status(500).json({ error: 'Unable to load gifts', code: 'CATALOG_LOAD_FAILED' });
    }
  });

  // ---------- GET /gifts/history (current user's sent + received) ----------
  // Registered before /:id — otherwise Express would match "history" as an
  // :id value and this route would be unreachable.
  router.get('/history', auth, async (req, res) => {
    const { direction = 'all', limit = 50 } = req.query;
    const take = Math.min(Number(limit) || 50, 100);
    try {
      const where = direction === 'sent'
        ? { sender_id: req.user.id }
        : direction === 'received'
          ? { receiver_id: req.user.id }
          : { OR: [{ sender_id: req.user.id }, { receiver_id: req.user.id }] };

      const history = await prisma.giftTransaction.findMany({
        where: { ...where, status: 'completed' },
        orderBy: { created_at: 'desc' },
        take,
        include: {
          gift: true,
          sender: { select: { id: true, username: true, display_name: true, profile_photo: true, is_verified: true, membership_tier: true } },
          receiver: { select: { id: true, username: true, display_name: true, profile_photo: true, is_verified: true, membership_tier: true } }
        }
      });
      res.json(history);
    } catch (e) {
      res.status(500).json({ error: 'Unable to load gift history', code: 'HISTORY_LOAD_FAILED' });
    }
  });

  // ---------- GET /gifts/:id ----------
  router.get('/:id', async (req, res) => {
    try {
      const gift = await prisma.giftCatalog.findUnique({ where: { id: req.params.id } });
      if (!gift || !gift.is_active) return res.status(404).json({ error: 'Gift not found', code: 'GIFT_NOT_FOUND' });
      res.json(gift);
    } catch (e) {
      res.status(500).json({ error: 'Unable to load gift', code: 'GIFT_LOAD_FAILED' });
    }
  });

  // Platform take rate is 65% to the streamer / 35% to Amora, across all
  // gifting (direct-to-user and in live rooms alike).
  const RECEIVER_SHARE = 0.65;

  router.post('/send', auth, async (req, res) => {
    const { giftId, receiverId, roomId, quantity = 1, idempotencyKey } = req.body;
    const qty = Number(quantity);
    if (!giftId || (!receiverId && !roomId) || !Number.isInteger(qty) || qty < 1 || qty > 100) {
      return res.status(400).json({ error: 'giftId, receiverId or roomId, and valid quantity are required', code: 'INVALID_REQUEST' });
    }

    const key = idempotencyKey || crypto.randomUUID();
    try {
      const existing = await prisma.giftTransaction.findUnique({ where: { tx_id: key } });
      if (existing) return res.json({ success: true, duplicate: true, transaction: existing });

      const txResult = await prisma.$transaction(async (tx) => {
        const gift = await tx.giftCatalog.findFirst({ where: { id: giftId, is_active: true } });
        if (!gift) throw Object.assign(new Error('Gift not found'), { statusCode: 404, code: 'GIFT_NOT_FOUND' });

        let receiver = null;
        let room = null;
        if (roomId) {
          room = await tx.liveRoom.findUnique({ where: { id: roomId }, include: { host: true } });
          if (!room || room.status !== 'live') throw Object.assign(new Error('Live room is not active'), { statusCode: 409, code: 'ROOM_NOT_ACTIVE' });
          receiver = room.host;
        } else {
          receiver = await tx.user.findUnique({ where: { id: receiverId } });
          if (!receiver || !receiver.is_active) throw Object.assign(new Error('Receiver not found'), { statusCode: 404, code: 'RECEIVER_NOT_FOUND' });
        }
        if (!receiver || receiver.id === req.user.id) throw Object.assign(new Error('Invalid receiver'), { statusCode: 400, code: 'INVALID_RECEIVER' });

        // Looked up before the wallet math below: an active team-battle
        // event still tracks EventScore, and an active PK battle (see
        // below) still tracks PkBattle score — but the coin split itself
        // is now the same 65/35 everywhere.
        const activeEvent = await tx.event.findFirst({
          where: { is_active: true, starts_at: { lte: new Date() }, ends_at: { gte: new Date() } }
        });

        const totalCost = gift.coin_price * qty;
        const senderWallet = await tx.wallet.upsert({ where: { user_id: req.user.id }, create: { user_id: req.user.id }, update: {} });
        const debit = await tx.wallet.updateMany({
          where: { user_id: req.user.id, balance: { gte: totalCost } },
          data: { balance: { decrement: totalCost }, lifetime_spent: { increment: totalCost } }
        });
        if (debit.count !== 1) throw Object.assign(new Error('Insufficient coin balance'), { statusCode: 402, code: 'INSUFFICIENT_BALANCE' });
        const updatedSender = await tx.wallet.findUnique({ where: { user_id: req.user.id } });

        const receiverShare = Math.floor(totalCost * RECEIVER_SHARE);
        const receiverWallet = await tx.wallet.upsert({ where: { user_id: receiver.id }, create: { user_id: receiver.id }, update: {} });
        const updatedReceiver = await tx.wallet.update({
          where: { user_id: receiver.id },
          data: { balance: { increment: receiverShare }, lifetime_earned: { increment: receiverShare } }
        });

        // 1 XP per 20 coins received, capped at 500 XP/day from gifting —
        // real coins were still spent to generate this, so it's lower-risk
        // than most XP sources, but a daily cap keeps a self-gifting loop
        // between two accounts from being a level-farming shortcut.
        const xpResult = await awardXp(tx, {
          userId: receiver.id,
          amount: Math.floor(totalCost / 20),
          reason: 'gift_received',
          metadata: { giftId: gift.id, coinCost: totalCost },
          dailyCap: 500
        });

        const transaction = await tx.giftTransaction.create({
          data: {
            sender_id: req.user.id,
            receiver_id: receiver.id,
            room_id: room?.id || null,
            gift_id: gift.id,
            quantity: qty,
            coin_cost: totalCost,
            platform_share: 1 - RECEIVER_SHARE,
            status: 'completed',
            tx_id: key
          },
          include: { gift: true, sender: { select: { id: true, username: true, display_name: true, is_verified: true, membership_tier: true } }, receiver: { select: { id: true, username: true, display_name: true, is_verified: true, membership_tier: true } } }
        });

        if (room) {
          await tx.liveRoom.update({ where: { id: room.id }, data: { gift_count: { increment: qty } } });
        }

        // If this room is currently in a PK battle, the gift's coin value
        // boosts that room's side of the battle score.
        let battleUpdate = null;
        if (room?.active_battle_id) {
          const battle = await tx.pkBattle.findUnique({ where: { id: room.active_battle_id } });
          if (battle && battle.status === 'active') {
            const isRoomA = battle.room_a_id === room.id;
            battleUpdate = await tx.pkBattle.update({
              where: { id: battle.id },
              data: isRoomA ? { score_a: { increment: totalCost } } : { score_b: { increment: totalCost } }
            });
          }
        }

        // If a live team-battle event is running, gifting is how you boost
        // your team's score — same mechanic as the leaderboard/event system
        // already exposed via /events/*. Score only counts if the sender
        // has actually joined a team for the active event.
        if (activeEvent) {
          const senderScore = await tx.eventScore.findUnique({
            where: { user_id_event_id: { user_id: req.user.id, event_id: activeEvent.id } }
          });
          if (senderScore) {
            await tx.eventScore.update({
              where: { user_id_event_id: { user_id: req.user.id, event_id: activeEvent.id } },
              data: { total_gifts_sent: { increment: totalCost } }
            });
          }
          const receiverScore = await tx.eventScore.findUnique({
            where: { user_id_event_id: { user_id: receiver.id, event_id: activeEvent.id } }
          });
          if (receiverScore) {
            await tx.eventScore.update({
              where: { user_id_event_id: { user_id: receiver.id, event_id: activeEvent.id } },
              data: { total_gifts_received: { increment: totalCost } }
            });
          }
        }

        await tx.notification.create({
          data: {
            user_id: receiver.id,
            type: 'gift_received',
            payload: { transactionId: transaction.id, giftId: gift.id, giftName: gift.name, quantity: qty, coinCost: totalCost, roomId: room?.id || null }
          }
        });
        return { transaction, activeEventId: activeEvent?.id || null, battleUpdate, xpResult };
      });

      const { transaction: result, activeEventId, battleUpdate, xpResult } = txResult;
      if (result.room_id) io.to(`live-${result.room_id}`).emit('gift-animation', result);
      io.to(`user-${result.receiver_id}`).emit('gift-received', result);
      io.to(`user-${result.sender_id}`).emit('gift-sent', result);

      if (xpResult?.leveledUp) {
        io.to(`user-${result.receiver_id}`).emit('level-up', { newLevel: xpResult.newLevel, badge: xpResult.newBadge });
      }

      if (battleUpdate) {
        io.to(`live-${battleUpdate.room_a_id}`).to(`live-${battleUpdate.room_b_id}`).emit('battle:score', {
          battleId: battleUpdate.id,
          scoreA: battleUpdate.score_a,
          scoreB: battleUpdate.score_b
        });
      }

      if (activeEventId) {
        // Broadcast a fresh leaderboard so team battle screens update live,
        // same shape as GET /events/leaderboard/:eventId.
        prisma.eventScore.findMany({
          where: { event_id: activeEventId },
          orderBy: { total_gifts_sent: 'desc' },
          take: 100,
          include: { user: { select: { username: true, display_name: true, profile_photo: true, is_verified: true, membership_tier: true } } }
        }).then(scores => {
          const teamTotals = {};
          for (const s of scores) {
            teamTotals[s.team_side] = (teamTotals[s.team_side] || 0) + s.total_gifts_sent + s.total_gifts_received;
          }
          io.to(`event-${activeEventId}`).emit('leaderboard-update', { scores, teamTotals });
        }).catch(err => console.error('Leaderboard broadcast failed:', err.message));
      }
      res.status(201).json({ success: true, transaction: result });
    } catch (e) {
      const status = e.statusCode || 500;
      if (status >= 500) console.error('Gift transaction error:', e);
      res.status(status).json({
        error: status === 500 ? 'Gift transaction failed' : e.message,
        code: e.code || (status === 500 ? 'TRANSACTION_FAILED' : 'GIFT_SEND_FAILED')
      });
    }
  });

  return router;
};
