import { useEffect, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { giftArt } from "./GiftArt";
import { theme } from "./theme";

export default function LuxuryGiftCard({ gift, onPress }: { gift: any; onPress?: () => void }) {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 1800, useNativeDriver: true })
    ]));
    loop.start();
    return () => loop.stop();
  }, [float]);
  const rarity = String(gift?.rarity || "rare").toLowerCase();
  const premium = ["legendary", "mythic", "royal", "eternal"].includes(rarity);
  return <Pressable onPress={onPress} style={s.card}>
    <View style={s.sheen} />
    <Text style={s.rarity}>{rarity.toUpperCase()}</Text>
    <Animated.View style={{ transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [3, -7] }) }, { rotate: float.interpolate({ inputRange: [0, 1], outputRange: ["-2deg", "2deg"] }) }] }}>
      <Image source={giftArt(gift)} style={s.art} />
    </Animated.View>
    <Text style={s.name} numberOfLines={1}>{gift?.name || "Amora Gift"}</Text>
    <View style={s.price}><Text style={s.coin}>◉</Text><Text style={s.priceText}>{Number(gift?.coin_price || 0).toLocaleString()}</Text></View>
    {premium && <View style={s.premium}><Text style={s.premiumText}>LUXURY</Text></View>}
  </Pressable>;
}

const s = StyleSheet.create({
  card:{width:148,height:198,borderRadius:24,borderWidth:1,borderColor:"rgba(255,255,255,.10)",backgroundColor:"#151024",padding:12,overflow:"hidden",shadowColor:theme.pink,shadowOpacity:.16,shadowRadius:22,shadowOffset:{width:0,height:12}},sheen:{position:"absolute",width:110,height:260,right:-45,top:-40,backgroundColor:"rgba(255,255,255,.035)",transform:[{rotate:"25deg"}]},rarity:{color:theme.gold,fontSize:7,fontWeight:"900",letterSpacing:1.8},art:{width:116,height:116,resizeMode:"contain",alignSelf:"center",marginTop:3},name:{color:"#fff",fontSize:12,fontWeight:"900",marginTop:2},price:{flexDirection:"row",alignItems:"center",gap:5,marginTop:5},coin:{color:theme.gold,fontSize:10},priceText:{color:theme.gold,fontSize:10,fontWeight:"900"},premium:{position:"absolute",right:9,top:9,paddingHorizontal:6,paddingVertical:3,borderRadius:7,backgroundColor:"rgba(255,79,163,.16)",borderWidth:1,borderColor:"rgba(255,79,163,.25)"},premiumText:{color:theme.pinkSoft,fontSize:6,fontWeight:"900",letterSpacing:1}
});
