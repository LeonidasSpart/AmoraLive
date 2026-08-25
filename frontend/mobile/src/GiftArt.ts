import { ImageSourcePropType } from "react-native";

// The mobile repository used to reference a large set of PNG files that are
// not part of the repository snapshot. That makes Metro fail before the app
// can even start. Prefer the catalog's HTTPS image when available and keep
// one bundled fallback so the gift shelf is always renderable.
const FALLBACK_ART: ImageSourcePropType = require("../assets/gift-fallback.png");

export function giftArt(gift: {
  glyph?: string | null;
  name?: string | null;
  image_url?: string | null;
}): ImageSourcePropType {
  const imageUrl = String(gift?.image_url || "").trim();

  if (/^https:\/\//i.test(imageUrl)) {
    return { uri: imageUrl };
  }

  return FALLBACK_ART;
}
