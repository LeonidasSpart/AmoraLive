async function logSecurityEvent(prisma, { userId = null, action, targetType = 'security', targetId = '', details = {}, ip = null }) {
  try {
    await prisma.auditLog.create({
      data: {
        admin_id: null,
        action,
        target_type: targetType,
        target_id: String(targetId || userId || 'system'),
        details: {
          ...details,
          securityEvent: true,
          userId: userId || undefined
        },
        ip: ip || null
      }
    });
  } catch (error) {
    // Security logging must never take the application down.
    console.warn('Security audit log failed:', error.message);
  }
}

function calculateAccountProtectionScore({ user, sessionCount = 0 }) {
  let score = 45;
  const recommendations = [];

  if (user?.is_verified) score += 15;
  else recommendations.push('Verify your email address.');

  if (user?.age_verified) score += 10;

  if (user?.privacy_settings && typeof user.privacy_settings === 'object') score += 10;
  else recommendations.push('Review your privacy settings.');

  if (sessionCount <= 2) score += 15;
  else if (sessionCount <= 5) score += 8;
  else recommendations.push('Review and revoke devices you no longer use.');

  score = Math.min(100, score);
  if (score >= 90) recommendations.unshift('Your account has strong protection enabled.');
  else recommendations.unshift('A few security improvements can make your account safer.');

  return { score, recommendations };
}

module.exports = { logSecurityEvent, calculateAccountProtectionScore };
