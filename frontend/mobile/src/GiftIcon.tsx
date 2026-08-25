import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { theme } from "./theme";

const RARITY = {
  common: { accent: "#d5d2df", glow: "rgba(255,255,255,.18)" },
  uncommon: { accent: "#8af5c6", glow: "rgba(93,224,174,.20)" },
  rare: { accent: "#a9e2ff", glow: "rgba(85,184,255,.22)" },
  epic: { accent: "#e4b9ff", glow: "rgba(184,117,255,.25)" },
  legendary: { accent: "#fff5a7", glow: "rgba(255,212,94,.32)" },
  mythic: { accent: "#ffd0ec", glow: "rgba(255,95,200,.34)" },
  royal: { accent: "#fff6bb", glow: "rgba(255,216,107,.42)" },
  eternal: { accent: "#f1d4ff", glow: "rgba(184,117,255,.48)" }
} as const;

const NAME_ART: Record<string, string> = {
  "Eternal Rose": "gifts/luxury/diamond-rose.svg", "Crystal Heart": "gifts/luxury/diamond-heart.svg",
  "Kiss": "gifts/kiss.svg", "Love Letter": "gifts/love-letter.svg", "Diamond Heart": "gifts/luxury/diamond-heart.svg",
  "Forever Love": "gifts/luxury/diamond-heart.svg", "Romantic Rose": "gifts/luxury/diamond-rose.svg",
  "Cupid": "gifts/luxury/diamond-heart.svg", "Love Crown": "gifts/luxury/royal-crown.svg", "Eternal Love": "gifts/luxury/diamond-heart.svg",
  "Diamond": "gifts/diamond.svg", "Diamond Crown": "gifts/luxury/royal-crown.svg", "Gold Crown": "gifts/luxury/royal-crown.svg",
  "Luxury Car": "gifts/luxury/luxury-car.svg", "Private Jet": "gifts/luxury/private-jet.svg",
  "Gold Champagne": "gifts/luxury/champagne-royal.svg", "Diamond Ring": "gifts/luxury/diamond-ring.svg",
  "Treasure Chest": "gifts/castle.svg", "Golden Palace": "gifts/luxury/diamond-palace.svg", "Royal Throne": "gifts/luxury/amora-throne.svg",
  "Galaxy": "gifts/luxury/galaxy-heart.svg", "Moon": "gifts/aurora.svg", "Planet": "gifts/galaxy-express.svg",
  "Cosmic Heart": "gifts/luxury/galaxy-heart.svg", "Supernova": "gifts/supernova.svg", "Black Hole": "gifts/black-hole.svg",
  "Cosmic Rose": "gifts/luxury/diamond-rose.svg", "Star Portal": "gifts/shooting-star.svg", "Universe": "gifts/amora-universe.svg",
  "Infinity": "gifts/infinity-crown.svg", "Lightning": "gifts/solar-flare.svg", "Fire": "gifts/phoenix-rising.svg",
  "Thunder": "gifts/solar-flare.svg", "Phoenix": "gifts/luxury/golden-phoenix.svg", "Dragon": "gifts/dragon-s-egg.svg",
  "Energy Blast": "gifts/supernova.svg", "Golden Tiger": "gifts/golden-lion.svg", "Warrior": "gifts/legendary-sword.svg",
  "Crown of Power": "gifts/luxury/royal-crown.svg", "Legendary Sword": "gifts/legendary-sword.svg",
  "Confetti": "gifts/fireworks.svg", "Balloon": "gifts/balloon.svg", "Cupcake": "gifts/cupcake.svg",
  "Ice Cream": "gifts/ice-cream.svg", "Music": "gifts/music-note.svg", "Butterfly": "gifts/butterfly.svg",
  "Teddy Bear": "gifts/teddy-bear.svg", "Magic Box": "gifts/gift-box.svg", "Party Popper": "gifts/fireworks.svg",
  "Celebration": "gifts/fireworks.svg", "Amora Royal Crown": "gifts/luxury/royal-crown.svg",
  "Eternal Amora": "gifts/eternal-amora.svg", "Celestial Palace": "gifts/luxury/diamond-palace.svg",
  "Diamond Dragon": "gifts/dragon-s-egg.svg", "Royal Yacht": "gifts/luxury/royal-yacht.svg",
  "Amora Private Jet": "gifts/luxury/private-jet.svg", "Imperial Phoenix": "gifts/luxury/golden-phoenix.svg",
  "Amora Throne": "gifts/luxury/amora-throne.svg"
};

const GLYPH_ART: Record<string, string> = {
  rose: "gifts/luxury/diamond-rose.svg", heart: "gifts/luxury/diamond-heart.svg", kiss: "gifts/kiss.svg",
  letter: "gifts/love-letter.svg", crownHeart: "gifts/luxury/royal-crown.svg", diamond: "gifts/diamond.svg",
  crown: "gifts/luxury/royal-crown.svg", car: "gifts/luxury/luxury-car.svg", jet: "gifts/luxury/private-jet.svg",
  champagne: "gifts/luxury/champagne-royal.svg", ring: "gifts/luxury/diamond-ring.svg", chest: "gifts/castle.svg",
  palace: "gifts/luxury/diamond-palace.svg", throne: "gifts/luxury/amora-throne.svg", galaxy: "gifts/luxury/galaxy-heart.svg",
  moon: "gifts/aurora.svg", planet: "gifts/galaxy-express.svg", supernova: "gifts/supernova.svg",
  blackhole: "gifts/black-hole.svg", starPortal: "gifts/shooting-star.svg", infinity: "gifts/infinity-crown.svg",
  lightning: "gifts/solar-flare.svg", flame: "gifts/phoenix-rising.svg", phoenix: "gifts/luxury/golden-phoenix.svg",
  dragon: "gifts/dragon-s-egg.svg", sword: "gifts/legendary-sword.svg", confetti: "gifts/fireworks.svg",
  balloon: "gifts/balloon.svg", cupcake: "gifts/cupcake.svg", iceCream: "gifts/ice-cream.svg", music: "gifts/music-note.svg",
  butterfly: "gifts/butterfly.svg", teddyBear: "gifts/teddy-bear.svg", giftBox: "gifts/gift-box.svg",
  partyPopper: "gifts/fireworks.svg", yacht: "gifts/luxury/royal-yacht.svg", "golden-phoenix": "gifts/luxury/golden-phoenix.svg"
};

const ART_BASE = "https://amoramatch.one/";

export default function GiftIcon({
  name, glyph, rarity = "common", size = 64, animated = false
}: { name?: string | null; glyph?: string | null; rarity?: string | null; size?: number; animated?: boolean }) {
  const r = String(rarity || "common").toLowerCase() as keyof typeof RARITY;
  const meta = RARITY[r] || RARITY.common;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 1800, useNativeDriver: true })
    ]));
    loop.start();
    return () => loop.stop();
  }, [animated, float]);

  const art = useMemo(() => {
    return NAME_ART[String(name || "").trim()] || GLYPH_ART[String(glyph || "").trim()] || "gifts/gift-box.svg";
  }, [name, glyph]);

  const source = `${ART_BASE}${art}`;
  return (
    <View accessible accessibilityLabel={name || "Amora gift"} style={[s.stage, { width: size, height: size }]}>
      <View style={[s.orbit, { borderColor: `${meta.accent}55` }]} />
      <View style={[s.orbit, s.orbitB, { borderColor: `${meta.accent}35` }]} />
      <View style={[s.pedestal, { backgroundColor: meta.glow }]} />
      <Animated.View style={{
        width: size * .78, height: size * .78,
        transform: animated ? [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [3, -7] }) },
          { rotate: float.interpolate({ inputRange: [0, 1], outputRange: ["-2deg", "2deg"] }) }] : undefined
      }}>
        <View style={[s.face, {
          borderColor: `${meta.accent}70`,
          shadowColor: meta.accent,
          shadowOpacity: r === "legendary" || r === "mythic" || r === "royal" || r === "eternal" ? .38 : .20
        }]}>
          <Image source={source} style={s.image} contentFit="contain" transition={120} />
          <View style={s.shine} pointerEvents="none" />
        </View>
      </Animated.View>
      <View style={[s.specular, { borderColor: `${meta.accent}22` }]} pointerEvents="none" />
    </View>
  );
}

const s = StyleSheet.create({
  stage: { alignItems: "center", justifyContent: "center", position: "relative", overflow: "visible" },
  orbit: { position: "absolute", width: "94%", height: "54%", left: "3%", top: "24%", borderWidth: 1, borderRadius: 999, opacity: .8, transform: [{ rotate: "18deg" }] },
  orbitB: { transform: [{ rotate: "-28deg" }], opacity: .45 },
  pedestal: { position: "absolute", width: "70%", height: "18%", bottom: "2%", borderRadius: 999, opacity: .75 },
  face: { width: "100%", height: "100%", borderRadius: 22, borderWidth: 1, backgroundColor: "rgba(255,255,255,.055)", alignItems: "center", justifyContent: "center", shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
  image: { width: "88%", height: "88%" },
  shine: { position: "absolute", left: "8%", top: "8%", width: "28%", height: "80%", borderRadius: 20, backgroundColor: "rgba(255,255,255,.08)", transform: [{ rotate: "20deg" }] },
  specular: { position: "absolute", top: "10%", bottom: "10%", left: "10%", right: "10%", borderWidth: 1, borderRadius: 24, opacity: .7 }
});
