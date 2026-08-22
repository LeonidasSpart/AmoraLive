// components/VerifiedBadge.jsx
//
// TikTok/X-style verification checkmark, tiered by account status:
//   - gold  → membership_tier === 'svip'
//   - pink  → membership_tier === 'vip'
//   - blue  → is_verified === true (any other tier)
//   - none  → not verified and not a paying member
//
// Usage: <VerifiedBadge user={user} /> right after a display name anywhere
// a username/display name is shown.
import React from 'react';

const STYLES = {
  gold: { bg: 'linear-gradient(135deg, #ffd700, #ff9d00)', ring: '#ffe28a', title: 'SVIP Verified' },
  pink: { bg: 'linear-gradient(135deg, #ff3f9d, #ff8ac2)', ring: '#ffb8dd', title: 'VIP Verified' },
  blue: { bg: 'linear-gradient(135deg, #3fa9ff, #1d6fe0)', ring: '#9cd0ff', title: 'Verified' }
};

export function badgeTier(user) {
  if (!user) return null;
  if (user.membership_tier === 'svip') return 'gold';
  if (user.membership_tier === 'vip') return 'pink';
  if (user.is_verified) return 'blue';
  return null;
}

export default function VerifiedBadge({ user, size = 14, style = {} }) {
  const tier = badgeTier(user);
  if (!tier) return null;
  const { bg, ring, title } = STYLES[tier];

  return (
    <span
      title={title}
      aria-label={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        background: bg,
        boxShadow: `0 0 0 2px ${ring}22`,
        marginLeft: 4,
        verticalAlign: 'middle',
        ...style
      }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none">
        <path d="M4 12.5L9.5 18L20 6" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
