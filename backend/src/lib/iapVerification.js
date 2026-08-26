// backend/src/lib/iapVerification.js
//
// Shared Apple/Google verification helpers. Originally these lived only
// inside routes/iap.js for one-time coin purchases — extracted here so
// the subscription verification in routes/membership.js can reuse the
// exact same, already-correct logic instead of a second copy that could
// drift out of sync with it.

const jwt = require('jsonwebtoken');

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
  await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } })
    .catch((err) => console.error('Google purchase acknowledge failed:', err.message));
}

// Subscriptions use a different Android Publisher endpoint from one-time
// products (purchases.subscriptions, not purchases.products) — separate
// response shape: expiryTimeMillis, autoRenewing, paymentState instead of
// purchaseState.
async function verifyGoogleSubscription(subscriptionId, purchaseToken) {
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME;
  if (!packageName) throw new Error('Google Play verification is not configured');

  const accessToken = await getGoogleAccessToken();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Google Play subscription lookup failed');
  return { data, accessToken, packageName };
}

async function acknowledgeGoogleSubscription({ packageName, subscriptionId, purchaseToken, accessToken }) {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}:acknowledge`;
  await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } })
    .catch((err) => console.error('Google subscription acknowledge failed:', err.message));
}

module.exports = {
  verifyAppleReceipt,
  getGoogleAccessToken,
  verifyGooglePurchase,
  acknowledgeGooglePurchase,
  verifyGoogleSubscription,
  acknowledgeGoogleSubscription
};
