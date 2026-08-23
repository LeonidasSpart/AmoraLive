// backend/src/lib/membership.js
const TIER_RANK = { free: 0, premium: 1, vip: 2, svip: 3 };

// Coins granted once per successful billing period for VIP/SVIP — the
// "Bonus coins monthly" benefit advertised in membership.js's PLANS list.
// Premium and free get none.
const MONTHLY_BONUS_COINS = { vip: 1000, svip: 3000 };

function tierRank(tier) {
  return TIER_RANK[tier] ?? 0;
}

function meetsMinTier(userTier, minTier) {
  return tierRank(userTier) >= tierRank(minTier);
}

/**
 * Grants the monthly bonus for a Membership row if this billing period
 * hasn't already been paid out. Call this inside the same transaction
 * that's already updating the Membership row from a Stripe webhook event.
 * Idempotent per period_end — safe against Stripe's at-least-once webhook
 * delivery redelivering the same event.
 */
async function grantMonthlyBonusIfDue(tx, { userId, tier, periodEnd }) {
  const bonus = MONTHLY_BONUS_COINS[tier];
  if (!bonus) return null;

  const membership = await tx.membership.findUnique({ where: { user_id: userId } });
  if (membership?.last_bonus_period_end && membership.last_bonus_period_end.getTime() === periodEnd.getTime()) {
    return null; // already paid out for this exact billing period
  }

  await tx.wallet.upsert({
    where: { user_id: userId },
    create: { user_id: userId, balance: bonus, lifetime_earned: bonus },
    update: { balance: { increment: bonus }, lifetime_earned: { increment: bonus } }
  });
  await tx.membership.update({ where: { user_id: userId }, data: { last_bonus_period_end: periodEnd } });
  await tx.notification.create({
    data: { user_id: userId, type: 'membership_bonus', payload: { tier, coins: bonus } }
  });

  return bonus;
}

module.exports = { TIER_RANK, MONTHLY_BONUS_COINS, tierRank, meetsMinTier, grantMonthlyBonusIfDue };
