import React from 'react';

/*
 * Amora 3D gift renderer.
 *
 * The catalog, prices, rarity, membership rules and transaction APIs remain
 * untouched. This component only changes presentation: vector artwork is
 * placed inside a layered 3D stage with a floating pedestal, rim light,
 * specular highlight and rarity-specific glow.
 */

const RARITY_GLOW = {
  common: 'rgba(169,165,181,.18)',
  uncommon: 'rgba(93,224,174,.20)',
  rare: 'rgba(85,184,255,.22)',
  epic: 'rgba(184,117,255,.25)',
  legendary: 'rgba(255,212,94,.32)',
  mythic: 'rgba(255,95,200,.34)'
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
  Wink: '/gifts/wink.svg', Rose: '/gifts/rose.svg', Diamond: '/gifts/diamond.svg',
  Clap: '/gifts/clap.svg', Confetti: '/gifts/fireworks.svg', Lightning: '/gifts/solar-flare.svg',
  'Eternal Rose': '/gifts/luxury/diamond-rose.svg', 'Galaxy': '/gifts/luxury/galaxy-heart.svg',
  Heart: '/gifts/heart.svg', 'Bubble Tea': '/gifts/bubble-tea.svg', 'Crystal Heart': '/gifts/luxury/diamond-heart.svg',
  Balloon: '/gifts/balloon.svg', 'Diamond Crown': '/gifts/luxury/royal-crown.svg', Fire: '/gifts/phoenix-rising.svg',
  Moon: '/gifts/aurora.svg', 'Music Note': '/gifts/music-note.svg', Thunder: '/gifts/solar-flare.svg',
  Kiss: '/gifts/kiss.svg', Planet: '/gifts/galaxy-express.svg', Cupcake: '/gifts/cupcake.svg', Perfume: '/gifts/perfume.svg',
  'Gold Crown': '/gifts/luxury/royal-crown.svg', Cocktail: '/gifts/cocktail.svg', Fireworks: '/gifts/fireworks.svg',
  'Magic Wand': '/gifts/magic-wand.svg', Champagne: '/gifts/luxury/champagne-royal.svg', 'Shooting Star': '/gifts/shooting-star.svg',
  'Love Letter': '/gifts/love-letter.svg', Comet: '/gifts/comet.svg', 'Ice Cream': '/gifts/ice-cream.svg',
  'Cosmic Heart': '/gifts/luxury/galaxy-heart.svg', Phoenix: '/gifts/luxury/golden-phoenix.svg',
  'Luxury Car': '/gifts/luxury/luxury-car.svg', Ring: '/gifts/ring.svg', 'Sports Car': '/gifts/sports-car.svg',
  'Wolf Howl': '/gifts/wolf-howl.svg', Music: '/gifts/music-note.svg', Supernova: '/gifts/supernova.svg',
  Tiger: '/gifts/tiger.svg', Dragon: '/gifts/dragon-s-egg.svg', 'Diamond Heart': '/gifts/luxury/diamond-heart.svg',
  'Private Jet': '/gifts/luxury/private-jet.svg', 'Eagle Flight': '/gifts/eagle-flight.svg', 'Golden Gate': '/gifts/golden-gate.svg',
  Yacht: '/gifts/luxury/royal-yacht.svg', 'Meteor Shower': '/gifts/meteor-shower.svg', Unicorn: '/gifts/unicorn.svg',
  Crown: '/gifts/crown.svg', 'Gold Champagne': '/gifts/luxury/champagne-royal.svg', 'Black Hole': '/gifts/black-hole.svg',
  "Dragon's Egg": '/gifts/dragon-s-egg.svg', 'Energy Blast': '/gifts/supernova.svg', Butterfly: '/gifts/butterfly.svg',
  'Forever Love': '/gifts/luxury/diamond-heart.svg', Aurora: '/gifts/aurora.svg', 'Phoenix Rising': '/gifts/luxury/golden-phoenix.svg',
  'Solar Flare': '/gifts/solar-flare.svg', Rocket: '/gifts/rocket.svg', 'Galaxy Express': '/gifts/galaxy-express.svg',
  'Diamond Ring': '/gifts/luxury/diamond-ring.svg', 'Romantic Rose': '/gifts/luxury/diamond-rose.svg',
  'Golden Tiger': '/gifts/golden-lion.svg', 'Teddy Bear': '/gifts/teddy-bear.svg', 'Cosmic Rose': '/gifts/luxury/diamond-rose.svg',
  Lion: '/gifts/lion.svg', 'Golden Lion': '/gifts/golden-lion.svg', Castle: '/gifts/castle.svg', Warrior: '/gifts/legendary-sword.svg',
  Cupid: '/gifts/luxury/diamond-heart.svg', 'Treasure Chest': '/gifts/castle.svg', 'Star Portal': '/gifts/shooting-star.svg',
  'Magic Box': '/gifts/gift-box.svg', 'Infinity Crown': '/gifts/luxury/royal-crown.svg', 'Amora Throne': '/gifts/luxury/amora-throne.svg',
  'Lion King': '/gifts/lion-king.svg', 'Guardian Lion': '/gifts/guardian-lion.svg', Universe: '/gifts/amora-universe.svg',
  'Golden Palace': '/gifts/luxury/diamond-palace.svg', 'Crown of Power': '/gifts/luxury/royal-crown.svg',
  'Party Popper': '/gifts/fireworks.svg', 'Love Crown': '/gifts/luxury/royal-crown.svg', 'Amora Universe': '/gifts/amora-universe.svg',
  'Cosmic Phoenix': '/gifts/luxury/golden-phoenix.svg', 'Eternal Amora': '/gifts/eternal-amora.svg',
  'Royal Throne': '/gifts/luxury/amora-throne.svg', 'Eternal Love': '/gifts/luxury/diamond-heart.svg', Celebration: '/gifts/fireworks.svg',
  'Legendary Sword': '/gifts/legendary-sword.svg', Infinity: '/gifts/infinity-crown.svg'
};

const GLYPH_ART = {
  rose: '/gifts/luxury/diamond-rose.svg', heart: '/gifts/luxury/diamond-heart.svg', kiss: '/gifts/kiss.svg', letter: '/gifts/love-letter.svg',
  crownHeart: '/gifts/luxury/royal-crown.svg', diamond: '/gifts/diamond.svg', crown: '/gifts/luxury/royal-crown.svg',
  car: '/gifts/luxury/luxury-car.svg', jet: '/gifts/luxury/private-jet.svg', champagne: '/gifts/luxury/champagne-royal.svg',
  ring: '/gifts/luxury/diamond-ring.svg', chest: '/gifts/castle.svg', palace: '/gifts/luxury/diamond-palace.svg',
  throne: '/gifts/luxury/amora-throne.svg', galaxy: '/gifts/luxury/galaxy-heart.svg', moon: '/gifts/aurora.svg', planet: '/gifts/galaxy-express.svg',
  supernova: '/gifts/supernova.svg', blackhole: '/gifts/black-hole.svg', starPortal: '/gifts/shooting-star.svg', infinity: '/gifts/infinity-crown.svg',
  lightning: '/gifts/solar-flare.svg', flame: '/gifts/phoenix-rising.svg', phoenix: '/gifts/luxury/golden-phoenix.svg', dragon: '/gifts/dragon-s-egg.svg',
  sword: '/gifts/legendary-sword.svg', confetti: '/gifts/fireworks.svg', balloon: '/gifts/balloon.svg', cupcake: '/gifts/cupcake.svg',
  iceCream: '/gifts/ice-cream.svg', music: '/gifts/music-note.svg', butterfly: '/gifts/butterfly.svg', teddyBear: '/gifts/teddy-bear.svg',
  giftBox: '/gifts/gift-box.svg', partyPopper: '/gifts/fireworks.svg'
};

export default function GiftIcon({ name, glyph, rarity = 'common', size = 64, animated = false }) {
  const r = String(rarity || 'common').toLowerCase();
  const [accent] = FALLBACK[r] || FALLBACK.common;
  const glow = RARITY_GLOW[r] || RARITY_GLOW.common;
  const art = NAME_ART[String(name || '').trim()] || GLYPH_ART[String(glyph || '').trim()] || '/gifts/gift-box.svg';
  const label = name || 'Gift';

  return (
    <div
      className={`amora-gift-3d amora-gift-3d-${r}${animated ? ' is-animated' : ''}`}
      style={{ width: size, height: size, '--gift-accent': accent, '--gift-glow': glow }}
      aria-label={label}
      title={label}
    >
      <span className="amora-gift-orbit orbit-a" aria-hidden="true" />
      <span className="amora-gift-orbit orbit-b" aria-hidden="true" />
      <span className="amora-gift-pedestal" aria-hidden="true" />
      <span className="amora-gift-face" aria-hidden="true">
        <span className="amora-gift-shimmer" />
        <img
          src={art}
          alt=""
          draggable="false"
          onError={(event) => {
            if (!event.currentTarget.src.endsWith('/gifts/gift-box.svg')) event.currentTarget.src = '/gifts/gift-box.svg';
          }}
        />
      </span>
      <span className="amora-gift-specular" aria-hidden="true" />
      <style jsx>{`
        .amora-gift-3d {
          --gift-accent: #d5d2df;
          --gift-glow: rgba(255,255,255,.16);
          position: relative;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          perspective: 600px;
          transform-style: preserve-3d;
          isolation: isolate;
        }
        .amora-gift-face {
          position: relative;
          z-index: 4;
          width: 78%;
          height: 78%;
          display: grid;
          place-items: center;
          border-radius: 28%;
          background: radial-gradient(circle at 32% 24%, rgba(255,255,255,.22), transparent 22%), linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.025));
          border: 1px solid color-mix(in srgb, var(--gift-accent) 45%, transparent);
          box-shadow: inset 0 1px rgba(255,255,255,.22), inset 0 -14px 26px rgba(0,0,0,.16), 0 16px 30px rgba(0,0,0,.28), 0 0 30px var(--gift-glow);
          transform: rotateX(7deg) rotateY(-7deg) translateZ(18px);
          transform-style: preserve-3d;
          overflow: hidden;
        }
        .amora-gift-face::before { content: ''; position: absolute; inset: 8%; border-radius: 24%; border: 1px solid rgba(255,255,255,.08); box-shadow: 0 0 22px var(--gift-glow); pointer-events: none; }
        .amora-gift-face img { width: 88%; height: 88%; object-fit: contain; display: block; position: relative; z-index: 2; filter: drop-shadow(0 12px 14px var(--gift-glow)); transform: translateZ(22px); }
        .amora-gift-pedestal { position: absolute; z-index: 2; width: 70%; height: 20%; bottom: 1%; border-radius: 50%; background: radial-gradient(ellipse, var(--gift-glow), transparent 70%); filter: blur(3px); transform: rotateX(65deg) translateZ(-6px); box-shadow: 0 10px 24px var(--gift-glow); }
        .amora-gift-orbit { position: absolute; z-index: 1; width: 94%; height: 54%; left: 3%; top: 24%; border: 1px solid color-mix(in srgb, var(--gift-accent) 35%, transparent); border-radius: 50%; transform-style: preserve-3d; opacity: .8; }
        .orbit-a { transform: rotateX(65deg) rotateZ(-18deg); }
        .orbit-b { transform: rotateY(67deg) rotateZ(16deg); opacity: .45; }
        .amora-gift-specular { position: absolute; z-index: 5; inset: 10%; border-radius: 30%; background: linear-gradient(125deg, rgba(255,255,255,.32), transparent 18% 72%, rgba(255,255,255,.08)); mix-blend-mode: screen; pointer-events: none; }
        .amora-gift-shimmer { position: absolute; z-index: 3; width: 34%; height: 140%; left: -60%; top: -20%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.42), transparent); transform: rotate(22deg); opacity: .35; pointer-events: none; }
        .is-animated .amora-gift-face { animation: amoraGiftFloat 2.6s ease-in-out infinite; }
        .is-animated .orbit-a { animation: amoraGiftOrbit 4.8s linear infinite; }
        .is-animated .orbit-b { animation: amoraGiftOrbitReverse 6.4s linear infinite; }
        .is-animated .amora-gift-shimmer { animation: amoraGiftShimmer 3.6s ease-in-out infinite; }
        .amora-gift-3d-mythic .amora-gift-face, .amora-gift-3d-legendary .amora-gift-face { box-shadow: inset 0 1px rgba(255,255,255,.28), 0 18px 36px rgba(0,0,0,.3), 0 0 42px var(--gift-glow); }
        @keyframes amoraGiftFloat { 0%,100% { transform: rotateX(7deg) rotateY(-7deg) translate3d(0,0,18px); } 50% { transform: rotateX(10deg) rotateY(6deg) translate3d(0,-6px,24px); } }
        @keyframes amoraGiftOrbit { to { transform: rotateX(65deg) rotateZ(342deg); } }
        @keyframes amoraGiftOrbitReverse { to { transform: rotateY(67deg) rotateZ(-344deg); } }
        @keyframes amoraGiftShimmer { 0%,20% { left: -60%; } 55%,100% { left: 125%; } }
        @media (prefers-reduced-motion: reduce) { .is-animated .amora-gift-face, .is-animated .orbit-a, .is-animated .orbit-b, .is-animated .amora-gift-shimmer { animation: none; } }
      `}</style>
    </div>
  );
}
