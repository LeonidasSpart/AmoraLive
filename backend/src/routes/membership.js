const auth = require('../middleware/auth');
const Stripe = require('stripe');

const PLANS = [
  { tier: 'free', label: 'Free', price: 0, currency: 'USD', benefits: ['Basic profile', 'View live streams', 'Send basic gifts', 'Limited chat'] },
  { tier: 'premium', label: 'Premium', price: 9.99, currency: 'USD', benefits: ['Ad-free experience', 'Exclusive gifts', 'Priority support', 'Profile badge', 'Extended chat history'] },
  { tier: 'vip', label: 'VIP', price: 29.99, currency: 'USD', benefits: ['All Premium benefits', 'Profile boost', 'Bonus coins monthly', 'Exclusive VIP events', 'Private shows access'] },
  { tier: 'svip', label: 'SVIP', price: 59.99, currency: 'USD', benefits: ['All VIP benefits', 'Unlimited gifts', 'Private 1-on-1 shows', 'Early access to features', 'Dedicated account manager'] }
];

module.exports = (prisma) => {
  const router = require('express').Router();
  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

  router.get('/plans', (req, res) => res.json(PLANS));

  router.get('/me', auth, async (req, res) => {
    try {
      const membership = await prisma.membership.findUnique({ where: { user_id: req.user.id } });
      if (!membership || membership.end_date <= new Date()) {
        if (membership && membership.end_date <= new Date()) {
          await prisma.user.update({ where: { id: req.user.id }, data: { membership_tier: 'free' } });
        }
        return res.json({ tier: 'free', label: 'Free', start_date: null, end_date: null, auto_renew: false, benefits: PLANS[0].benefits });
      }
      const plan = PLANS.find(p => p.tier === membership.tier) || PLANS[0];
      res.json({ ...membership, label: plan.label, benefits: plan.benefits });
    } catch (e) {
      res.status(500).json({ error: 'Unable to load membership' });
    }
  });

  router.post('/checkout', auth, async (req, res) => {
    const { tier } = req.body;
    const plan = PLANS.find(p => p.tier === tier);
    if (!plan || plan.tier === 'free') return res.status(400).json({ error: 'Invalid membership tier' });
    if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' });

    try {
      const existing = await prisma.membership.findUnique({ where: { user_id: req.user.id } });
      if (existing && existing.end_date > new Date() && existing.tier === tier && existing.auto_renew) {
        return res.status(409).json({ error: 'You already have this active membership' });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: `AmoraLive ${plan.label}` },
            unit_amount: Math.round(plan.price * 100),
            recurring: { interval: 'month' }
          },
          quantity: 1
        }],
        success_url: `${process.env.APP_URL || 'https://www.amoramatch.one'}/profile?membership=success`,
        cancel_url: `${process.env.APP_URL || 'https://www.amoramatch.one'}/profile?membership=cancelled`,
        metadata: { userId: req.user.id, tier: plan.tier },
        subscription_data: { metadata: { userId: req.user.id, tier: plan.tier } }
      });
      res.json({ checkoutUrl: session.url, sessionId: session.id });
    } catch (e) {
      console.error('Membership checkout error:', e);
      res.status(500).json({ error: 'Unable to create membership checkout' });
    }
  });

  // Compatibility endpoint: never activates a membership directly.
  router.post('/subscribe', auth, async (req, res) => {
    return res.status(410).json({ error: 'Direct membership activation is disabled. Use /membership/checkout.' });
  });

  router.post('/cancel', auth, async (req, res) => {
    if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' });
    try {
      const existing = await prisma.membership.findUnique({ where: { user_id: req.user.id } });
      if (!existing?.stripe_subscription_id) return res.status(400).json({ error: 'No active Stripe membership' });
      const sub = await stripe.subscriptions.update(existing.stripe_subscription_id, { cancel_at_period_end: true });
      const updated = await prisma.membership.update({
        where: { user_id: req.user.id },
        data: { auto_renew: !sub.cancel_at_period_end, end_date: new Date(sub.current_period_end * 1000) }
      });
      res.json({ success: true, membership: updated });
    } catch (e) {
      console.error('Membership cancel error:', e);
      res.status(500).json({ error: 'Unable to cancel membership' });
    }
  });

  return router;
};
