import React from 'react';

/*
 * Amora gift renderer
 *
 * Important: the database catalog uses `glyph` as a logical key, while the
 * visual assets live under /public/gifts. The old implementation only looked
 * up a small name map under /gifts/luxury and then rendered the raw glyph
 * string (e.g. "lightning", "confetti") when it missed. That is why the admin
 * catalog showed words on top of gift names and why many gifts had no artwork.
 *
 * This renderer has two safety nets:
 *   1. exact gift-name aliases for the current/legacy catalogs
 *   2. glyph aliases for any future gift using the same logical glyph
 *
 * No backend gift IDs, prices, rarity, membership rules or transactions are
 * changed by this component.
 */

const RARITY_GLOW = {
  common: 'rgba(169,165,181,.15)',
  uncommon: 'rgba(93,224,174,.18)',
  rare: 'rgba(85,184,255,.20)',
  epic: 'rgba(184,117,255,.23)',
  legendary: 'rgba(255,212,94,.28)',
  mythic: 'rgba(255,95,200,.30)'
};

const FALLBACK = {
  common: ['#d5d2df', '#706b7e'],
  uncommon: ['#8af5c6', '#2eaf7b'],
  rare: ['#a9e2ff', '#347bd6'],
  epic: ['#e4b9ff', '#7d36d8'],
  legendary: ['#fff5a7', '#d89412'],
  mythic: ['#ffd0ec', '#a735ff']
};

const NAME_ART = {
  'Thumbs Up': '/gifts/thumbs-up.svg',
  'Wink': '/gifts/wink.svg',
  'Rose': '/gifts/rose.svg',
  'Diamond': '/gifts/diamond.svg',
  'Clap': '/gifts/clap.svg',
  'Confetti': '/gifts/fireworks.svg',
  'Lightning': '/gifts/solar-flare.svg',
  'Eternal Rose': '/gifts/rose.svg',
  'Galaxy': '/gifts/galaxy-express.svg',
  'Heart': '/gifts/heart.svg',
  'Bubble Tea': '/gifts/bubble-tea.svg',
  'Crystal Heart': '/gifts/heart.svg',
  'Balloon': '/gifts/balloon.svg',
  'Diamond Crown': '/gifts/crown.svg',
  'Fire': '/gifts/phoenix-rising.svg',
  'Moon': '/gifts/aurora.svg',
  'Music Note': '/gifts/music-note.svg',
  'Thunder': '/gifts/solar-flare.svg',
  'Kiss': '/gifts/kiss.svg',
  'Planet': '/gifts/galaxy-express.svg',
  'Cupcake': '/gifts/cupcake.svg',
  'Perfume': '/gifts/perfume.svg',
  'Gold Crown': '/gifts/crown.svg',
  'Cocktail': '/gifts/cocktail.svg',
  'Fireworks': '/gifts/fireworks.svg',
  'Magic Wand': '/gifts/magic-wand.svg',
  'Champagne': '/gifts/champagne.svg',
  'Shooting Star': '/gifts/shooting-star.svg',
  'Love Letter': '/gifts/love-letter.svg',
  'Comet': '/gifts/comet.svg',
  'Ice Cream': '/gifts/ice-cream.svg',
  'Cosmic Heart': '/gifts/heart.svg',
  'Phoenix': '/gifts/phoenix-rising.svg',
  'Luxury Car': '/gifts/luxury/luxury-car.svg',
  'Ring': '/gifts/ring.svg',
  'Sports Car': '/gifts/sports-car.svg',
  'Wolf Howl': '/gifts/wolf-howl.svg',
  'Music': '/gifts/music-note.svg',
  'Supernova': '/gifts/supernova.svg',
  'Tiger': '/gifts/tiger.svg',
  'Dragon': '/gifts/dragon-s-egg.svg',
  'Diamond Heart': '/gifts/heart.svg',
  'Private Jet': '/gifts/luxury/private-jet.svg',
  'Eagle Flight': '/gifts/eagle-flight.svg',
  'Golden Gate': '/gifts/golden-gate.svg',
  'Yacht': '/gifts/yacht.svg',
  'Meteor Shower': '/gifts/meteor-shower.svg',
  'Unicorn': '/gifts/unicorn.svg',
  'Crown': '/gifts/crown.svg',
  'Gold Champagne': '/gifts/champagne.svg',
  'Black Hole': '/gifts/black-hole.svg',
  "Dragon's Egg": '/gifts/dragon-s-egg.svg',
  'Energy Blast': '/gifts/supernova.svg',
  'Butterfly': '/gifts/butterfly.svg',
  'Forever Love': '/gifts/infinity-crown.svg',
  'Aurora': '/gifts/aurora.svg',
  'Phoenix Rising': '/gifts/phoenix-rising.svg',
  'Solar Flare': '/gifts/solar-flare.svg',
  'Rocket': '/gifts/rocket.svg',
  'Galaxy Express': '/gifts/galaxy-express.svg',
  'Diamond Ring': '/gifts/ring.svg',
  'Romantic Rose': '/gifts/rose.svg',
  'Golden Tiger': '/gifts/golden-lion.svg',
  'Teddy Bear': '/gifts/teddy-bear.svg',
  'Cosmic Rose': '/gifts/rose.svg',
  'Lion': '/gifts/lion.svg',
  'Golden Lion': '/gifts/golden-lion.svg',
  'Castle': '/gifts/castle.svg',
  'Warrior': '/gifts/dragon-s-egg.svg',
  'Cupid': '/gifts/heart.svg',
  'Treasure Chest': '/gifts/castle.svg',
  'Star Portal': '/gifts/shooting-star.svg',
  'Magic Box': '/gifts/gift-box.svg',
  'Infinity Crown': '/gifts/infinity-crown.svg',
  'Amora Throne': '/gifts/amora-throne.svg',
  'Lion King': '/gifts/lion-king.svg',
  'Guardian Lion': '/gifts/guardian-lion.svg',
  'Universe': '/gifts/amora-universe.svg',
  'Golden Palace': '/gifts/golden-gate.svg',
  'Crown of Power': '/gifts/crown.svg',
  'Party Popper': '/gifts/fireworks.svg',
  'Love Crown': '/gifts/crown.svg',
  'Amora Universe': '/gifts/amora-universe.svg',
  'Cosmic Phoenix': '/gifts/cosmic-phoenix.svg',
  'Eternal Amora': '/gifts/eternal-amora.svg',
  'Royal Throne': '/gifts/amora-throne.svg',
  'Eternal Love': '/gifts/infinity-crown.svg',
  'Celebration': '/gifts/fireworks.svg',
  'Legendary Sword': '/gifts/legendary-sword.svg',
  'Infinity': '/gifts/infinity-crown.svg'
};

const GLYPH_ART = {
  rose: '/gifts/rose.svg',
  heart: '/gifts/heart.svg',
  kiss: '/gifts/kiss.svg',
  letter: '/gifts/love-letter.svg',
  crownHeart: '/gifts/crown.svg',
  diamond: '/gifts/diamond.svg',
  crown: '/gifts/crown.svg',
  car: '/gifts/luxury/luxury-car.svg',
  jet: '/gifts/luxury/private-jet.svg',
  champagne: '/gifts/champagne.svg',
  ring: '/gifts/ring.svg',
  chest: '/gifts/castle.svg',
  palace: '/gifts/golden-gate.svg',
  throne: '/gifts/amora-throne.svg',
  galaxy: '/gifts/galaxy-express.svg',
  moon: '/gifts/aurora.svg',
  planet: '/gifts/galaxy-express.svg',
  supernova: '/gifts/supernova.svg',
  blackhole: '/gifts/black-hole.svg',
  starPortal: '/gifts/shooting-star.svg',
  infinity: '/gifts/infinity-crown.svg',
  lightning: '/gifts/solar-flare.svg',
  flame: '/gifts/phoenix-rising.svg',
  phoenix: '/gifts/phoenix-rising.svg',
  dragon: '/gifts/dragon-s-egg.svg',
  sword: '/gifts/legendary-sword.svg',
  confetti: '/gifts/fireworks.svg',
  balloon: '/gifts/balloon.svg',
  cupcake: '/gifts/cupcake.svg',
  iceCream: '/gifts/ice-cream.svg',
  music: '/gifts/music-note.svg',
  butterfly: '/gifts/butterfly.svg',
  teddyBear: '/gifts/teddy-bear.svg',
  giftBox: '/gifts/gift-box.svg',
  partyPopper: '/gifts/fireworks.svg'
};

export default function GiftIcon({
  name,
  glyph,
  rarity = 'common',
  size = 64,
  animated = false
}) {
  const r = String(rarity || 'common').toLowerCase();
  const [accent] = FALLBACK[r] || FALLBACK.common;
  const art = NAME_ART[String(name || '').trim()] || GLYPH_ART[String(glyph || '').trim()] || '/gifts/gift-box.svg';
  const label = name || 'Gift';

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        flex: '0 0 auto',
        borderRadius: '22%',
        background: `radial-gradient(circle, ${RARITY_GLOW[r] || RARITY_GLOW.common}, transparent 72%)`,
        animation: animated ? 'luxuryGiftFloat 2.2s ease-in-out infinite' : 'none'
      }}
      aria-label={label}
      title={label}
    >
      <img
        src={art}
        alt=""
        draggable="false"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          filter: `drop-shadow(0 10px 16px ${RARITY_GLOW[r] || RARITY_GLOW.common})`
        }}
        onError={(event) => {
          // Never replace a missing art asset with raw glyph text. The
          // generic premium gift box is the final visual fallback.
          if (!event.currentTarget.src.endsWith('/gifts/gift-box.svg')) {
            event.currentTarget.src = '/gifts/gift-box.svg';
          }
        }}
      />

      {(r === 'legendary' || r === 'mythic') && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '7%',
            borderRadius: '25%',
            border: `1px solid ${accent}55`,
            boxShadow: `0 0 22px ${accent}33`,
            pointerEvents: 'none'
          }}
        />
      )}

      <style jsx>{`
        @keyframes luxuryGiftFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.035); }
        }
      `}</style>
    </div>
  );
}
