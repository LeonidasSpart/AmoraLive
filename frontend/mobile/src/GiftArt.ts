import { ImageSourcePropType } from "react-native";

// Local PNG renders of the existing Amora vector gift library. Keeping the
// art bundled avoids broken/empty gift tiles when image_url is not populated.
const ART: Record<string, ImageSourcePropType> = {
  rose: require("../assets/gifts/diamond-rose.png"),
  heart: require("../assets/gifts/diamond-heart.png"),
  kiss: require("../assets/gifts/kiss.png"),
  letter: require("../assets/gifts/love-letter.png"),
  crownHeart: require("../assets/gifts/royal-crown.png"),
  diamond: require("../assets/gifts/diamond.png"),
  crown: require("../assets/gifts/royal-crown.png"),
  car: require("../assets/gifts/luxury-car.png"),
  jet: require("../assets/gifts/private-jet.png"),
  yacht: require("../assets/gifts/yacht.png"),
  champagne: require("../assets/gifts/champagne-royal.png"),
  ring: require("../assets/gifts/diamond-ring.png"),
  chest: require("../assets/gifts/castle.png"),
  palace: require("../assets/gifts/diamond-palace.png"),
  throne: require("../assets/gifts/amora-throne.png"),
  galaxy: require("../assets/gifts/galaxy-heart.png"),
  moon: require("../assets/gifts/aurora.png"),
  planet: require("../assets/gifts/galaxy-express.png"),
  supernova: require("../assets/gifts/supernova.png"),
  blackhole: require("../assets/gifts/black-hole.png"),
  starPortal: require("../assets/gifts/shooting-star.png"),
  infinity: require("../assets/gifts/infinity-crown.png"),
  lightning: require("../assets/gifts/solar-flare.png"),
  flame: require("../assets/gifts/phoenix-rising.png"),
  phoenix: require("../assets/gifts/golden-phoenix.png"),
  goldenPhoenix: require("../assets/gifts/golden-phoenix.png"),
  dragon: require("../assets/gifts/dragon-s-egg.png"),
  sword: require("../assets/gifts/legendary-sword.png"),
  confetti: require("../assets/gifts/fireworks.png"),
  balloon: require("../assets/gifts/balloon.png"),
  cupcake: require("../assets/gifts/cupcake.png"),
  iceCream: require("../assets/gifts/ice-cream.png"),
  music: require("../assets/gifts/music-note.png"),
  butterfly: require("../assets/gifts/butterfly.png"),
  teddyBear: require("../assets/gifts/teddy-bear.png"),
  giftBox: require("../assets/gifts/gift-box.png"),
  partyPopper: require("../assets/gifts/fireworks.png")
};

export function giftArt(gift: { glyph?: string | null; name?: string | null; image_url?: string | null }): ImageSourcePropType {
  const glyph = String(gift?.glyph || "");
  return ART[glyph] || ART.giftBox;
}
