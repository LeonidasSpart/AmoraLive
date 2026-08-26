// backend/src/routes/googleRtdn.js
//
// Google Play Real-time Developer Notifications: Google publishes a
// message to a Pub/Sub topic on every subscription lifecycle event
// (renewed, cancelled, expired, revoked, paused, etc), and Pub/Sub push
// delivers it here as an HTTP POST. Without this, a membership only ever
// updates when the person happens to reopen the app and the client
// re-verifies — someone who renews in the background and never reopens
// the app would silently fall back to "Free" the moment their locally
// cached end_date passes, even though Google actually renewed them.
//
// Setup required outside this code: a Pub/Sub topic configured in Google
// Play Console → Monetization setup → Real-time developer notifications,
// with a push subscription pointing at POST /webhooks/google-rtdn, and
// "Enable authentication" turned on for that push subscription (this is
// what makes the OIDC token below present and verifiable — without it,
// this endpoint would have no way to confirm a request actually came
// from Google's Pub/Sub infrastructure rather than anyone who found the
// URL).

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { verifyGoogleSubscription, acknowledgeGoogleSubscription } = require('../lib/iapVerification');
const { grantMonthlyBonusIfDue } = require('../lib/membership');

const GOOGLE_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

// Simple in-memory JWKS cache — avoids re-fetching Google's public keys on
// every single notification. No new dependency needed: Node's built-in
// crypto.createPublicKey has accepted JWK-format keys directly (format:
// 'jwk') since Node 12, so the raw JSON from Google's certs endpoint can
// be turned into a usable public key without a PEM-conversion library.
let jwksCache = { keys: [], fetchedAt: 0 };
const JWKS_CACHE_MS = 6 * 60 * 60 * 1000;

async function getGooglePublicKey(kid) {
  if (Date.now() - jwksCache.fetchedAt > JWKS_CACHE_MS) {
    const resp = await fetch(GOOGLE_JWKS_URI);
    if (!resp.ok) throw new Error('Unable to fetch Google public keys');
    const data = await resp.json();
    jwksCache = { keys: data.keys || [], fetchedAt: Date.now() };
  }

  const jwk = jwksCache.keys.find((k) => k.kid === kid);
  if (!jwk) throw new Error(`No matching Google public key for kid=${kid}`);

  return crypto.createPublicKey({ key: jwk, format: 'jwk' }).export({ type: 'spki', format: 'pem' });
}

// Standard RS256-against-JWKS verification — this is the same mechanism
// most Google-issued OIDC tokens use, and is on much firmer ground than
// Apple's custom X.509 chain format below: Google's certs endpoint and
// issuer are stable, well-documented values.
async function verifyGoogleOidcToken(token, expectedAudience) {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded?.header?.kid) throw new Error('Token has no key id');

  const publicKeyPem = await getGooglePublicKey(decoded.header.kid);
  const payload = jwt.verify(token, publicKeyPem, { algorithms: ['RS256'] });

  if (!GOOGLE_ISSUERS.includes(payload.iss)) throw new Error(`Unexpected issuer: ${payload.iss}`);
  if (expectedAudience && payload.aud !== expectedAudience) throw new Error('Audience mismatch');

  return payload;
}

// notificationType values, per Google's RTDN reference:
// https://developer.android.com/google/play/billing/rtdn-reference
const RENEWAL_TYPES = new Set([2 /* RENEWED */, 4 /* PURCHASED */, 7 /* RESTARTED */]);
const TERMINAL_TYPES = new Set([3 /* CANCELED */, 12 /* REVOKED */, 13 /* EXPIRED */]);

module.exports = (prisma) => {
  const router = require('express').Router();

  router.post('/', async (req, res) => {
    // Acknowledge Pub/Sub immediately once the message is structurally
    // valid — Pub/Sub retries aggressively on anything but a fast 2xx,
    // and retried processing is already idempotent below, so there's no
    // reason to make Google's push worker wait on our processing time.
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!token) {
        console.error('Google RTDN: missing Authorization header — rejecting.');
        return res.status(401).send('Unauthorized');
      }

      if (!process.env.GOOGLE_RTDN_AUDIENCE) {
        console.error('Google RTDN: GOOGLE_RTDN_AUDIENCE is not configured — refusing to process notifications without an audience to check.');
        return res.status(503).send('Not configured');
      }

      await verifyGoogleOidcToken(token, process.env.GOOGLE_RTDN_AUDIENCE);

      const messageData = req.body?.message?.data;
      if (!messageData) return res.status(400).send('No message data');

      const decoded = JSON.parse(Buffer.from(messageData, 'base64').toString('utf8'));
      res.status(200).send('OK'); // ack before processing, per above

      const sub = decoded.subscriptionNotification;
      if (!sub) return; // one-time product notifications aren't relevant to memberships

      await handleSubscriptionNotification(prisma, sub);
    } catch (e) {
      console.error('Google RTDN processing error:', e.message);
      if (!res.headersSent) res.status(400).send('Bad request');
    }
  });

  return router;
};

async function handleSubscriptionNotification(prisma, sub) {
  const { subscriptionId, purchaseToken, notificationType } = sub;

  const membership = await prisma.membership.findFirst({ where: { google_purchase_token: purchaseToken } });
  if (!membership) {
    // Not necessarily an error — could be a notification for a purchase
    // that hasn't completed its first client-side verify yet.
    console.warn(`Google RTDN: no membership found for purchaseToken (subscriptionId=${subscriptionId})`);
    return;
  }

  if (TERMINAL_TYPES.has(notificationType)) {
    await prisma.membership.update({ where: { id: membership.id }, data: { auto_renew: false } });
    return;
  }

  if (!RENEWAL_TYPES.has(notificationType)) return; // PAUSED, ON_HOLD, etc — no membership-state action needed here

  try {
    const { data, accessToken, packageName } = await verifyGoogleSubscription(subscriptionId, purchaseToken);
    if (!data.expiryTimeMillis) return;

    const expiresAt = new Date(Number(data.expiryTimeMillis));
    const plan = { tier: membership.tier }; // tier doesn't change on renewal, only the expiry does

    await prisma.$transaction(async (tx) => {
      await tx.membership.update({
        where: { id: membership.id },
        data: { end_date: expiresAt, auto_renew: !!data.autoRenewing }
      });
      await grantMonthlyBonusIfDue(tx, { userId: membership.user_id, tier: plan.tier, periodEnd: expiresAt });
    });

    if (data.acknowledgementState === 0) {
      acknowledgeGoogleSubscription({ packageName, subscriptionId, purchaseToken, accessToken });
    }
  } catch (e) {
    console.error('Google RTDN: failed to re-verify subscription:', e.message);
  }
}
