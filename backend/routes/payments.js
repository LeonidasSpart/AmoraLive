const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { pool } = require('../db');
const { authenticate } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Coin packages
const COIN_PACKAGES = [
  { id: 'coins_100', coins: 100, price: 99, name: '100 Coins' },
  { id: 'coins_500', coins: 500, price: 499, name: '500 Coins' },
  { id: 'coins_1000', coins: 1000, price: 999, name: '1,000 Coins' },
  { id: 'coins_5000', coins: 5000, price: 4999, name: '5,000 Coins' },
  { id: 'coins_10000', coins: 10000, price: 9999, name: '10,000 Coins' },
];

// VIP packages
const VIP_PACKAGES = [
  { id: 'vip_1', level: 1, name: 'VIP Bronze', price: 499, duration_days: 30 },
  { id: 'vip_2', level: 2, name: 'VIP Silver', price: 999, duration_days: 30 },
  { id: 'vip_3', level: 3, name: 'VIP Gold', price: 1999, duration_days: 30 },
  { id: 'vip_4', level: 4, name: 'VIP Platinum', price: 4999, duration_days: 30 },
];

// Get packages
router.get('/packages', (req, res) => {
  res.json({
    coinPackages: COIN_PACKAGES,
    vipPackages: VIP_PACKAGES,
  });
});

// Create payment intent for coins
router.post('/create-coin-intent', authenticate, async (req, res, next) => {
  try {
    const { packageId } = req.body;
    const pkg = COIN_PACKAGES.find(p => p.id === packageId);

    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.price,
      currency: 'usd',
      metadata: {
        userId: req.user.id,
        type: 'coins',
        packageId: pkg.id,
        coins: pkg.coins,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      package: pkg,
    });
  } catch (err) {
    next(err);
  }
});

// Create payment intent for VIP
router.post('/create-vip-intent', authenticate, async (req, res, next) => {
  try {
    const { packageId } = req.body;
    const pkg = VIP_PACKAGES.find(p => p.id === packageId);

    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.price,
      currency: 'usd',
      metadata: {
        userId: req.user.id,
        type: 'vip',
        packageId: pkg.id,
        vipLevel: pkg.level,
        durationDays: pkg.duration_days,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      package: pkg,
    });
  } catch (err) {
    next(err);
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { userId, type, coins, vipLevel, durationDays } = paymentIntent.metadata;

      if (type === 'coins') {
        await pool.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [parseInt(coins), userId]);
      } else if (type === 'vip') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(durationDays));
        await pool.query(
          'UPDATE users SET vip_level = $1, vip_expires_at = $2 WHERE id = $3',
          [parseInt(vipLevel), expiresAt, userId]
        );
      }

      // Record transaction
      await pool.query(
        `INSERT INTO payment_transactions (id, user_id, stripe_payment_intent_id, amount, currency, type, status, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'completed', $7, NOW())`,
        [uuidv4(), userId, paymentIntent.id, paymentIntent.amount, paymentIntent.currency, type, JSON.stringify(paymentIntent.metadata)]
      );
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

// Get transaction history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT * FROM payment_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({ transactions: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
