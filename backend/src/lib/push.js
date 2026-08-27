// backend/src/lib/push.js
//
// Uses Expo's push notification service directly over HTTPS
// (https://exp.host/--/api/v2/push/send) — this is the same service
// `expo-notifications` on the client is built to receive from, and it
// fans out to real APNs/FCM behind the scenes. No SDK needed, just POSTs
// with Expo push tokens (the "ExponentPushToken[...]" strings the mobile
// app registers via POST /users/me/push-token).

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Sends a push notification to every device a user has registered.
 * Never throws — a failed push should never break the real action (a
 * new message, a match, a gift) that triggered it. Tokens Expo reports
 * as permanently invalid (DeviceNotRegistered — app uninstalled, token
 * rotated) are pruned so they stop being retried forever.
 */
async function sendPushToUser(prisma, userId, { title, body, data } = {}) {
  try {
    const tokens = await prisma.pushToken.findMany({ where: { user_id: userId }, select: { id: true, token: true } });
    if (tokens.length === 0) return;

    const messages = tokens.map((t) => ({
      to: t.token,
      title,
      body,
      data: data || {},
      sound: 'default'
    }));

    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages)
    });
    const result = await res.json();

    const invalidTokenIds = [];
    (result.data || []).forEach((ticket, i) => {
      if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
        invalidTokenIds.push(tokens[i].id);
      }
    });
    if (invalidTokenIds.length > 0) {
      await prisma.pushToken.deleteMany({ where: { id: { in: invalidTokenIds } } });
    }
  } catch (e) {
    console.error(`Push notification failed for user ${userId}:`, e.message);
  }
}

module.exports = { sendPushToUser };
