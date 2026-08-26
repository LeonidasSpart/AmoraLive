const auth = require('../middleware/auth');
const Stripe = require('stripe');
const { verifyAppleReceipt, verifyGoogleSubscription, acknowledgeGoogleSubscription } = require('../lib/iapVerification');
const { grantMonthlyBonusIfDue } = require('../lib/membership');

const PLANS = [
  { tier: 'free', label: 'Free', price: 0, currency: 'USD', benefits: ['Basic profile', 'View live streams', 'Send basic gifts', 'Limited chat'] },
  { tier: 'premium', label: 'Premium', price: 9.99, currency: 'USD', benefits: ['Ad-free experience', 'Exclusive gifts', 'Priority support', 'Profile badge', 'Extended chat history'], apple_product_id: 'com.amoralive.premium.monthly', google_product_id: 'premium_monthly' },
  { tier: 'vip', label: 'VIP', price: 29.99, currency: 'USD', benefits: ['All Premium benefits', 'Profile boost', 'Bonus coins monthly', 'Exclusive VIP events', 'Private shows access'], apple_product_id: 'com.amoralive.vip.monthly', google_product_id: 'vip_monthly' },
  { tier: 'svip', label: 'SVIP', price: 59.99, currency: 'USD', benefits: ['All VIP benefits', 'Unlimited gifts', 'Private 1-on-1 shows', 'Early access to features', 'Dedicated account manager'], apple_product_id: 'com.amoralive.svip.monthly', google_product_id: 'svip_monthly' }
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

  // ---------- Native IAP subscription verification (Apple / Google) ----------
  //
  // Apple's App Store Review Guidelines require auto-renewable
  // subscriptions to go through StoreKit, not a third-party processor —
  // this is what makes VIP/SVIP membership actually launchable on iOS
  // (Stripe checkout above remains the web path and the Android/Expo-Go
  // fallback). Reuses grantMonthlyBonusIfDue from lib/membership.js so
  // the bonus-coin logic is identical to the Stripe webhook path — same
  // idempotency guarantee (keyed to last_bonus_period_end), so a client
  // retrying this call with the same still-active receipt never
  // double-credits the bonus.

  router.post('/iap/apple/verify', auth, async (req, res) => {
    const { receiptData } = req.body;
    if (!receiptData) return res.status(400).json({ error: 'receiptData is required.' });

    try {
      const result = await verifyAppleReceipt(receiptData);
      if (result.status !== 0) {
        return res.status(400).json({ error: `Apple could not verify this receipt (status ${result.status}).` });
      }

      const subscriptionProductIds = PLANS.filter((p) => p.apple_product_id).map((p) => p.apple_product_id);
      const transactions = result.latest_receipt_info || result.receipt?.in_app || [];
      const matching = transactions
        .filter((t) => subscriptionProductIds.includes(t.product_id))
        .sort((a, b) => Number(b.purchase_date_ms) - Number(a.purchase_date_ms))[0];

      if (!matching) return res.status(400).json({ error: 'No matching subscription was found in this receipt.' });
      if (!matching.expires_date_ms) return res.status(400).json({ error: 'This product is not a subscription.' });

      const expiresAt = new Date(Number(matching.expires_date_ms));
      if (expiresAt <= new Date()) return res.status(400).json({ error: 'This subscription has already expired.' });

      const plan = PLANS.find((p) => p.apple_product_id === matching.product_id);
      const originalTransactionId = matching.original_transaction_id;

      // pending_renewal_info reflects whether the person has actually
      // turned auto-renew off in their App Store settings — trust that
      // over assuming a still-valid receipt always means auto-renew is on.
      const pendingRenewal = (result.pending_renewal_info || []).find((p) => p.original_transaction_id === originalTransactionId);
      const autoRenew = pendingRenewal ? pendingRenewal.auto_renew_status === '1' : true;

      const membership = await prisma.$transaction(async (tx) => {
        const m = await tx.membership.upsert({
          where: { user_id: req.user.id },
          create: { user_id: req.user.id, tier: plan.tier, end_date: expiresAt, auto_renew: autoRenew, apple_original_transaction_id: originalTransactionId },
          update: { tier: plan.tier, end_date: expiresAt, auto_renew: autoRenew, apple_original_transaction_id: originalTransactionId }
        });
        await grantMonthlyBonusIfDue(tx, { userId: req.user.id, tier: plan.tier, periodEnd: expiresAt });
        return m;
      });

      res.json({ success: true, membership });
    } catch (e) {
      console.error('Apple subscription verification error:', e);
      res.status(500).json({ error: 'Unable to verify this subscription.' });
    }
  });

  router.post('/iap/google/verify', auth, async (req, res) => {
    const { tier, purchaseToken } = req.body;
    const plan = PLANS.find((p) => p.tier === tier && p.google_product_id);
    if (!plan) return res.status(400).json({ error: 'Invalid or unsupported tier.' });
    if (!purchaseToken) return res.status(400).json({ error: 'purchaseToken is required.' });

    try {
      const { data, accessToken, packageName } = await verifyGoogleSubscription(plan.google_product_id, purchaseToken);
      if (!data.expiryTimeMillis) return res.status(400).json({ error: 'Google Play could not verify this subscription.' });

      const expiresAt = new Date(Number(data.expiryTimeMillis));
      if (expiresAt <= new Date()) return res.status(400).json({ error: 'This subscription has already expired.' });

      const membership = await prisma.$transaction(async (tx) => {
        const m = await tx.membership.upsert({
          where: { user_id: req.user.id },
          create: { user_id: req.user.id, tier: plan.tier, end_date: expiresAt, auto_renew: !!data.autoRenewing, google_purchase_token: purchaseToken },
          update: { tier: plan.tier, end_date: expiresAt, auto_renew: !!data.autoRenewing, google_purchase_token: purchaseToken }
        });
        await grantMonthlyBonusIfDue(tx, { userId: req.user.id, tier: plan.tier, periodEnd: expiresAt });
        return m;
      });

      // Google requires subscription purchases to be acknowledged within
      // 3 days or it auto-refunds them.
      if (data.acknowledgementState === 0) {
        acknowledgeGoogleSubscription({ packageName, subscriptionId: plan.google_product_id, purchaseToken, accessToken });
      }

      res.json({ success: true, membership });
    } catch (e) {
      console.error('Google subscription verification error:', e);
      res.status(500).json({ error: 'Unable to verify this subscription.' });
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
