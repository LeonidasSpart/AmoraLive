// backend/src/data/defaultCatalog.js
//
// Amora's starter catalog uses first-party SVG gift art rather than plain
// emoji. The same asset can be used as a lightweight animated gift effect
// in the live room while remaining sharp on mobile and web.
//
// Themed around Amora's brand: lions (strength, the "king of the room"
// framing TikTok-style gifting culture uses for its biggest spenders) and
// a cosmic/universe motif for the very top tier.

const GIFTS = [
  // ---- common (5-45 coins) ----
  { name: 'Thumbs Up', image_url: '/gifts/thumbs-up.svg', animation_url: '/gifts/thumbs-up.svg', coin_price: 5, rarity: 'common', category: 'classic', description: 'Quick support for the stream.' },
  { name: 'Clap', image_url: '/gifts/clap.svg', animation_url: '/gifts/clap.svg', coin_price: 15, rarity: 'common', category: 'classic', description: 'Give them a round of applause.' },
  { name: 'Wink', image_url: '/gifts/wink.svg', animation_url: '/gifts/wink.svg', coin_price: 8, rarity: 'common', category: 'fun', description: 'A playful little nudge.' },
  { name: 'Rose', image_url: '/gifts/rose.svg', animation_url: '/gifts/rose.svg', coin_price: 10, rarity: 'common', category: 'romantic', description: 'A classic way to say you noticed.' },
  { name: 'Heart', image_url: '/gifts/heart.svg', animation_url: '/gifts/heart.svg', coin_price: 20, rarity: 'common', category: 'romantic', description: 'Show a little love.' },
  { name: 'Kiss', image_url: '/gifts/kiss.svg', animation_url: '/gifts/kiss.svg', coin_price: 25, rarity: 'common', category: 'romantic', description: 'Blow them a kiss.' },
  { name: 'Balloon', image_url: '/gifts/balloon.svg', animation_url: '/gifts/balloon.svg', coin_price: 30, rarity: 'common', category: 'fun', description: 'Float one up for them.' },
  { name: 'Bubble Tea', image_url: '/gifts/bubble-tea.svg', animation_url: '/gifts/bubble-tea.svg', coin_price: 35, rarity: 'common', category: 'fun', description: 'A little treat for the stream.' },
  { name: 'Ice Cream', image_url: '/gifts/ice-cream.svg', animation_url: '/gifts/ice-cream.svg', coin_price: 40, rarity: 'common', category: 'fun', description: 'Sweet and simple.' },
  { name: 'Cupcake', image_url: '/gifts/cupcake.svg', animation_url: '/gifts/cupcake.svg', coin_price: 45, rarity: 'common', category: 'fun', description: 'A little celebration.' },

  // ---- rare (100-600 coins) ----
  { name: 'Music Note', image_url: '/gifts/music-note.svg', animation_url: '/gifts/music-note.svg', coin_price: 120, rarity: 'rare', category: 'fun', description: 'Keep the vibe going.' },
  { name: 'Love Letter', image_url: '/gifts/love-letter.svg', animation_url: '/gifts/love-letter.svg', coin_price: 160, rarity: 'rare', category: 'romantic', description: 'Something to remember you by.' },
  { name: 'Perfume', image_url: '/gifts/perfume.svg', animation_url: '/gifts/perfume.svg', coin_price: 150, rarity: 'rare', category: 'romantic', description: 'A signature scent, just for them.' },
  { name: 'Butterfly', image_url: '/gifts/butterfly.svg', animation_url: '/gifts/butterfly.svg', coin_price: 180, rarity: 'rare', category: 'romantic', description: 'Delicate and eye-catching.' },
  { name: 'Cocktail', image_url: '/gifts/cocktail.svg', animation_url: '/gifts/cocktail.svg', coin_price: 220, rarity: 'rare', category: 'luxury', description: 'Cheers to the stream.' },
  { name: 'Teddy Bear', image_url: '/gifts/teddy-bear.svg', animation_url: '/gifts/teddy-bear.svg', coin_price: 200, rarity: 'rare', category: 'romantic', description: 'Something soft to remember you by.' },
  { name: 'Magic Wand', image_url: '/gifts/magic-wand.svg', animation_url: '/gifts/magic-wand.svg', coin_price: 280, rarity: 'rare', category: 'fun', description: 'A little sparkle of magic.' },
  { name: 'Fireworks', image_url: '/gifts/fireworks.svg', animation_url: '/gifts/fireworks.svg', coin_price: 250, rarity: 'rare', category: 'seasonal', description: 'Light up the stream.' },
  { name: 'Champagne', image_url: '/gifts/champagne.svg', animation_url: '/gifts/champagne.svg', coin_price: 300, rarity: 'rare', category: 'luxury', description: 'Pop the bottle.' },
  { name: 'Shooting Star', image_url: '/gifts/shooting-star.svg', animation_url: '/gifts/shooting-star.svg', coin_price: 350, rarity: 'rare', category: 'cosmic', description: 'Make a wish.' },
  { name: 'Comet', image_url: '/gifts/comet.svg', animation_url: '/gifts/comet.svg', coin_price: 400, rarity: 'rare', category: 'cosmic', description: 'Streaking across the room.' },
  { name: 'Ring', image_url: '/gifts/ring.svg', animation_url: '/gifts/ring.svg', coin_price: 500, rarity: 'rare', category: 'romantic', description: 'A promise of something more.' },

  // ---- epic (1,000-4,000 coins) ----
  { name: 'Wolf Howl', image_url: '/gifts/wolf-howl.svg', animation_url: '/gifts/wolf-howl.svg', coin_price: 1600, rarity: 'epic', category: 'wild', description: 'Call of the pack.' },
  { name: 'Sports Car', image_url: '/gifts/sports-car.svg', animation_url: '/gifts/sports-car.svg', coin_price: 1500, rarity: 'epic', category: 'luxury', description: 'Pull up in style.' },
  { name: 'Tiger', image_url: '/gifts/tiger.svg', animation_url: '/gifts/tiger.svg', coin_price: 1800, rarity: 'epic', category: 'wild', description: 'Fierce and unforgettable.' },
  { name: 'Golden Gate', image_url: '/gifts/golden-gate.svg', animation_url: '/gifts/golden-gate.svg', coin_price: 2200, rarity: 'epic', category: 'luxury', description: 'A grand entrance.' },
  { name: 'Yacht', image_url: '/gifts/yacht.svg', animation_url: '/gifts/yacht.svg', coin_price: 2500, rarity: 'epic', category: 'luxury', description: 'Sail away together.' },
  { name: 'Eagle Flight', image_url: '/gifts/eagle-flight.svg', animation_url: '/gifts/eagle-flight.svg', coin_price: 2000, rarity: 'epic', category: 'wild', description: 'Soar above the room.' },
  { name: 'Meteor Shower', image_url: '/gifts/meteor-shower.svg', animation_url: '/gifts/meteor-shower.svg', coin_price: 2600, rarity: 'epic', category: 'cosmic', description: 'A shower of stars for the room.' },
  { name: 'Unicorn', image_url: '/gifts/unicorn.svg', animation_url: '/gifts/unicorn.svg', coin_price: 2800, rarity: 'epic', category: 'fun', description: 'Rare and magical.' },
  { name: 'Crown', image_url: '/gifts/crown.svg', animation_url: '/gifts/crown.svg', coin_price: 3000, rarity: 'epic', category: 'luxury', description: 'Crown them royalty of the room.' },
  { name: "Dragon's Egg", image_url: '/gifts/dragon-s-egg.svg', animation_url: '/gifts/dragon-s-egg.svg', coin_price: 3200, rarity: 'epic', category: 'wild', description: 'Something legendary is hatching.' },
  { name: 'Aurora', image_url: '/gifts/aurora.svg', animation_url: '/gifts/aurora.svg', coin_price: 3500, rarity: 'epic', category: 'cosmic', description: 'Lights up the whole room.' },
  { name: 'Phoenix Rising', image_url: '/gifts/phoenix-rising.svg', animation_url: '/gifts/phoenix-rising.svg', coin_price: 3800, rarity: 'epic', category: 'wild', description: 'Rising above the rest.' },

  // ---- legendary (5,000-18,000 coins) ----
  { name: 'Solar Flare', image_url: '/gifts/solar-flare.svg', animation_url: '/gifts/solar-flare.svg', coin_price: 9000, rarity: 'legendary', category: 'cosmic', description: 'A burst of pure energy.' },
  { name: 'Diamond', image_url: '/gifts/diamond.svg', animation_url: '/gifts/diamond.svg', coin_price: 8000, rarity: 'legendary', category: 'luxury', description: 'The ultimate show of support.' },
  { name: 'Galaxy Express', image_url: '/gifts/galaxy-express.svg', animation_url: '/gifts/galaxy-express.svg', coin_price: 11000, rarity: 'legendary', category: 'cosmic', description: 'A one-way ticket to the stars.' },
  { name: 'Rocket', image_url: '/gifts/rocket.svg', animation_url: '/gifts/rocket.svg', coin_price: 10000, rarity: 'legendary', category: 'cosmic', description: "Send their stream into orbit." },
  { name: 'Black Hole', image_url: '/gifts/black-hole.svg', animation_url: '/gifts/black-hole.svg', coin_price: 13000, rarity: 'legendary', category: 'cosmic', description: 'Pulls every eye in the room.' },
  { name: 'Lion', image_url: '/gifts/lion.svg', animation_url: '/gifts/lion.svg', coin_price: 12000, rarity: 'legendary', category: 'wild', description: 'King of the jungle, king of the room.' },
  { name: 'Golden Lion', image_url: '/gifts/golden-lion.svg', animation_url: '/gifts/golden-lion.svg', coin_price: 14000, rarity: 'legendary', category: 'wild', description: 'A lion cast in gold.' },
  { name: 'Infinity Crown', image_url: '/gifts/infinity-crown.svg', animation_url: '/gifts/infinity-crown.svg', coin_price: 16000, rarity: 'legendary', category: 'luxury', description: 'A crown without limits.' },
  { name: 'Castle', image_url: '/gifts/castle.svg', animation_url: '/gifts/castle.svg', coin_price: 15000, rarity: 'legendary', category: 'luxury', description: 'A kingdom of your own.' },
  { name: 'Amora Throne', image_url: '/gifts/amora-throne.svg', animation_url: '/gifts/amora-throne.svg', coin_price: 17000, rarity: 'legendary', category: 'luxury', description: 'Take your seat at the top of Amora.' },

  // ---- mythic (20,000-60,000 coins) — Amora's biggest, rarest gifts ----
  { name: 'Lion King', image_url: '/gifts/lion-king.svg', animation_url: '/gifts/lion-king.svg', coin_price: 25000, rarity: 'mythic', category: 'wild', description: "Amora's ultimate tribute to strength and loyalty." },
  { name: 'Guardian Lion', image_url: '/gifts/guardian-lion.svg', animation_url: '/gifts/guardian-lion.svg', coin_price: 28000, rarity: 'mythic', category: 'wild', description: 'Watches over the whole room.' },
  { name: 'Amora Universe', image_url: '/gifts/amora-universe.svg', animation_url: '/gifts/amora-universe.svg', coin_price: 30000, rarity: 'mythic', category: 'cosmic', description: 'An entire universe, gifted in a moment.' },
  { name: 'Cosmic Phoenix', image_url: '/gifts/cosmic-phoenix.svg', animation_url: '/gifts/cosmic-phoenix.svg', coin_price: 35000, rarity: 'mythic', category: 'cosmic', description: 'Reborn among the stars.' },
  { name: 'Supernova', image_url: '/gifts/supernova.svg', animation_url: '/gifts/supernova.svg', coin_price: 45000, rarity: 'mythic', category: 'cosmic', description: 'The single brightest moment on Amora.' },
  { name: 'Eternal Amora', image_url: '/gifts/eternal-amora.svg', animation_url: '/gifts/eternal-amora.svg', coin_price: 60000, rarity: 'mythic', category: 'luxury', description: "Amora's rarest gift. Reserved for legends." }
];

const COIN_PACKAGES = [
  { name: 'Starter Pack', price_cents: 199, coins_amount: 100, bonus_coins: 0, platform: 'web' },
  { name: 'Popular Pack', price_cents: 999, coins_amount: 550, bonus_coins: 50, platform: 'web' },
  { name: 'Value Pack', price_cents: 1999, coins_amount: 1200, bonus_coins: 200, platform: 'web' },
  { name: 'Big Spender', price_cents: 4999, coins_amount: 3200, bonus_coins: 600, platform: 'web' },
  { name: 'Whale Pack', price_cents: 9999, coins_amount: 7000, bonus_coins: 1500, is_promotion: true, platform: 'web' }
];

module.exports = { GIFTS, COIN_PACKAGES };
