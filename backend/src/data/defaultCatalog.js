// backend/src/data/defaultCatalog.js
//
// Every gift's visual identity comes from `glyph` (a vector icon key
// rendered by frontend/web/components/GiftIcon.jsx) rather than image_url —
// image_url is kept as an optional override for real commissioned artwork
// later; when it's empty the frontend renders the vector icon instead, so a
// gift is never shown as a broken image or a plain emoji.
//
// Rarity within each category is price-banded: 2 common, 2 rare, 2 epic,
// 2 legendary, 2 mythic per 10-item category, giving every category the
// same spread from small tips to full-screen flex gifts.

const RARITY_BAND = ['common', 'common', 'rare', 'rare', 'epic', 'epic', 'legendary', 'legendary', 'mythic', 'mythic'];
const PRICE_BAND = [15, 40, 150, 400, 1800, 3200, 12000, 16000, 30000, 60000];

// name -> glyph key. Must match GIFT_GLYPH_MAP in
// frontend/web/components/GiftIcon.jsx (kept in sync manually — the
// frontend also has its own fallback map as a safety net).
const GLYPH_MAP = {
  'Eternal Rose': 'rose', 'Crystal Heart': 'heart', 'Kiss': 'kiss', 'Love Letter': 'letter',
  'Diamond Heart': 'heart', 'Forever Love': 'infinity', 'Romantic Rose': 'rose', 'Cupid': 'heart',
  'Love Crown': 'crownHeart', 'Eternal Love': 'infinity',
  'Diamond': 'diamond', 'Diamond Crown': 'crown', 'Gold Crown': 'crown', 'Luxury Car': 'car',
  'Private Jet': 'jet', 'Gold Champagne': 'champagne', 'Diamond Ring': 'ring', 'Treasure Chest': 'chest',
  'Golden Palace': 'palace', 'Royal Throne': 'throne',
  'Galaxy': 'galaxy', 'Moon': 'moon', 'Planet': 'planet', 'Cosmic Heart': 'heart',
  'Supernova': 'supernova', 'Black Hole': 'blackhole', 'Cosmic Rose': 'rose', 'Star Portal': 'starPortal',
  'Universe': 'galaxy', 'Infinity': 'infinity',
  'Lightning': 'lightning', 'Fire': 'flame', 'Thunder': 'lightning', 'Phoenix': 'phoenix',
  'Dragon': 'dragon', 'Energy Blast': 'supernova', 'Golden Tiger': 'flame', 'Warrior': 'sword',
  'Crown of Power': 'crown', 'Legendary Sword': 'sword',
  'Confetti': 'confetti', 'Balloon': 'balloon', 'Cupcake': 'cupcake', 'Ice Cream': 'iceCream',
  'Music': 'music', 'Butterfly': 'butterfly', 'Teddy Bear': 'teddyBear', 'Magic Box': 'giftBox',
  'Party Popper': 'partyPopper', 'Celebration': 'confetti'
};

function buildCategory(category, items) {
  return items.map((name, i) => ({
    name,
    coin_price: PRICE_BAND[i],
    rarity: RARITY_BAND[i],
    category,
    glyph: GLYPH_MAP[name] || 'giftBox',
    sort_order: i,
    description: null,
    image_url: '',
    animation_url: null,
    sound_url: null
  }));
}

const GIFTS = [
  ...buildCategory('romance', ['Eternal Rose', 'Crystal Heart', 'Kiss', 'Love Letter', 'Diamond Heart', 'Forever Love', 'Romantic Rose', 'Cupid', 'Love Crown', 'Eternal Love']),
  ...buildCategory('luxury', ['Diamond', 'Diamond Crown', 'Gold Crown', 'Luxury Car', 'Private Jet', 'Gold Champagne', 'Diamond Ring', 'Treasure Chest', 'Golden Palace', 'Royal Throne']),
  ...buildCategory('cosmic', ['Galaxy', 'Moon', 'Planet', 'Cosmic Heart', 'Supernova', 'Black Hole', 'Cosmic Rose', 'Star Portal', 'Universe', 'Infinity']),
  ...buildCategory('power', ['Lightning', 'Fire', 'Thunder', 'Phoenix', 'Dragon', 'Energy Blast', 'Golden Tiger', 'Warrior', 'Crown of Power', 'Legendary Sword']),
  ...buildCategory('fun', ['Confetti', 'Balloon', 'Cupcake', 'Ice Cream', 'Music', 'Butterfly', 'Teddy Bear', 'Magic Box', 'Party Popper', 'Celebration'])
];

const COIN_PACKAGES = [
  { name: 'Starter Pack', price_cents: 199, coins_amount: 100, bonus_coins: 0, platform: 'web' },
  { name: 'Popular Pack', price_cents: 999, coins_amount: 550, bonus_coins: 50, platform: 'web' },
  { name: 'Value Pack', price_cents: 1999, coins_amount: 1200, bonus_coins: 200, platform: 'web' },
  { name: 'Big Spender', price_cents: 4999, coins_amount: 3200, bonus_coins: 600, platform: 'web' },
  { name: 'Whale Pack', price_cents: 9999, coins_amount: 7000, bonus_coins: 1500, is_promotion: true, platform: 'web' }
];

module.exports = { GIFTS, COIN_PACKAGES };
