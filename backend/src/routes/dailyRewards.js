// backend/src/routes/dailyRewards.js
//
// Server-side only. The client never sends a reward amount, a streak
// number, or a "day" — it only ever calls POST /claim with no body, and
// every number in the response is computed here from the database.
//
// Timezone safety: "today" is always the current UTC calendar date at
// midnight, and streak continuation is decided by comparing calendar days
// (last_claim_date === yesterday) rather than a rolling 24h window. That
// avoids the classic bug where claiming at 11:59pm and then again at
// 12:01am either double-counts or unfairly breaks the streak depending on
// the user's local clock.

const auth = require('../middleware/auth');

// 7-day reward cycle, coins per day. Day 7 is intentionally the "7-day
// milestone reward" called for in the spec — it's just built into the
// cycle rather than tracked as a separate flag. Every 30th day of an
// unbroken streak, MILESTONE_30_BONUS is added on top of that day's normal
// reward.
const DAILY_REWARDS = [100, 150, 200, 250, 300, 400, 1000];
const MILESTONE_30_BONUS = 10000;

function utcMidnight(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysBetween(a, b) {
  return Math.round((utcMidnight(a).getTime() - utcMidnight(b).getTime()) / 86400000);
}

function rewardForDay(dayInCycle) {
  return DAILY_REWARDS[(dayInCycle - 1) % 7] ?? DAILY_REWARDS[0];
}

module.exports = (prisma) => {
  const router = require('express').Router();

  async function getOrCreateStatus(userId) {
    return prisma.dailyRewardStatus.upsert({
      where: { user_id: userId },
      create: { user_id: userId },
      update: {}
    });
  }

  // What the *next* claim would look like, without claiming — used both by
  // GET /status for the "next reward preview" and to compute today's
  // reward inside the claim transaction itself, so the two can never drift.
  function previewNextClaim(status) {
    const today = utcMidnight();
    const alreadyClaimedToday = status.last_claim_date && daysBetween(today, status.last_claim_date) === 0;
    const continuesStreak = status.last_claim_date && daysBetween(today, status.last_claim_date) === 1;
    const nextStreak = alreadyClaimedToday
      ? status.current_streak
      : continuesStreak
        ? status.current_streak + 1
        : 1;
    const dayInCycle = ((nextStreak - 1) % 7) + 1;
    const coins = rewardForDay(dayInCycle);
    const milestone30 = nextStreak > 0 && nextStreak % 30 === 0;
    return {
      alreadyClaimedToday,
      nextStreak,
      dayInCycle,
      coins: coins + (milestone30 ? MILESTONE_30_BONUS : 0),
      baseCoins: coins,
      milestoneBonus: milestone30 ? MILESTONE_30_BONUS : 0,
      milestone30
    };
  }

  // ---------- GET /daily-rewards/status ----------
  router.get('/status', auth, async (req, res) => {
    try {
      const status = await getOrCreateStatus(req.user.id);
      const preview = previewNextClaim(status);
      const tomorrow = new Date(utcMidnight().getTime() + 86400000);

      res.json({
        currentStreak: status.current_streak,
        bestStreak: status.best_streak,
        lastClaimDate: status.last_claim_date,
        canClaimToday: !preview.alreadyClaimedToday,
        nextClaimAt: preview.alreadyClaimedToday ? tomorrow.toISOString() : null,
        nextReward: {
          dayInCycle: preview.dayInCycle,
          coins: preview.coins,
          isMilestone30: preview.milestone30
        },
        calendar: DAILY_REWARDS.map((coins, i) => ({
          day: i + 1,
          coins,
          isMilestone: i + 1 === 7
        }))
      });
    } catch (e) {
      console.error('Daily reward status error:', e);
      res.status(500).json({ error: 'Unable to load daily reward status', code: 'STATUS_LOAD_FAILED' });
    }
  });

  // ---------- GET /daily-rewards/history ----------
  router.get('/history', auth, async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    try {
      const claims = await prisma.dailyRewardClaim.findMany({
        where: { user_id: req.user.id },
        orderBy: { claimed_at: 'desc' },
        take: limit
      });
      res.json(claims);
    } catch (e) {
      res.status(500).json({ error: 'Unable to load claim history', code: 'HISTORY_LOAD_FAILED' });
    }
  });

  // ---------- POST /daily-rewards/claim ----------
  router.post('/claim', auth, async (req, res) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Re-read inside the transaction so two rapid duplicate requests
        // (e.g. a double-tap) can't both pass the "already claimed" check
        // before either one commits.
        const status = await tx.dailyRewardStatus.upsert({
          where: { user_id: req.user.id },
          create: { user_id: req.user.id },
          update: {}
        });

        const preview = previewNextClaim(status);
        if (preview.alreadyClaimedToday) {
          throw Object.assign(new Error('You already claimed today\'s reward.'), { statusCode: 409, code: 'ALREADY_CLAIMED' });
        }

        const today = utcMidnight();
        const updatedStatus = await tx.dailyRewardStatus.update({
          where: { user_id: req.user.id },
          data: {
            current_streak: preview.nextStreak,
            best_streak: Math.max(status.best_streak, preview.nextStreak),
            last_claim_date: today
          }
        });

        const claim = await tx.dailyRewardClaim.create({
          data: {
            user_id: req.user.id,
            day_number: preview.dayInCycle,
            coins: preview.coins,
            is_milestone: preview.milestone30 || preview.dayInCycle === 7
          }
        });

        const wallet = await tx.wallet.upsert({
          where: { user_id: req.user.id },
          create: { user_id: req.user.id, balance: preview.coins, lifetime_earned: preview.coins },
          update: { balance: { increment: preview.coins }, lifetime_earned: { increment: preview.coins } }
        });

        await tx.notification.create({
          data: {
            user_id: req.user.id,
            type: 'daily_reward_claimed',
            payload: { coins: preview.coins, streak: preview.nextStreak, milestone30: preview.milestone30 }
          }
        });

        return { claim, status: updatedStatus, wallet, preview };
      });

      res.json({
        success: true,
        coinsAwarded: result.preview.coins,
        newBalance: result.wallet.balance,
        currentStreak: result.status.current_streak,
        bestStreak: result.status.best_streak,
        dayInCycle: result.preview.dayInCycle,
        isMilestone30: result.preview.milestone30
      });
    } catch (e) {
      const status = e.statusCode || 500;
      if (status >= 500) console.error('Daily reward claim error:', e);
      res.status(status).json({
        error: status === 500 ? 'Unable to claim reward' : e.message,
        code: e.code || 'CLAIM_FAILED'
      });
    }
  });

  return router;
};
