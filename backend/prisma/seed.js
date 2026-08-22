// backend/prisma/seed.js
//
// Populates a real, purchasable gift catalog. There was previously no seed
// data at all, so /gifts/catalog returned an empty array on every fresh
// deploy and nobody could ever actually send a gift.
//
// Safe to re-run: gifts are upserted by name, so running this again after
// editing the list below won't create duplicates.
//
// Run with: npx prisma db seed
// (or directly: node prisma/seed.js)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// image_url can be a real hosted image URL, or — since we don't want to
// depend on external asset hosting for a starter catalog — a plain emoji
// character. The frontend renders image_url as an <img> when it looks like
// a URL, and as raw text/emoji otherwise.
const GIFTS = [
  // ---- common ----
  { name: 'Rose', image_url: '🌹', coin_price: 10, rarity: 'common', category: 'classic', description: 'A classic way to say you noticed.' },
  { name: 'Thumbs Up', image_url: '👍', coin_price: 5, rarity: 'common', category: 'classic', description: 'Quick support for the stream.' },
  { name: 'Clap', image_url: '👏', coin_price: 15, rarity: 'common', category: 'classic', description: 'Give them a round of applause.' },
  { name: 'Kiss', image_url: '💋', coin_price: 25, rarity: 'common', category: 'romantic', description: 'Blow them a kiss.' },
  { name: 'Balloon', image_url: '🎈', coin_price: 30, rarity: 'common', category: 'fun', description: 'Float one up for them.' },
  { name: 'Heart', image_url: '💖', coin_price: 20, rarity: 'common', category: 'romantic', description: 'Show a little love.' },

  // ---- rare ----
  { name: 'Perfume', image_url: '🧴', coin_price: 150, rarity: 'rare', category: 'romantic', description: 'A signature scent, just for them.' },
  { name: 'Teddy Bear', image_url: '🧸', coin_price: 200, rarity: 'rare', category: 'romantic', description: 'Something soft to remember you by.' },
  { name: 'Fireworks', image_url: '🎆', coin_price: 250, rarity: 'rare', category: 'seasonal', description: 'Light up the stream.' },
  { name: 'Champagne', image_url: '🍾', coin_price: 300, rarity: 'rare', category: 'luxury', description: 'Pop the bottle.' },
  { name: 'Ring', image_url: '💍', coin_price: 500, rarity: 'rare', category: 'romantic', description: 'A promise of something more.' },

  // ---- epic ----
  { name: 'Sports Car', image_url: '🏎️', coin_price: 1500, rarity: 'epic', category: 'luxury', description: 'Pull up in style.' },
  { name: 'Yacht', image_url: '🛥️', coin_price: 2500, rarity: 'epic', category: 'luxury', description: 'Sail away together.' },
  { name: 'Crown', image_url: '👑', coin_price: 3000, rarity: 'epic', category: 'luxury', description: 'Crown them royalty of the room.' },

  // ---- legendary ----
  { name: 'Diamond', image_url: '💎', coin_price: 8000, rarity: 'legendary', category: 'luxury', description: 'The ultimate show of support.' },
  { name: 'Rocket', image_url: '🚀', coin_price: 10000, rarity: 'legendary', category: 'luxury', description: 'Send their stream into orbit.' },
  { name: 'Lion', image_url: '🦁', coin_price: 12000, rarity: 'legendary', category: 'luxury', description: 'King of the jungle, king of the room.' },
  { name: 'Castle', image_url: '🏰', coin_price: 15000, rarity: 'legendary', category: 'luxury', description: 'The single biggest gift on Amora.' }
];

async function seedGifts() {
  for (const gift of GIFTS) {
    const existing = await prisma.giftCatalog.findFirst({ where: { name: gift.name } });
    if (existing) {
      await prisma.giftCatalog.update({ where: { id: existing.id }, data: { ...gift, is_active: true } });
    } else {
      await prisma.giftCatalog.create({ data: gift });
    }
  }
  console.log(`✅ Seeded ${GIFTS.length} gifts`);
}

async function seedCoinPackages() {
  const packages = [
    { name: 'Starter Pack', price_cents: 199, coins_amount: 100, bonus_coins: 0, platform: 'web' },
    { name: 'Popular Pack', price_cents: 999, coins_amount: 550, bonus_coins: 50, platform: 'web' },
    { name: 'Value Pack', price_cents: 1999, coins_amount: 1200, bonus_coins: 200, platform: 'web' },
    { name: 'Big Spender', price_cents: 4999, coins_amount: 3200, bonus_coins: 600, platform: 'web' },
    { name: 'Whale Pack', price_cents: 9999, coins_amount: 7000, bonus_coins: 1500, is_promotion: true, platform: 'web' }
  ];
  for (const pkg of packages) {
    const existing = await prisma.coinPackage.findFirst({ where: { name: pkg.name, platform: pkg.platform } });
    if (existing) {
      await prisma.coinPackage.update({ where: { id: existing.id }, data: { ...pkg, is_active: true } });
    } else {
      await prisma.coinPackage.create({ data: pkg });
    }
  }
  console.log(`✅ Seeded ${packages.length} coin packages`);
}

async function main() {
  await seedGifts();
  await seedCoinPackages();
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
