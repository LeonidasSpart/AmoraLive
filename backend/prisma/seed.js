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
//
// The GIFTS/COIN_PACKAGES data now lives in src/data/defaultCatalog.js so
// it can be reused both here (CLI seed) and by the admin-triggered
// "Seed default gifts" endpoint — no need for Railway console access to
// populate a fresh deploy.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { GIFTS, COIN_PACKAGES } = require('../src/data/defaultCatalog');

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
  for (const pkg of COIN_PACKAGES) {
    const existing = await prisma.coinPackage.findFirst({ where: { name: pkg.name, platform: pkg.platform } });
    if (existing) {
      await prisma.coinPackage.update({ where: { id: existing.id }, data: { ...pkg, is_active: true } });
    } else {
      await prisma.coinPackage.create({ data: pkg });
    }
  }
  console.log(`✅ Seeded ${COIN_PACKAGES.length} coin packages`);
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

