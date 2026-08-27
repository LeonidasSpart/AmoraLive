// backend/src/lib/xp.js
//
// The client never sends XP, level, or a "level up" — every number here is
// computed from the database inside whatever transaction the earning
// action (going live, receiving a gift, finishing a battle) is already
// running in. This file has no route handlers of its own; it's called
// from inside live.js, gifts.js, and battles.js.

// XP needed to go from `level` to `level + 1`. A gently growing curve —
// level 0→1 costs 100, level 9→10 costs 550, level 29→30 costs 1550. Tune
// here only; nothing else needs to change since level is always derived
// from total XP, never stored as the source of truth for progression math.
function xpForLevel(level) {
  return 100 + level * 50;
}

function computeLevel(totalXp) {
  let level = 0;
  let remaining = Math.max(0, totalXp);
  let needed = xpForLevel(0);
  while (remaining >= needed) {
    remaining -= needed;
    level++;
    needed = xpForLevel(level);
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: needed, progressPct: Math.min(100, Math.round((remaining / needed) * 100)) };
}

// Level milestones that also grant a profile badge. Badges are additive
// (never removed), matching User.badges being a plain string array.
const LEVEL_BADGES = { 5: 'Rising Star', 10: 'Established Creator', 25: 'Veteran Creator', 50: 'Elite Creator', 100: 'Legendary Creator' };

/**
 * Award XP inside an existing Prisma transaction. Returns what changed so
 * the calling route (which has `io`) can broadcast a level-up event after
 * the transaction commits — this function itself never touches sockets.
 *
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {{ userId: string, amount: number, reason: string, metadata?: object, dailyCap?: number }} opts
 */
async function awardXp(tx, { userId, amount, reason, metadata, dailyCap }) {
  if (!Number.isFinite(amount) || amount <= 0) return null;

  if (dailyCap) {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);

    // Serialize concurrent XP awards for the same user+reason so the
    // daily-cap check below can't be raced by two callers (e.g. two
    // different senders gifting the same live host at nearly the same
    // time) each reading "under cap" before either has committed. The
    // lock is scoped to this transaction and releases automatically
    // when it commits or rolls back.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`${userId}:${reason}`}))`;

    const earnedToday = await tx.xpTransaction.aggregate({
      where: { user_id: userId, reason, created_at: { gte: since } },
      _sum: { amount: true }
    });
    const already = earnedToday._sum.amount || 0;
    if (already >= dailyCap) return null; // cap reached — no XP, no log row
    amount = Math.min(amount, dailyCap - already);
  }

  const user = await tx.user.findUnique({ where: { id: userId }, select: { xp: true, level: true, badges: true } });
  if (!user) return null;

  const newTotalXp = user.xp + amount;
  const { level: newLevel } = computeLevel(newTotalXp);
  const leveledUp = newLevel > user.level;

  const newBadge = leveledUp ? LEVEL_BADGES[newLevel] : null;
  const badges = newBadge && !user.badges.includes(newBadge) ? [...user.badges, newBadge] : user.badges;

  await tx.user.update({
    where: { id: userId },
    data: { xp: newTotalXp, level: newLevel, badges }
  });

  await tx.xpTransaction.create({
    data: { user_id: userId, amount, reason, metadata: metadata || undefined }
  });

  if (leveledUp) {
    await tx.notification.create({
      data: { user_id: userId, type: 'level_up', payload: { newLevel, oldLevel: user.level, badge: newBadge } }
    });
  }

  return { amountAwarded: amount, newXp: newTotalXp, oldLevel: user.level, newLevel, leveledUp, newBadge };
}

module.exports = { xpForLevel, computeLevel, awardXp };
