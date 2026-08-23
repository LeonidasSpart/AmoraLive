// backend/src/routes/missions.js
const auth = require('../middleware/auth');
const { MISSIONS, periodKeyFor } = require('../lib/missions');
const { awardXp } = require('../lib/xp');

module.exports = (prisma) => {
  const router = require('express').Router();

  // ---------- GET /missions ----------
  router.get('/', auth, async (req, res) => {
    try {
      const withProgress = await Promise.all(MISSIONS.map(async (mission) => {
        const periodKey = periodKeyFor(mission.type);
        const progress = await prisma.missionProgress.findUnique({
          where: { user_id_mission_key_period_key: { user_id: req.user.id, mission_key: mission.key, period_key: periodKey } }
        });
        return {
          key: mission.key,
          type: mission.type,
          category: mission.category,
          title: mission.title,
          description: mission.description,
          icon: mission.icon,
          target: mission.target,
          reward: mission.reward,
          badge: mission.badge || null,
          progress: progress?.progress || 0,
          completed: !!progress?.completed_at,
          claimed: !!progress?.claimed_at
        };
      }));
      res.json(withProgress);
    } catch (e) {
      console.error('Missions load error:', e);
      res.status(500).json({ error: 'Unable to load missions', code: 'MISSIONS_LOAD_FAILED' });
    }
  });

  // ---------- POST /missions/:key/claim ----------
  router.post('/:key/claim', auth, async (req, res) => {
    const mission = MISSIONS.find((m) => m.key === req.params.key);
    if (!mission) return res.status(404).json({ error: 'Mission not found', code: 'MISSION_NOT_FOUND' });

    try {
      const result = await prisma.$transaction(async (tx) => {
        const periodKey = periodKeyFor(mission.type);
        const progress = await tx.missionProgress.findUnique({
          where: { user_id_mission_key_period_key: { user_id: req.user.id, mission_key: mission.key, period_key: periodKey } }
        });
        if (!progress || !progress.completed_at) {
          throw Object.assign(new Error('This mission is not complete yet.'), { statusCode: 400, code: 'NOT_COMPLETE' });
        }
        if (progress.claimed_at) {
          throw Object.assign(new Error('You already claimed this mission.'), { statusCode: 409, code: 'ALREADY_CLAIMED' });
        }

        await tx.missionProgress.update({ where: { id: progress.id }, data: { claimed_at: new Date() } });

        const wallet = await tx.wallet.upsert({
          where: { user_id: req.user.id },
          create: { user_id: req.user.id, balance: mission.reward.coins, lifetime_earned: mission.reward.coins },
          update: { balance: { increment: mission.reward.coins }, lifetime_earned: { increment: mission.reward.coins } }
        });

        let xpResult = null;
        if (mission.reward.xp) {
          xpResult = await awardXp(tx, { userId: req.user.id, amount: mission.reward.xp, reason: 'mission_claim', metadata: { missionKey: mission.key } });
        }

        if (mission.badge) {
          const user = await tx.user.findUnique({ where: { id: req.user.id }, select: { badges: true } });
          if (user && !user.badges.includes(mission.badge)) {
            await tx.user.update({ where: { id: req.user.id }, data: { badges: [...user.badges, mission.badge] } });
          }
        }

        await tx.notification.create({
          data: {
            user_id: req.user.id,
            type: 'mission_claimed',
            payload: { missionKey: mission.key, title: mission.title, coins: mission.reward.coins, xp: mission.reward.xp || 0, badge: mission.badge || null }
          }
        });

        return { wallet, xpResult };
      });

      res.json({
        success: true,
        coinsAwarded: mission.reward.coins,
        xpAwarded: mission.reward.xp || 0,
        newBalance: result.wallet.balance,
        leveledUp: result.xpResult?.leveledUp || false,
        newLevel: result.xpResult?.newLevel
      });
    } catch (e) {
      const status = e.statusCode || 500;
      if (status >= 500) console.error('Mission claim error:', e);
      res.status(status).json({
        error: status === 500 ? 'Unable to claim mission' : e.message,
        code: e.code || 'CLAIM_FAILED'
      });
    }
  });

  return router;
};
