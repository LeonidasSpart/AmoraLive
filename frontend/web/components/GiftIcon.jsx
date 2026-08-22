// frontend/web/components/GiftIcon.jsx
//
// Every gift renders through this component instead of raw image_url/emoji.
// Because it's pure inline SVG, there is no network fetch that can 404 or
// show a broken-image icon — a gift can be missing custom artwork, but it
// can never render as a "?" placeholder.
//
// Each glyph is a clean, minimal vector icon themed to its category
// (romance/luxury/cosmic/power/fun). Rarity drives the color treatment and
// glow intensity: common gifts are flat and subtle, legendary/mythic gifts
// get a full animated gradient + glow ring.
import React from 'react';

const RARITY_GRADIENTS = {
  common:    ['#8a8a9e', '#5c5c73'],
  rare:      ['#3fa9ff', '#1d6fe0'],
  epic:      ['#a855f7', '#6d28d9'],
  legendary: ['#ffd700', '#ff9d00'],
  mythic:    ['#ff3f9d', '#9b35ff']
};

const RARITY_GLOW = {
  common: 0,
  rare: 0.25,
  epic: 0.4,
  legendary: 0.65,
  mythic: 0.85
};

// Minimal line-art path data per glyph, drawn in a 24x24 box.
const GLYPHS = {
  rose: 'M12 2c-1.7 2-2 4-1 6-2-.6-4 .2-5 2 2-1 3.4-.4 4 1-2.3.2-3.6 2-4 4 2-1.6 3.6-1.6 5 0 .3-2 1.7-3.6 4-4-.4-1.4.4-2.4 2-3-2.4-.4-3.6-2-3-4-1 .2-1.8.7-2 1zM12 13v9',
  heart: 'M12 21s-7.5-4.8-10-9.3C.4 8.6 2 5 5.6 5 8 5 10 6.4 12 9c2-2.6 4-4 6.4-4C22 5 23.6 8.6 22 11.7 19.5 16.2 12 21 12 21z',
  kiss: 'M4 10c2-2 5-3 8-3s6 1 8 3M6 14c1.5-1 3.5-1.5 6-1.5s4.5.5 6 1.5M9 17.5c.9-.6 1.9-1 3-1s2.1.4 3 1',
  letter: 'M3 6h18v13H3zM3 6l9 7 9-7',
  crownHeart: 'M4 18h16l-1-8-3.5 3L12 8l-3.5 5L5 10l-1 8zM9 21h6',
  diamond: 'M4 9l4-6h8l4 6-8 12z M4 9h16 M8 3l4 6 4-6',
  crown: 'M3 19h18l-1-9-4.5 4L12 6l-3.5 8L4 10z',
  car: 'M3 16h1.5l1-4 2.5-3h8l2.5 3 1.5 4H21M6 16a2 2 0 104 0 2 2 0 00-4 0zM14 16a2 2 0 104 0 2 2 0 00-4 0z',
  jet: 'M12 2l3 7h5l-4 4 1.5 6L12 15l-5.5 4L8 13l-4-4h5z',
  champagne: 'M9 2h6l-1 8a2 2 0 002 2h0M9 2l1 8a2 2 0 01-2 2h0M12 12v10M8 22h8',
  ring: 'M12 22a6 6 0 100-12 6 6 0 000 12zM10 10l2-8 2 8',
  chest: 'M3 10h18v9H3zM3 10l1.5-4h15L21 10M9 10v9M9 5.5h6M12 13v3',
  palace: 'M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6M12 4v3',
  throne: 'M5 21V8h14v13M5 8l2-5h10l2 5M9 21v-7h6v7M12 3v2',
  galaxy: 'M12 12a8 8 0 108 8M12 12a4 4 0 104 4M12 12l7-6M12 12l-2 8',
  moon: 'M20 14.5A8.5 8.5 0 1110.2 4a7 7 0 109.8 10.5z',
  planet: 'M12 15a5 5 0 100-10 5 5 0 000 10zM2 14c4-2 16-2 20 0',
  supernova: 'M12 2v6M12 16v6M2 12h6M16 12h6M4.5 4.5l4 4M15.5 15.5l4 4M4.5 19.5l4-4M15.5 8.5l4-4',
  blackhole: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8z',
  starPortal: 'M12 2l2.5 6.5L21 9l-5 4.5L17.5 20 12 16.5 6.5 20 8 13.5 3 9l6.5-.5z',
  infinity: 'M6 12a3.5 3.5 0 110-.1M18 12a3.5 3.5 0 110-.1M6 12c3-4 9 4 12 0M6 12c3 4 9-4 12 0',
  lightning: 'M13 2L4 14h6l-1 8 9-12h-6z',
  flame: 'M12 2c2 4-1 5-1 8a3 3 0 003 3c2 0 3-2 3-4 3 3 3 7 0 10a8 8 0 01-12-11c1-2 2-3 2-5 1 0 4 1 5-1z',
  phoenix: 'M12 2c3 3 3 6 1 8 3-1 5 1 6 4-3-1-5 0-6 2 3 1 4 4 3 7-2-3-4-4-4-7-0 3-2 4-4 7-1-3 0-6 3-7-1-2-3-3-6-2 1-3 3-5 6-4-2-2-2-5 1-8z',
  dragon: 'M3 14c3-6 8-9 13-8-1 2-3 3-3 5 2-1 4-1 5 1-2 0-3 1-3 3 2 0 3 1 3 3-2-1-4-1-5 1-4 1-8-1-10-5z',
  sword: 'M14 2l8 8-2 2-8-8zM12 8L4 16v4h4l8-8zM4 20l3-3',
  confetti: 'M4 4l2 2M20 4l-2 2M4 20l2-2M20 20l-2-2M12 3v3M12 18v3M3 12h3M18 12h3M8 8l8 8M16 8l-8 8',
  balloon: 'M12 2a6 6 0 016 6c0 4-3 6-4.5 7.5L14 17h-4l.5-1.5C9 14 6 12 6 8a6 6 0 016-6zM11 17l1 5',
  cupcake: 'M6 21h12l-1.5-9h-9zM7.5 12c-1-3 1-6 4.5-6s5.5 3 4.5 6M12 3v3',
  iceCream: 'M12 3l6 8H6zM8 11l4 10 4-10',
  music: 'M9 18a3 3 0 106 0V4l6-2v14a3 3 0 11-2-2.8V6l-4 1.3v10.7a3 3 0 11-6 0z',
  butterfly: 'M12 12c-2-6-8-8-9-4-1 3 2 5 5 4-3 1-4 4-2 6 2 1 5-1 6-4v-2zM12 12c2-6 8-8 9-4 1 3-2 5-5 4 3 1 4 4 2 6-2 1-5-1-6-4v-2z',
  teddyBear: 'M9 5a2 2 0 10-4 0 2 2 0 004 0zM19 5a2 2 0 10-4 0 2 2 0 004 0zM12 7a6 6 0 00-6 6c0 3 2 4 2 6h8c0-2 2-3 2-6a6 6 0 00-6-6z',
  giftBox: 'M4 8h16v13H4zM4 8l1-3h14l1 3M12 2c-1.5 0-3 1.5-3 3h3zM12 2c1.5 0 3 1.5 3 3h-3zM12 8v13',
  partyPopper: 'M3 21l7-14 11 4-4 11zM10 7l2-4M13 9l4-2M7 12l-4 2'
};

// name -> glyph key. Every one of the 50 gifts maps here.
export const GIFT_GLYPH_MAP = {
  // Romance
  'Eternal Rose': 'rose', 'Crystal Heart': 'heart', 'Kiss': 'kiss', 'Love Letter': 'letter',
  'Diamond Heart': 'heart', 'Forever Love': 'infinity', 'Romantic Rose': 'rose', 'Cupid': 'heart',
  'Love Crown': 'crownHeart', 'Eternal Love': 'infinity',
  // Luxury
  'Diamond': 'diamond', 'Diamond Crown': 'crown', 'Gold Crown': 'crown', 'Luxury Car': 'car',
  'Private Jet': 'jet', 'Gold Champagne': 'champagne', 'Diamond Ring': 'ring', 'Treasure Chest': 'chest',
  'Golden Palace': 'palace', 'Royal Throne': 'throne',
  // Cosmic
  'Galaxy': 'galaxy', 'Moon': 'moon', 'Planet': 'planet', 'Cosmic Heart': 'heart',
  'Supernova': 'supernova', 'Black Hole': 'blackhole', 'Cosmic Rose': 'rose', 'Star Portal': 'starPortal',
  'Universe': 'galaxy', 'Infinity': 'infinity',
  // Power
  'Lightning': 'lightning', 'Fire': 'flame', 'Thunder': 'lightning', 'Phoenix': 'phoenix',
  'Dragon': 'dragon', 'Energy Blast': 'supernova', 'Golden Tiger': 'flame', 'Warrior': 'sword',
  'Crown of Power': 'crown', 'Legendary Sword': 'sword',
  // Fun/Social
  'Confetti': 'confetti', 'Balloon': 'balloon', 'Cupcake': 'cupcake', 'Ice Cream': 'iceCream',
  'Music': 'music', 'Butterfly': 'butterfly', 'Teddy Bear': 'teddyBear', 'Magic Box': 'giftBox',
  'Party Popper': 'partyPopper', 'Celebration': 'confetti'
};

export default function GiftIcon({ name, glyph, rarity = 'common', size = 40, animated = false }) {
  const glyphKey = glyph || GIFT_GLYPH_MAP[name] || 'giftBox';
  const path = GLYPHS[glyphKey] || GLYPHS.giftBox;
  const [c1, c2] = RARITY_GRADIENTS[rarity] || RARITY_GRADIENTS.common;
  const glow = RARITY_GLOW[rarity] ?? 0;
  const gradId = `giftgrad-${glyphKey}-${rarity}`;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${c1}22, transparent 70%)`,
        filter: glow > 0.5 ? `drop-shadow(0 0 ${Math.round(size * 0.18)}px ${c2}${animated ? 'cc' : '77'})` : 'none',
        animation: animated && glow > 0.5 ? 'giftIconPulse 1.4s ease-in-out infinite' : 'none'
      }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.68} height={size * 0.68} fill="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <path
          d={path}
          stroke={`url(#${gradId})`}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={rarity === 'legendary' || rarity === 'mythic' ? `url(#${gradId})` : 'none'}
          fillOpacity={rarity === 'legendary' || rarity === 'mythic' ? 0.18 : 0}
        />
      </svg>
      <style jsx>{`
        @keyframes giftIconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
