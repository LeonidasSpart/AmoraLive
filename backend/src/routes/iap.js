// backend/src/routes/iap.js
//
// Server-side verification for Apple App Store and Google Play in-app
// purchases. Coins are only ever credited here, after Apple/Google's own
// servers confirm the purchase is real — never trusted from the client.
// Mirrors the same idempotent credit-wallet pattern used by the Stripe
// webhook in index.js: look up (or create) a Purchase row keyed by a
// unique, platform-issued transaction identifier, skip if already
// completed, credit inside a transaction, mark completed.

const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const APPLE_VERIFY_PROD = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_VERIFY_SANDBOX = 'https://sandbox.itunes.apple.com/verifyReceipt';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

async function verifyAppleReceipt(receiptData) {
  const body = {
    'receipt-data': receiptData,
    password: process.env.APPLE_SHARED_SECRET || undefined,
    'exclude-old-transactions': true
  };

  const call = (url) => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then((r) => r.json());

  let result = await call(APPLE_VERIFY_PROD);

  // 21007: this receipt is from the sandbox environment but was sent to
  // the production endpoint — retry against sandbox. This lets the exact
  // same client code work for TestFlight/sandbox testers and real users.
  if (result.status === 21007) {
    result = await call(APPLE_VERIFY_SANDBOX);
  }

  return result;
}

function googleServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    console.error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON');
    return null;
  }
}

async function getGoogleAccessToken() {
  const account = googleServiceAccount();
  if (!account?.client_email || !account?.private_key) {
    throw new Error('Google Play verification is not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: account.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600
    },
    account.private_key,
    { algorithm: 'RS256' }
  );

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || 'Unable to authenticate with Google Play');
  }
  return data.access_token;
}

async function verifyGooglePurchase(productId, purchaseToken) {
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME;
  if (!packageName) throw new Error('Google Play verification is not configured');

  const accessToken = await getGoogleAccessToken();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Google Play purchase lookup failed');
  return { data, accessToken, packageName };
}

async function acknowledgeGooglePurchase({ packageName, productId, purchaseToken, accessToken }) {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}:acknowledge`;
  // Best-effort: Google auto-refunds unacknowledged purchases after 3 days,
  // but a failure here shouldn't undo coins we already credited — log and
  // move on rather than throwing.
  await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } })
    .catch((err) => console.error('Google purchase acknowledge failed:', err.message));
}

module.exports = (prisma) => {
  const router = require('express').Router();

  async function creditPurchase({ userId, pkg, platform, transactionToken, priceCents }) {
    // Unique-constraint on purchase_token is the hard backstop against
    // double-crediting; this upfront check just avoids doing wallet math
    // twice for an already-completed purchase.
    const existing = await prisma.purchase.findUnique({ where: { purchase_token: transactionToken } });
    if (existing?.status === 'completed') {
      return { alreadyProcessed: true, purchase: existing };
    }

    const coins = pkg.coins_amount + pkg.bonus_coins;

    const purchase = await prisma.$transaction(async (tx) => {
      const record = existing
        ? await tx.purchase.update({
            where: { purchase_token: transactionToken },
            data: { status: 'completed', verified_at: new Date() }
          })
        : await tx.purchase.create({
            data: {
              user_id: userId,
              package_id: pkg.id,
              price_paid: priceCents ?? pkg.price_cents,
              platform,
              purchase_token: transactionToken,
              status: 'completed',
              verified_at: new Date()
            }
          });

      await tx.wallet.upsert({ where: { user_id: userId }, create: { user_id: userId }, update: {} });
      await tx.wallet.update({
        where: { user_id: userId },
        data: { balance: { increment: coins }, lifetime_earned: { increment: coins } }
      });

      return record;
    });

    return { alreadyProcessed: false, purchase, coins };
  }

  // ---------- Apple App Store ----------
  router.post('/apple/verify', auth, async (req, res) => {
    const { packageId, receiptData } = req.body;
    if (!packageId || !receiptData) {
      return res.status(400).json({ error: 'packageId and receiptData are required.' });
    }

    try {
      const pkg = await prisma.coinPackage.findUnique({ where: { id: packageId } });
      if (!pkg || !pkg.is_active || !pkg.apple_product_id) {
        return res.status(404).json({ error: 'Package not available on iOS.' });
      }

      const result = await verifyAppleReceipt(receiptData);
      if (result.status !== 0) {
        return res.status(400).json({ error: `Apple could not verify this receipt (status ${result.status}).` });
      }

      // Prefer latest_receipt_info (present on modern receipts) and fall
      // back to the receipt's in_app array for older/simple receipts.
      const transactions = result.latest_receipt_info || result.receipt?.in_app || [];
      const match = transactions
        .filter((t) => t.product_id === pkg.apple_product_id)
        .sort((a, b) => Number(b.purchase_date_ms) - Number(a.purchase_date_ms))[0];

      if (!match) {
        return res.status(400).json({ error: 'This receipt does not contain a purchase for this package.' });
      }

      const { alreadyProcessed, purchase, coins } = await creditPurchase({
        userId: req.user.id,
        pkg,
        platform: 'ios',
        transactionToken: match.transaction_id,
        priceCents: pkg.price_cents
      });

      const wallet = await prisma.wallet.findUnique({ where: { user_id: req.user.id } });
      res.json({
        success: true,
        alreadyProcessed,
        coinsCredited: alreadyProcessed ? 0 : coins,
        balance: wallet?.balance || 0,
        purchaseId: purchase.id
      });
    } catch (e) {
      console.error('Apple IAP verification error:', e);
      res.status(500).json({ error: 'Unable to verify this purchase right now.' });
    }
  });

  // ---------- Google Play ----------
  router.post('/google/verify', auth, async (req, res) => {
    const { packageId, purchaseToken } = req.body;
    if (!packageId || !purchaseToken) {
      return res.status(400).json({ error: 'packageId and purchaseToken are required.' });
    }

    try {
      const pkg = await prisma.coinPackage.findUnique({ where: { id: packageId } });
      if (!pkg || !pkg.is_active || !pkg.google_product_id) {
        return res.status(404).json({ error: 'Package not available on Android.' });
      }

      const { data, accessToken, packageName } = await verifyGooglePurchase(pkg.google_product_id, purchaseToken);

      // purchaseState: 0 = purchased, 1 = cancelled, 2 = pending
      if (data.purchaseState !== 0) {
        return res.status(400).json({ error: 'This purchase has not completed on Google Play yet.' });
      }

      const { alreadyProcessed, purchase, coins } = await creditPurchase({
        userId: req.user.id,
        pkg,
        platform: 'android',
        transactionToken: purchaseToken,
        priceCents: pkg.price_cents
      });

      if (!alreadyProcessed && data.acknowledgementState === 0) {
        await acknowledgeGooglePurchase({ packageName, productId: pkg.google_product_id, purchaseToken, accessToken });
      }

      const wallet = await prisma.wallet.findUnique({ where: { user_id: req.user.id } });
      res.json({
        success: true,
        alreadyProcessed,
        coinsCredited: alreadyProcessed ? 0 : coins,
        balance: wallet?.balance || 0,
        purchaseId: purchase.id
      });
    } catch (e) {
      console.error('Google IAP verification error:', e);
      res.status(500).json({ error: 'Unable to verify this purchase right now.' });
    }
  });

  return router;
};
