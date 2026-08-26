// backend/src/routes/iap.js
//
// Server-side verification for Apple App Store and Google Play in-app
// purchases. Coins are only ever credited here, after Apple/Google's own
// servers confirm the purchase is real — never trusted from the client.
// Mirrors the same idempotent credit-wallet pattern used by the Stripe
// webhook in index.js: look up (or create) a Purchase row keyed by a
// unique, platform-issued transaction identifier, skip if already
// completed, credit inside a transaction, mark completed.

const auth = require('../middleware/auth');
const { verifyAppleReceipt, verifyGooglePurchase, acknowledgeGooglePurchase } = require('../lib/iapVerification');

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
