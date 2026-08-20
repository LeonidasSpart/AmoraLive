// backend/src/routes/wallet.js
const auth = require('../middleware/auth');

module.exports = (prisma) => {
  const router = require('express').Router();

  // GET /wallet/me – get balance and summary
  router.get('/me', auth, async (req, res) => {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { user_id: req.user.id }
      });
      if (!wallet) {
        // Create wallet if missing
        const newWallet = await prisma.wallet.create({
          data: { user_id: req.user.id, balance: 0 }
        });
        return res.json(newWallet);
      }
      res.json(wallet);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /wallet/transactions – list all coin transactions (gifts sent/received, purchases)
  router.get('/transactions', auth, async (req, res) => {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    try {
      // Get gift transactions (sent and received)
      const gifts = await prisma.giftTransaction.findMany({
        where: {
          OR: [
            { sender_id: req.user.id },
            { receiver_id: req.user.id }
          ],
          status: 'completed'
        },
        orderBy: { created_at: 'desc' },
        take: Number(limit),
        skip: Number(skip),
        include: {
          sender: { select: { username: true, display_name: true } },
          receiver: { select: { username: true, display_name: true } },
          gift: true
        }
      });
      // Get coin purchases
      const purchases = await prisma.purchase.findMany({
        where: { user_id: req.user.id, status: 'completed' },
        orderBy: { created_at: 'desc' },
        take: Number(limit),
        skip: Number(skip),
        include: { package: true }
      });

      // Combine and sort by date
      const combined = [
        ...gifts.map(g => ({
          id: g.id,
          type: g.sender_id === req.user.id ? 'gift_sent' : 'gift_received',
          amount: g.coin_cost,
          description: g.sender_id === req.user.id
            ? `Sent ${g.gift.name} to ${g.receiver?.display_name || g.receiver?.username}`
            : `Received ${g.gift.name} from ${g.sender?.display_name || g.sender?.username}`,
          created_at: g.created_at,
          gift: g.gift,
          sender: g.sender,
          receiver: g.receiver
        })),
        ...purchases.map(p => ({
          id: p.id,
          type: 'purchase',
          amount: p.package.coins_amount + (p.package.bonus_coins || 0),
          description: `Purchased ${p.package.name}`,
          created_at: p.created_at,
          package: p.package
        }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      res.json(combined);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /wallet/gifts – only gift history (for filtering)
  router.get('/gifts', auth, async (req, res) => {
    try {
      const gifts = await prisma.giftTransaction.findMany({
        where: {
          OR: [
            { sender_id: req.user.id },
            { receiver_id: req.user.id }
          ],
          status: 'completed'
        },
        orderBy: { created_at: 'desc' },
        include: {
          sender: { select: { username: true, display_name: true } },
          receiver: { select: { username: true, display_name: true } },
          gift: true
        }
      });
      res.json(gifts);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /wallet/purchase – buy a coin package (mock – no real payment)
  router.post('/purchase', auth, async (req, res) => {
    const { packageId } = req.body;
    if (!packageId) {
      return res.status(400).json({ error: 'packageId required' });
    }
    try {
      const pkg = await prisma.coinPackage.findUnique({
        where: { id: packageId }
      });
      if (!pkg) {
        return res.status(404).json({ error: 'Package not found' });
      }

      // In production, process payment here (Stripe, etc.)
      // For now, we'll just add coins and create a purchase record.
      const totalCoins = pkg.coins_amount + (pkg.bonus_coins || 0);
      const updatedWallet = await prisma.wallet.update({
        where: { user_id: req.user.id },
        data: {
          balance: { increment: totalCoins },
          lifetime_spent: { increment: pkg.price_cents }
        }
      });
      await prisma.purchase.create({
        data: {
          user_id: req.user.id,
          package_id: packageId,
          price_paid: pkg.price_cents,
          platform: 'web',
          purchase_token: 'mock_' + Date.now(),
          status: 'completed'
        }
      });
      res.json({ success: true, newBalance: updatedWallet.balance });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
