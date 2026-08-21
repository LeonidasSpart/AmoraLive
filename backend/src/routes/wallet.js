const auth = require('../middleware/auth');
const Stripe = require('stripe');
const crypto = require('crypto');

module.exports = (prisma) => {
  const router = require('express').Router();
  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

  async function ensureWallet(tx, userId) {
    return tx.wallet.upsert({
      where: { user_id: userId },
      create: { user_id: userId, balance: 0 },
      update: {}
    });
  }

  router.get('/me', auth, async (req, res) => {
    try {
      const wallet = await ensureWallet(prisma, req.user.id);
      res.json(wallet);
    } catch (e) {
      res.status(500).json({ error: 'Unable to load wallet' });
    }
  });

  router.get('/transactions', auth, async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    try {
      const [gifts, purchases] = await Promise.all([
        prisma.giftTransaction.findMany({ where: { OR: [{ sender_id: req.user.id }, { receiver_id: req.user.id }], status: 'completed' }, orderBy: { created_at: 'desc' }, take: limit, skip: (page - 1) * limit, include: { gift: true, sender: { select: { username: true, display_name: true } }, receiver: { select: { username: true, display_name: true } } } }),
        prisma.purchase.findMany({ where: { user_id: req.user.id, status: 'completed' }, orderBy: { created_at: 'desc' }, take: limit, skip: (page - 1) * limit, include: { package: true } })
      ]);
      const rows = [
        ...gifts.map(g => ({ id: g.id, type: g.sender_id === req.user.id ? 'gift_sent' : 'gift_received', amount: g.sender_id === req.user.id ? -g.coin_cost : Math.floor(g.coin_cost * (1 - g.platform_share)), description: g.sender_id === req.user.id ? `Sent ${g.gift.name}` : `Received ${g.gift.name}`, created_at: g.created_at, gift: g.gift, sender: g.sender, receiver: g.receiver })),
        ...purchases.map(p => ({ id: p.id, type: 'purchase', amount: p.package.coins_amount + p.package.bonus_coins, description: `Purchased ${p.package.name}`, created_at: p.created_at, package: p.package }))
      ].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: 'Unable to load transactions' });
    }
  });

  router.get('/gifts', auth, async (req, res) => {
    try {
      const gifts = await prisma.giftTransaction.findMany({
        where: { OR: [{ sender_id: req.user.id }, { receiver_id: req.user.id }], status: 'completed' },
        orderBy: { created_at: 'desc' },
        include: {
          sender: { select: { username: true, display_name: true } },
          receiver: { select: { username: true, display_name: true } },
          gift: true
        }
      });
      res.json(gifts);
    } catch (e) {
      res.status(500).json({ error: 'Unable to load gift history' });
    }
  });

  // Public (any authenticated user) listing of purchasable coin packages.
  // Distinct from /admin/packages, which is admin-only management —
  // wallet.jsx was previously calling that admin route directly with a
  // regular user's token and silently getting a 403 on every load, so no
  // one ever saw packages to buy.
  router.get('/packages', auth, async (req, res) => {
    try {
      const platform = ['web', 'ios', 'android'].includes(req.query.platform) ? req.query.platform : 'web';
      const packages = await prisma.coinPackage.findMany({
        where: { is_active: true, platform },
        orderBy: { coins_amount: 'asc' }
      });
      res.json(packages);
    } catch (e) {
      res.status(500).json({ error: 'Unable to load packages' });
    }
  });

  router.post('/checkout', auth, async (req, res) => {
    const { packageId } = req.body;
    if (!packageId) return res.status(400).json({ error: 'packageId required' });
    if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' });

    try {
      const pkg = await prisma.coinPackage.findUnique({ where: { id: packageId } });
      if (!pkg || !pkg.is_active || pkg.platform !== 'web') return res.status(404).json({ error: 'Package not available on web' });
      const token = crypto.randomUUID();
      const totalCoins = pkg.coins_amount + pkg.bonus_coins;
      const purchase = await prisma.purchase.create({
        data: {
          user_id: req.user.id,
          package_id: pkg.id,
          price_paid: pkg.price_cents,
          platform: 'web',
          purchase_token: token,
          status: 'pending'
        }
      });
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: pkg.name, description: `${totalCoins} Amora coins` },
            unit_amount: pkg.price_cents
          },
          quantity: 1
        }],
        success_url: `${process.env.APP_URL || 'https://www.amoramatch.one'}/wallet?payment=success`,
        cancel_url: `${process.env.APP_URL || 'https://www.amoramatch.one'}/wallet?payment=cancelled`,
        metadata: { purchaseId: purchase.id, userId: req.user.id }
      });
      await prisma.purchase.update({ where: { id: purchase.id }, data: { purchase_token: session.id } });
      res.json({ checkoutUrl: session.url, sessionId: session.id });
    } catch (e) {
      console.error('Coin checkout error:', e);
      res.status(500).json({ error: 'Unable to create checkout session' });
    }
  });

  // Kept as a compatibility endpoint. It never grants coins directly.
  router.post('/purchase', auth, async (req, res) => {
    return res.status(410).json({ error: 'Direct wallet credits are disabled. Use /wallet/checkout.' });
  });

  return router;
};
