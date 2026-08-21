const auth = require('../middleware/auth');
const crypto = require('crypto');

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
        orderBy: { coin_price: 'asc' }
      });
      res.json(gifts);
    } catch (e) {
      res.status(500).json({ error: 'Unable to load gifts' });
    }
  });

  router.post('/send', auth, async (req, res) => {
    const { giftId, receiverId, roomId, quantity = 1, idempotencyKey } = req.body;
    const qty = Number(quantity);
    if (!giftId || (!receiverId && !roomId) || !Number.isInteger(qty) || qty < 1 || qty > 100) {
      return res.status(400).json({ error: 'giftId, receiverId or roomId, and valid quantity are required' });
    }

    const key = idempotencyKey || crypto.randomUUID();
    try {
      const existing = await prisma.giftTransaction.findUnique({ where: { tx_id: key } });
      if (existing) return res.json({ success: true, duplicate: true, transaction: existing });

      const result = await prisma.$transaction(async (tx) => {
        const gift = await tx.giftCatalog.findFirst({ where: { id: giftId, is_active: true } });
        if (!gift) throw Object.assign(new Error('Gift not found'), { statusCode: 404 });

        let receiver = null;
        let room = null;
        if (roomId) {
          room = await tx.liveRoom.findUnique({ where: { id: roomId }, include: { host: true } });
          if (!room || room.status !== 'live') throw Object.assign(new Error('Live room is not active'), { statusCode: 409 });
          receiver = room.host;
        } else {
          receiver = await tx.user.findUnique({ where: { id: receiverId } });
          if (!receiver || !receiver.is_active) throw Object.assign(new Error('Receiver not found'), { statusCode: 404 });
        }
        if (!receiver || receiver.id === req.user.id) throw Object.assign(new Error('Invalid receiver'), { statusCode: 400 });

        const totalCost = gift.coin_price * qty;
        const senderWallet = await tx.wallet.upsert({ where: { user_id: req.user.id }, create: { user_id: req.user.id }, update: {} });
        const debit = await tx.wallet.updateMany({
          where: { user_id: req.user.id, balance: { gte: totalCost } },
          data: { balance: { decrement: totalCost }, lifetime_spent: { increment: totalCost } }
        });
        if (debit.count !== 1) throw Object.assign(new Error('Insufficient coin balance'), { statusCode: 402 });
        const updatedSender = await tx.wallet.findUnique({ where: { user_id: req.user.id } });

        const receiverShare = Math.floor(totalCost * 0.8);
        const receiverWallet = await tx.wallet.upsert({ where: { user_id: receiver.id }, create: { user_id: receiver.id }, update: {} });
        const updatedReceiver = await tx.wallet.update({
          where: { user_id: receiver.id },
          data: { balance: { increment: receiverShare }, lifetime_earned: { increment: receiverShare } }
        });

        const transaction = await tx.giftTransaction.create({
          data: {
            sender_id: req.user.id,
            receiver_id: receiver.id,
            room_id: room?.id || null,
            gift_id: gift.id,
            quantity: qty,
            coin_cost: totalCost,
            platform_share: 0.20,
            status: 'completed',
            tx_id: key
          },
          include: { gift: true, sender: { select: { id: true, username: true, display_name: true } }, receiver: { select: { id: true, username: true, display_name: true } } }
        });

        if (room) {
          await tx.liveRoom.update({ where: { id: room.id }, data: { gift_count: { increment: qty } } });
        }
        await tx.notification.create({
          data: {
            user_id: receiver.id,
            type: 'gift_received',
            payload: { transactionId: transaction.id, giftId: gift.id, giftName: gift.name, quantity: qty, coinCost: totalCost, roomId: room?.id || null }
          }
        });
        return transaction;
      });

      if (result.room_id) io.to(`live-${result.room_id}`).emit('gift-animation', result);
      io.to(`user-${result.receiver_id}`).emit('gift-received', result);
      io.to(`user-${result.sender_id}`).emit('gift-sent', result);
      res.status(201).json({ success: true, transaction: result });
    } catch (e) {
      const status = e.statusCode || 500;
      if (status >= 500) console.error('Gift transaction error:', e);
      res.status(status).json({ error: status === 500 ? 'Gift transaction failed' : e.message });
    }
  });

  return router;
};
