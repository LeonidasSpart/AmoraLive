// components/ProfileFrame.jsx
//
// Wraps an avatar with a tier-based glowing ring. Distinct from
// VerifiedBadge (the small checkmark) — this is the "profile frame"
// benefit specifically promised to VIP/SVIP members. Renders as a plain
// pass-through (no frame) for free/premium, so it's always safe to wrap
// any avatar with this regardless of the user's tier.
import React from 'react';

const FRAME_STYLES = {
  vip: { ring: 'linear-gradient(135deg, #ff3f9d, #ff8ac2)', glow: 'rgba(255,63,157,0.5)' },
  svip: { ring: 'linear-gradient(135deg, #ffd700, #ff9d00)', glow: 'rgba(255,215,0,0.6)' }
};

export default function ProfileFrame({ tier, size = 80, children }) {
  const style = FRAME_STYLES[tier];
  if (!style) return children;

  const padding = Math.max(3, Math.round(size * 0.045));

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        padding,
        background: style.ring,
        boxShadow: `0 0 ${Math.round(size * 0.25)}px ${style.glow}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#1a1a2e' }}>
        {children}
      </div>
    </div>
  );
}
