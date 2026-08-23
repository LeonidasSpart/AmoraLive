// backend/src/lib/missions.js
const { MISSIONS } = require('../data/missions');

function isoWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function periodKeyFor(type) {
  if (type === 'daily') return `daily:${new Date().toISOString().slice(0, 10)}`;
  if (type === 'weekly') return `weekly:${isoWeekKey()}`;
  return 'lifetime';
}

/**
 * Increments progress on every mission that tracks `metric`, for whichever
 * period each mission is currently in (daily/weekly/lifetime resolved
 * independently per mission). Never grants a reward — reaching the target
 * just flips completed_at so the reward can be claimed via
 * POST /missions/:key/claim. Call inside an existing transaction wherever
 * the real action (sending a gift, going live, etc) already happens.
 */
async function incrementMissionProgress(tx, userId, metric, amount = 1) {
  const relevant = MISSIONS.filter((m) => m.metric === metric);
  for (const mission of relevant) {
    const periodKey = periodKeyFor(mission.type);
    const existing = await tx.missionProgress.upsert({
      where: { user_id_mission_key_period_key: { user_id: userId, mission_key: mission.key, period_key: periodKey } },
      create: { user_id: userId, mission_key: mission.key, period_key: periodKey, progress: 0 },
      update: {}
    });
    if (existing.completed_at) continue; // already complete this period, nothing more to track

    const newProgress = Math.min(mission.target, existing.progress + amount);
    await tx.missionProgress.update({
      where: { id: existing.id },
      data: {
        progress: newProgress,
        completed_at: newProgress >= mission.target ? new Date() : null
      }
    });
  }
}

module.exports = { MISSIONS, periodKeyFor, incrementMissionProgress };
