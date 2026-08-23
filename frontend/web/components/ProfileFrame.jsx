// components/ProfileFrame.jsx
//
// Wraps an avatar with a tier-based glowing ring. Distinct from
// VerifiedBadge (the small checkmark) — this is the "profile frame"
// benefit specifically promised to VIP/SVIP members.
import React from 'react';

const FRAME_STYLES = {
  vip: { ring: 'linear-gradient(135deg, #ff3f9d, #ff8ac2)', glow: 'rgba(255,63,157,0.5)' },
  svip: { ring: 'linear-gradient(135deg, #ffd700, #ff9d00)', glow: 'rgba(255,215,0,0.6)' }
};

export default function ProfileFrame({ tier, size = 80, children }) {
  const style = FRAME_STYLES[tier];

  // Free/premium still needs a sized wrapper, not a bare pass-through —
  // any child sized with width/height: '100%' (relying on this wrapper to
  // define that 100%) would otherwise inherit its size from whatever
  // ancestor actually has dimensions, which can blow up to fill the
  // entire viewport. This bit every non-VIP/SVIP user, invisibly, until a
  // percentage-sized child (Stories' avatar ring) finally exposed it.
  if (!style) {
    return (
      <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    );
  }

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

