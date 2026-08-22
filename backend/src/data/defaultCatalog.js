// backend/src/data/defaultCatalog.js
//
// image_url can be a real hosted image URL, or — since we don't want to
// depend on external asset hosting for a starter catalog — a plain emoji
// character. Every frontend that renders image_url treats it as an <img>
// when it looks like a URL, and as raw text/emoji otherwise.
//
// Themed around Amora's brand: lions (strength, the "king of the room"
// framing TikTok-style gifting culture uses for its biggest spenders) and
// a cosmic/universe motif for the very top tier.

const GIFTS = [
  // ---- common (5-45 coins) ----
  { name: 'Thumbs Up', image_url: '👍', coin_price: 5, rarity: 'common', category: 'classic', description: 'Quick support for the stream.' },
  { name: 'Clap', image_url: '👏', coin_price: 15, rarity: 'common', category: 'classic', description: 'Give them a round of applause.' },
  { name: 'Wink', image_url: '😉', coin_price: 8, rarity: 'common', category: 'fun', description: 'A playful little nudge.' },
  { name: 'Rose', image_url: '🌹', coin_price: 10, rarity: 'common', category: 'romantic', description: 'A classic way to say you noticed.' },
  { name: 'Heart', image_url: '💖', coin_price: 20, rarity: 'common', category: 'romantic', description: 'Show a little love.' },
  { name: 'Kiss', image_url: '💋', coin_price: 25, rarity: 'common', category: 'romantic', description: 'Blow them a kiss.' },
  { name: 'Balloon', image_url: '🎈', coin_price: 30, rarity: 'common', category: 'fun', description: 'Float one up for them.' },
  { name: 'Bubble Tea', image_url: '🧋', coin_price: 35, rarity: 'common', category: 'fun', description: 'A little treat for the stream.' },
  { name: 'Ice Cream', image_url: '🍦', coin_price: 40, rarity: 'common', category: 'fun', description: 'Sweet and simple.' },
  { name: 'Cupcake', image_url: '🧁', coin_price: 45, rarity: 'common', category: 'fun', description: 'A little celebration.' },

  // ---- rare (100-600 coins) ----
  { name: 'Music Note', image_url: '🎵', coin_price: 120, rarity: 'rare', category: 'fun', description: 'Keep the vibe going.' },
  { name: 'Love Letter', image_url: '💌', coin_price: 160, rarity: 'rare', category: 'romantic', description: 'Something to remember you by.' },
  { name: 'Perfume', image_url: '🧴', coin_price: 150, rarity: 'rare', category: 'romantic', description: 'A signature scent, just for them.' },
  { name: 'Butterfly', image_url: '🦋', coin_price: 180, rarity: 'rare', category: 'romantic', description: 'Delicate and eye-catching.' },
  { name: 'Cocktail', image_url: '🍸', coin_price: 220, rarity: 'rare', category: 'luxury', description: 'Cheers to the stream.' },
  { name: 'Teddy Bear', image_url: '🧸', coin_price: 200, rarity: 'rare', category: 'romantic', description: 'Something soft to remember you by.' },
  { name: 'Magic Wand', image_url: '🪄', coin_price: 280, rarity: 'rare', category: 'fun', description: 'A little sparkle of magic.' },
  { name: 'Fireworks', image_url: '🎆', coin_price: 250, rarity: 'rare', category: 'seasonal', description: 'Light up the stream.' },
  { name: 'Champagne', image_url: '🍾', coin_price: 300, rarity: 'rare', category: 'luxury', description: 'Pop the bottle.' },
  { name: 'Shooting Star', image_url: '🌠', coin_price: 350, rarity: 'rare', category: 'cosmic', description: 'Make a wish.' },
  { name: 'Comet', image_url: '☄️', coin_price: 400, rarity: 'rare', category: 'cosmic', description: 'Streaking across the room.' },
  { name: 'Ring', image_url: '💍', coin_price: 500, rarity: 'rare', category: 'romantic', description: 'A promise of something more.' },

  // ---- epic (1,000-4,000 coins) ----
  { name: 'Wolf Howl', image_url: '🐺', coin_price: 1600, rarity: 'epic', category: 'wild', description: 'Call of the pack.' },
  { name: 'Sports Car', image_url: '🏎️', coin_price: 1500, rarity: 'epic', category: 'luxury', description: 'Pull up in style.' },
  { name: 'Tiger', image_url: '🐯', coin_price: 1800, rarity: 'epic', category: 'wild', description: 'Fierce and unforgettable.' },
  { name: 'Golden Gate', image_url: '⛩️', coin_price: 2200, rarity: 'epic', category: 'luxury', description: 'A grand entrance.' },
  { name: 'Yacht', image_url: '🛥️', coin_price: 2500, rarity: 'epic', category: 'luxury', description: 'Sail away together.' },
  { name: 'Eagle Flight', image_url: '🦅', coin_price: 2000, rarity: 'epic', category: 'wild', description: 'Soar above the room.' },
  { name: 'Meteor Shower', image_url: '🌠', coin_price: 2600, rarity: 'epic', category: 'cosmic', description: 'A shower of stars for the room.' },
  { name: 'Unicorn', image_url: '🦄', coin_price: 2800, rarity: 'epic', category: 'fun', description: 'Rare and magical.' },
  { name: 'Crown', image_url: '👑', coin_price: 3000, rarity: 'epic', category: 'luxury', description: 'Crown them royalty of the room.' },
  { name: "Dragon's Egg", image_url: '🥚', coin_price: 3200, rarity: 'epic', category: 'wild', description: 'Something legendary is hatching.' },
  { name: 'Aurora', image_url: '🌌', coin_price: 3500, rarity: 'epic', category: 'cosmic', description: 'Lights up the whole room.' },
  { name: 'Phoenix Rising', image_url: '🔥', coin_price: 3800, rarity: 'epic', category: 'wild', description: 'Rising above the rest.' },

  // ---- legendary (5,000-18,000 coins) ----
  { name: 'Solar Flare', image_url: '☀️', coin_price: 9000, rarity: 'legendary', category: 'cosmic', description: 'A burst of pure energy.' },
  { name: 'Diamond', image_url: '💎', coin_price: 8000, rarity: 'legendary', category: 'luxury', description: 'The ultimate show of support.' },
  { name: 'Galaxy Express', image_url: '🚂', coin_price: 11000, rarity: 'legendary', category: 'cosmic', description: 'A one-way ticket to the stars.' },
  { name: 'Rocket', image_url: '🚀', coin_price: 10000, rarity: 'legendary', category: 'cosmic', description: "Send their stream into orbit." },
  { name: 'Black Hole', image_url: '🕳️', coin_price: 13000, rarity: 'legendary', category: 'cosmic', description: 'Pulls every eye in the room.' },
  { name: 'Lion', image_url: '🦁', coin_price: 12000, rarity: 'legendary', category: 'wild', description: 'King of the jungle, king of the room.' },
  { name: 'Golden Lion', image_url: '🦁', coin_price: 14000, rarity: 'legendary', category: 'wild', description: 'A lion cast in gold.' },
  { name: 'Infinity Crown', image_url: '♾️', coin_price: 16000, rarity: 'legendary', category: 'luxury', description: 'A crown without limits.' },
  { name: 'Castle', image_url: '🏰', coin_price: 15000, rarity: 'legendary', category: 'luxury', description: 'A kingdom of your own.' },
  { name: 'Amora Throne', image_url: '👑', coin_price: 17000, rarity: 'legendary', category: 'luxury', description: 'Take your seat at the top of Amora.' },

  // ---- mythic (20,000-60,000 coins) — Amora's biggest, rarest gifts ----
  { name: 'Lion King', image_url: '🦁', coin_price: 25000, rarity: 'mythic', category: 'wild', description: "Amora's ultimate tribute to strength and loyalty." },
  { name: 'Guardian Lion', image_url: '🦁', coin_price: 28000, rarity: 'mythic', category: 'wild', description: 'Watches over the whole room.' },
  { name: 'Amora Universe', image_url: '🌌', coin_price: 30000, rarity: 'mythic', category: 'cosmic', description: 'An entire universe, gifted in a moment.' },
  { name: 'Cosmic Phoenix', image_url: '🔥', coin_price: 35000, rarity: 'mythic', category: 'cosmic', description: 'Reborn among the stars.' },
  { name: 'Supernova', image_url: '💫', coin_price: 45000, rarity: 'mythic', category: 'cosmic', description: 'The single brightest moment on Amora.' },
  { name: 'Eternal Amora', image_url: '♾️', coin_price: 60000, rarity: 'mythic', category: 'luxury', description: "Amora's rarest gift. Reserved for legends." }
];

const COIN_PACKAGES = [
  { name: 'Starter Pack', price_cents: 199, coins_amount: 100, bonus_coins: 0, platform: 'web' },
  { name: 'Popular Pack', price_cents: 999, coins_amount: 550, bonus_coins: 50, platform: 'web' },
  { name: 'Value Pack', price_cents: 1999, coins_amount: 1200, bonus_coins: 200, platform: 'web' },
  { name: 'Big Spender', price_cents: 4999, coins_amount: 3200, bonus_coins: 600, platform: 'web' },
  { name: 'Whale Pack', price_cents: 9999, coins_amount: 7000, bonus_coins: 1500, is_promotion: true, platform: 'web' }
];

module.exports = { GIFTS, COIN_PACKAGES };
