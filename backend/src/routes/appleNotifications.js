// backend/src/routes/appleNotifications.js
//
// Apple App Store Server Notifications V2: Apple POSTs a signed payload
// here on every subscription lifecycle event (renewed, cancelled,
// expired, refunded, etc). Same motivation as googleRtdn.js — without
// this, a membership only updates when the person happens to reopen the
// app and the client re-verifies its receipt.
//
// Setup required outside this code: register this endpoint's URL in App
// Store Connect → your app → App Information → App Store Server
// Notifications, both Production and Sandbox URLs.
//
// ---- On the certificate verification below, read this before relying on it ----
// Apple signs each payload as a JWS with an x5c certificate chain in the
// header (leaf -> intermediate -> Apple root CA). This code verifies:
//   1. The chain is cryptographically well-formed (each cert is actually
//      signed by the next one up) — via Node's built-in
//      crypto.X509Certificate, no new dependency.
//   2. The JWS signature itself is valid against the leaf cert's public
//      key — via jsonwebtoken, ES256.
//   3. The chain's root anchors to the specific certificate fingerprint
//      in APPLE_ROOT_CA_FINGERPRINT.
// Step 3 is the one piece I cannot fully guarantee without live testing
// against Apple's actual notification traffic: I have not hardcoded a
// fingerprint, specifically so this never runs with a false sense of
// security from a value I wasn't certain of. Get the real one from
// Apple's certificate authority page (https://www.apple.com/certificateauthority/)
// — the "Apple Root CA - G3" certificate used for App Store Server
// Notifications — compute its SHA-256 fingerprint, and set it as
// APPLE_ROOT_CA_FINGERPRINT. Until that's set, this endpoint refuses to
// process anything (fails closed, not open) rather than silently
// skipping the one check that actually anchors trust to Apple.

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { grantMonthlyBonusIfDue } = require('../lib/membership');

function decodeJwsHeader(jws) {
  const [headerB64] = jws.split('.');
  return JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
}

function verifyAppleSignedPayload(jws) {
  const header = decodeJwsHeader(jws);
  const x5c = header.x5c;
  if (!Array.isArray(x5c) || x5c.length < 2) throw new Error('Missing or incomplete certificate chain');

  const certs = x5c.map((c) => new crypto.X509Certificate(Buffer.from(c, 'base64')));

  // Each certificate must be signed by the next one up the chain.
  for (let i = 0; i < certs.length - 1; i++) {
    if (!certs[i].verify(certs[i + 1].publicKey)) {
      throw new Error(`Certificate chain broken at position ${i}`);
    }
  }

  const expectedFingerprint = process.env.APPLE_ROOT_CA_FINGERPRINT;
  if (!expectedFingerprint) {
    throw new Error('APPLE_ROOT_CA_FINGERPRINT is not configured — refusing to trust an unpinned certificate chain');
  }
  const root = certs[certs.length - 1];
  const actualFingerprint = root.fingerprint256.replace(/:/g, '').toLowerCase();
  if (actualFingerprint !== expectedFingerprint.replace(/:/g, '').toLowerCase()) {
    throw new Error('Certificate chain does not anchor to the configured Apple root CA');
  }

  const leafPem = certs[0].publicKey.export({ type: 'spki', format: 'pem' });
  return jwt.verify(jws, leafPem, { algorithms: ['ES256'] });
}

const RENEWAL_TYPES = new Set(['DID_RENEW']);
const DISABLE_AUTO_RENEW_TYPES = new Set(['EXPIRED', 'GRACE_PERIOD_EXPIRED']);
const IMMEDIATE_END_TYPES = new Set(['REFUND', 'REVOKE']);

module.exports = (prisma) => {
  const router = require('express').Router();

  router.post('/', async (req, res) => {
    try {
      const signedPayload = req.body?.signedPayload;
      if (!signedPayload) return res.status(400).send('Missing signedPayload');

      const notification = verifyAppleSignedPayload(signedPayload);
      res.status(200).send('OK'); // ack immediately, same reasoning as googleRtdn.js

      const notificationType = notification.notificationType;
      const signedTransactionInfo = notification.data?.signedTransactionInfo;
      if (!signedTransactionInfo) return;

      // signedTransactionInfo is itself a separately-signed JWS with its
      // own x5c chain — verify it the same way rather than trusting it
      // just because it arrived inside an already-verified envelope.
      const transaction = verifyAppleSignedPayload(signedTransactionInfo);
      await handleAppleNotification(prisma, notificationType, transaction);
    } catch (e) {
      console.error('Apple notification processing error:', e.message);
      if (!res.headersSent) res.status(400).send('Bad request');
    }
  });

  return router;
};

async function handleAppleNotification(prisma, notificationType, transaction) {
  const originalTransactionId = transaction.originalTransactionId;
  if (!originalTransactionId) return;

  const membership = await prisma.membership.findFirst({ where: { apple_original_transaction_id: originalTransactionId } });
  if (!membership) {
    console.warn(`Apple notification: no membership found for originalTransactionId=${originalTransactionId}`);
    return;
  }

  if (IMMEDIATE_END_TYPES.has(notificationType)) {
    await prisma.membership.update({ where: { id: membership.id }, data: { end_date: new Date(), auto_renew: false } });
    return;
  }

  if (DISABLE_AUTO_RENEW_TYPES.has(notificationType)) {
    await prisma.membership.update({ where: { id: membership.id }, data: { auto_renew: false } });
    return;
  }

  if (!RENEWAL_TYPES.has(notificationType)) return; // DID_CHANGE_RENEWAL_STATUS etc — no state change needed from the transaction alone

  if (!transaction.expiresDate) return;
  const expiresAt = new Date(Number(transaction.expiresDate));

  await prisma.$transaction(async (tx) => {
    await tx.membership.update({ where: { id: membership.id }, data: { end_date: expiresAt, auto_renew: true } });
    await grantMonthlyBonusIfDue(tx, { userId: membership.user_id, tier: membership.tier, periodEnd: expiresAt });
  });
}
