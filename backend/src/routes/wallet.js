const auth = require('../middleware/auth');
const Stripe = require('stripe');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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

  // ---------- Native IAP verification (Apple / Google) ----------
  //
  // The mobile app already correctly uses react-native-iap as its primary
  // purchase path (Stripe web-checkout is only a fallback for
  // environments where native IAP isn't linked, like Expo Go) — Apple's
  // App Store Review Guidelines section 3.1.1 require digital goods
  // (coins) be sold through native IAP, not a third-party processor, so
  // that architecture is correct. What was missing entirely: these two
  // server-side verification endpoints the app calls after a native
  // purchase completes. Without them, a purchase could charge real money
  // on Apple's/Google's side and never actually credit the wallet.
  //
  // Both endpoints are idempotent via Purchase.purchase_token (unique) —
  // calling verify twice with the same receipt/token (e.g. a retry after
  // a dropped response) returns success without crediting coins again.

  async function creditWalletForPurchase({ userId, pkg, platform, purchaseToken }) {
    const existing = await prisma.purchase.findUnique({ where: { purchase_token: purchaseToken } });
    if (existing) {
      const wallet = await prisma.wallet.findUnique({ where: { user_id: userId } });
      return { alreadyProcessed: true, balance: wallet?.balance || 0, coinsAwarded: 0 };
    }

    const totalCoins = pkg.coins_amount + (pkg.bonus_coins || 0);
    const wallet = await prisma.$transaction(async (tx) => {
      await tx.purchase.create({
        data: {
          user_id: userId,
          package_id: pkg.id,
          price_paid: pkg.price_cents,
          platform,
          purchase_token: purchaseToken,
          status: 'completed',
          verified_at: new Date()
        }
      });
      const w = await tx.wallet.upsert({
        where: { user_id: userId },
        create: { user_id: userId, balance: totalCoins, lifetime_earned: totalCoins },
        update: { balance: { increment: totalCoins }, lifetime_earned: { increment: totalCoins } }
      });
      await tx.notification.create({
        data: { user_id: userId, type: 'purchase_completed', payload: { coins: totalCoins, platform } }
      }).catch(() => {});
      return w;
    });

    return { alreadyProcessed: false, balance: wallet.balance, coinsAwarded: totalCoins };
  }

  router.post('/iap/apple/verify', auth, async (req, res) => {
    const { packageId, receiptData } = req.body;
    if (!packageId || !receiptData) {
      return res.status(400).json({ error: 'packageId and receiptData are required.' });
    }
    if (!process.env.APPLE_SHARED_SECRET) {
      return res.status(503).json({ error: 'Apple in-app purchases are not configured on this server.', code: 'APPLE_IAP_NOT_CONFIGURED' });
    }

    try {
      const pkg = await prisma.coinPackage.findUnique({ where: { id: packageId } });
      if (!pkg || !pkg.is_active) return res.status(404).json({ error: 'Package not found.' });
      if (!pkg.apple_product_id) return res.status(400).json({ error: 'This package has no Apple product configured.', code: 'NO_APPLE_PRODUCT' });

      const verifyWithApple = async (url) => {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 'receipt-data': receiptData, password: process.env.APPLE_SHARED_SECRET, 'exclude-old-transactions': true })
        });
        return resp.json();
      };

      // Apple's rule, not a guess: a sandbox receipt sent to the
      // production endpoint comes back with status 21007, meaning "retry
      // this exact receipt against the sandbox endpoint instead."
      let result = await verifyWithApple('https://buy.itunes.apple.com/verifyReceipt');
      if (result.status === 21007) {
        result = await verifyWithApple('https://sandbox.itunes.apple.com/verifyReceipt');
      }
      if (result.status !== 0) {
        return res.status(400).json({ error: `Apple could not verify this receipt (status ${result.status}).`, code: 'APPLE_VERIFY_FAILED' });
      }

      const transactions = result.latest_receipt_info || result.receipt?.in_app || [];
      const matching = transactions
        .filter((t) => t.product_id === pkg.apple_product_id)
        .sort((a, b) => Number(b.purchase_date_ms) - Number(a.purchase_date_ms))[0];
      if (!matching) {
        return res.status(400).json({ error: 'No transaction for this product was found in the receipt.', code: 'NO_MATCHING_TRANSACTION' });
      }

      const result2 = await creditWalletForPurchase({
        userId: req.user.id,
        pkg,
        platform: 'ios',
        purchaseToken: matching.transaction_id
      });
      res.json({ success: true, ...result2 });
    } catch (e) {
      console.error('Apple IAP verification error:', e);
      res.status(500).json({ error: 'Unable to verify this purchase.', code: 'APPLE_VERIFY_ERROR' });
    }
  });

  async function getGooglePlayAccessToken() {
    const keyJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
    if (!keyJson) return null;
    const key = JSON.parse(keyJson);
    const now = Math.floor(Date.now() / 1000);
    const assertion = jwt.sign(
      {
        iss: key.client_email,
        scope: 'https://www.googleapis.com/auth/androidpublisher',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600
      },
      key.private_key,
      { algorithm: 'RS256' }
    );

    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })
    });
    const data = await resp.json();
    return data.access_token || null;
  }

  router.post('/iap/google/verify', auth, async (req, res) => {
    const { packageId, purchaseToken } = req.body;
    if (!packageId || !purchaseToken) {
      return res.status(400).json({ error: 'packageId and purchaseToken are required.' });
    }
    if (!process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_PLAY_PACKAGE_NAME) {
      return res.status(503).json({ error: 'Google Play in-app purchases are not configured on this server.', code: 'GOOGLE_IAP_NOT_CONFIGURED' });
    }

    try {
      const pkg = await prisma.coinPackage.findUnique({ where: { id: packageId } });
      if (!pkg || !pkg.is_active) return res.status(404).json({ error: 'Package not found.' });
      if (!pkg.google_product_id) return res.status(400).json({ error: 'This package has no Google Play product configured.', code: 'NO_GOOGLE_PRODUCT' });

      const accessToken = await getGooglePlayAccessToken();
      if (!accessToken) return res.status(503).json({ error: 'Unable to authenticate with Google Play.', code: 'GOOGLE_AUTH_FAILED' });

      const verifyUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${process.env.GOOGLE_PLAY_PACKAGE_NAME}/purchases/products/${pkg.google_product_id}/tokens/${purchaseToken}`;
      const verifyResp = await fetch(verifyUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
      const verifyData = await verifyResp.json();

      // purchaseState: 0 = purchased, 1 = canceled, 2 = pending
      if (!verifyResp.ok || verifyData.purchaseState !== 0) {
        return res.status(400).json({ error: 'Google Play could not verify this purchase.', code: 'GOOGLE_VERIFY_FAILED' });
      }

      const result2 = await creditWalletForPurchase({ userId: req.user.id, pkg, platform: 'android', purchaseToken });

      // Google requires purchases to be acknowledged within 3 days or it
      // auto-refunds them — fire-and-forget so a slow/failed ack never
      // blocks the coins already being credited above.
      fetch(`${verifyUrl}:acknowledge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }).catch((err) => console.error('Google Play purchase acknowledgment failed:', err.message));

      res.json({ success: true, ...result2 });
    } catch (e) {
      console.error('Google IAP verification error:', e);
      res.status(500).json({ error: 'Unable to verify this purchase.', code: 'GOOGLE_VERIFY_ERROR' });
    }
  });

  // Kept as a compatibility endpoint. It never grants coins directly.
  router.post('/purchase', auth, async (req, res) => {
    return res.status(410).json({ error: 'Direct wallet credits are disabled. Use /wallet/checkout.' });
  });

  // ---------- Withdrawals ----------
  //
  // This is a real, complete withdrawal REQUEST and APPROVAL system —
  // balance validation, atomic hold-on-request, admin review, refund on
  // rejection, audit logging. What it deliberately does NOT do is move
  // real money anywhere: no payout provider (PayPal Payouts, Stripe
  // Connect, etc) is configured or invented here. "paid" only records
  // that an admin confirms they sent the money through whatever channel
  // the business actually uses outside this app. Wiring a real payout API
  // is a separate integration.
  //
  // The exchange rate and minimum are placeholder business parameters —
  // pick real ones deliberately, ideally admin-configurable, before using
  // this for real payouts.
  const COIN_TO_USD_CENTS = 1; // 100 coins = $1.00
  const MIN_WITHDRAWAL_COINS = 5000; // $50 minimum

  router.get('/withdrawal-info', auth, async (req, res) => {
    try {
      const wallet = await ensureWallet(prisma, req.user.id);
      res.json({
        balance: wallet.balance,
        minWithdrawalCoins: MIN_WITHDRAWAL_COINS,
        coinToUsdCents: COIN_TO_USD_CENTS,
        availableForWithdrawalUsd: ((wallet.balance * COIN_TO_USD_CENTS) / 100).toFixed(2)
      });
    } catch (e) {
      res.status(500).json({ error: 'Unable to load withdrawal info.' });
    }
  });

  router.post('/withdraw', auth, async (req, res) => {
    const coinsAmount = Number(req.body.coinsAmount);
    const payoutMethod = ['paypal', 'bank_transfer', 'other'].includes(req.body.payoutMethod) ? req.body.payoutMethod : null;
    const payoutDetails = String(req.body.payoutDetails || '').trim().slice(0, 500);

    if (!Number.isInteger(coinsAmount) || coinsAmount < MIN_WITHDRAWAL_COINS) {
      return res.status(400).json({ error: `Minimum withdrawal is ${MIN_WITHDRAWAL_COINS} coins ($${(MIN_WITHDRAWAL_COINS * COIN_TO_USD_CENTS / 100).toFixed(2)}).`, code: 'BELOW_MINIMUM' });
    }
    if (!payoutMethod || !payoutDetails) {
      return res.status(400).json({ error: 'A payout method and payout details are required.', code: 'INVALID_PAYOUT_INFO' });
    }

    try {
      // Coins are held (deducted immediately) rather than just checked,
      // so the same balance can never be withdrawn twice or spent on a
      // gift while this request is pending review.
      const withdrawal = await prisma.$transaction(async (tx) => {
        const debit = await tx.wallet.updateMany({
          where: { user_id: req.user.id, balance: { gte: coinsAmount } },
          data: { balance: { decrement: coinsAmount } }
        });
        if (debit.count !== 1) {
          throw Object.assign(new Error('Insufficient balance.'), { statusCode: 402, code: 'INSUFFICIENT_BALANCE' });
        }
        return tx.withdrawal.create({
          data: {
            user_id: req.user.id,
            coins_amount: coinsAmount,
            usd_cents: Math.floor(coinsAmount * COIN_TO_USD_CENTS),
            payout_method: payoutMethod,
            payout_details: payoutDetails
          }
        });
      });

      res.status(201).json(withdrawal);
    } catch (e) {
      const status = e.statusCode || 500;
      if (status >= 500) console.error('Withdrawal request error:', e);
      res.status(status).json({
        error: status === 500 ? 'Unable to submit withdrawal request.' : e.message,
        code: e.code || 'WITHDRAW_FAILED'
      });
    }
  });

  router.get('/withdrawals', auth, async (req, res) => {
    try {
      const withdrawals = await prisma.withdrawal.findMany({
        where: { user_id: req.user.id },
        orderBy: { requested_at: 'desc' },
        take: 50
      });
      res.json(withdrawals);
    } catch (e) {
      res.status(500).json({ error: 'Unable to load withdrawal history.' });
    }
  });

  return router;
};
