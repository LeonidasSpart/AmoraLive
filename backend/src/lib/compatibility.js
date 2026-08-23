// backend/src/lib/compatibility.js

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const diffMs = Date.now() - new Date(dateOfBirth).getTime();
  return Math.floor(diffMs / (365.25 * 86400000));
}

/**
 * Deterministic 0-100 compatibility score between two profiles. Starts
 * from a 40-point baseline (so two total strangers with literally nothing
 * in common still show a plausible number rather than 0%), then adds
 * points for shared interests, matching relationship intent, and shared
 * location. Nothing here is randomized or client-suppliable.
 */
function compatibilityScore(userA, userB) {
  let score = 40;
  const interestsA = userA.interests || [];
  const interestsB = userB.interests || [];
  const shared = interestsA.filter((i) => interestsB.includes(i));
  score += Math.min(30, shared.length * 10);

  if (userA.relationship_intent && userA.relationship_intent === userB.relationship_intent) {
    score += 15;
  }

  const locA = userA.location || {};
  const locB = userB.location || {};
  if (locA.city && locB.city && String(locA.city).toLowerCase() === String(locB.city).toLowerCase()) {
    score += 15;
  } else if (locA.country && locB.country && String(locA.country).toLowerCase() === String(locB.country).toLowerCase()) {
    score += 5;
  }

  return { score: Math.min(100, score), sharedInterests: shared };
}

module.exports = { calculateAge, compatibilityScore };
