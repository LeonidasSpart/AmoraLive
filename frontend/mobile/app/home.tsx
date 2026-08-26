import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { api } from "../src/api/client";
import LuxuryGiftCard from "../src/LuxuryGiftCard";
import { theme } from "../src/theme";
import AppShell from "../src/AppShell";

const actions = [
  ["💬", "Messages", "/messages"], ["✦", "Live", "/live"], ["🪙", "Coins & Gifts", "/wallet"],
  ["🏆", "Events", "/events"], ["◎", "Profile", "/profile"], ["🔎", "Discover", "/discover"],
  ["✨", "Store", "/store"], ["🛡️", "Safety", "/safety"]
] as const;

export default function Home() {
  const [gifts, setGifts] = useState<any[]>([]);
  useEffect(() => { api.gifts().then((data) => setGifts(Array.isArray(data) ? data.slice(0, 10) : [])).catch(() => {}); }, []);
  return <AppShell><ScrollView style={s.page} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <View style={s.top}><View><Text style={s.eyebrow}>MEANINGFUL CONNECTIONS</Text><Text style={s.brand}>AMORA</Text></View><Pressable style={s.coinPill} onPress={() => router.push("/wallet")}><Text style={s.coinIcon}>🪙</Text><Text style={s.coinText}>0</Text></Pressable></View>

    <View style={s.hero}>
      <View style={s.heroGlow} /><View style={s.heroRing} /><View style={s.heroHeart}><Text style={s.heart}>♡</Text></View>
      <Text style={s.heroKicker}>AMORA LIVE</Text><Text style={s.heroTitle}>Meet someone.{"\n"}<Text style={s.heroGradient}>Feel something real.</Text></Text>
      <Text style={s.heroSub}>Discover live people, video matches and moments worth remembering.</Text>
      <View style={s.heroActions}><Pressable style={s.primary} onPress={() => router.push("/video")}><Text style={s.primaryText}>Start matching</Text><Text style={s.arrow}>→</Text></Pressable><Pressable style={s.secondary} onPress={() => router.push("/live")}><Text style={s.secondaryText}>Explore Live</Text></Pressable></View>
    </View>

    <View style={s.sectionHead}><Text style={s.sectionTitle}>Your Amora world</Text><Text style={s.sectionHint}>Everything in one place</Text></View>
    <View style={s.grid}>{actions.map(([icon,title,path]) => <Pressable key={title} style={s.box} onPress={() => router.push(path as any)}><View style={s.boxIcon}><Text style={s.icon}>{icon}</Text></View><Text style={s.boxTitle}>{title}</Text><Text style={s.boxSub}>{title === "Live" ? "Watch & join" : title === "Coins & Gifts" ? "Premium moments" : "Open"}</Text></Pressable>)}</View>

    <View style={s.sectionHead}><Text style={s.sectionTitle}>Amora Luxury</Text><Text style={s.sectionHint}>3D collection</Text></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 18 }} style={{ marginHorizontal: -18 }}><>{gifts.map((item) => <LuxuryGiftCard key={item.id} gift={item} onPress={() => router.push("/wallet")} />)}</></ScrollView>

    <View style={s.luxuryBanner}><View><Text style={s.luxuryKicker}>PRIVATE COLLECTION</Text><Text style={s.luxuryTitle}>Gifts that feel alive.</Text><Text style={s.luxuryText}>3D luxury gifts, live animations and premium moments.</Text></View><Text style={s.luxuryGem}>✦</Text></View>
  </ScrollView></AppShell>;
}

const s = StyleSheet.create({
  page:{flex:1,backgroundColor:theme.bg}, content:{padding:18,paddingTop:24,paddingBottom:36},
  top:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:18}, eyebrow:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2.4}, brand:{fontSize:30,fontWeight:"900",letterSpacing:6,color:theme.text,marginTop:2},
  coinPill:{flexDirection:"row",alignItems:"center",gap:7,paddingHorizontal:13,paddingVertical:10,borderRadius:20,borderWidth:1,borderColor:"rgba(255,216,107,.25)",backgroundColor:"rgba(255,216,107,.07)"}, coinIcon:{fontSize:17},coinText:{color:theme.gold,fontWeight:"900",fontSize:15},
  hero:{position:"relative",overflow:"hidden",borderRadius:30,padding:26,backgroundColor:theme.surface,borderWidth:1,borderColor:"rgba(255,255,255,.10)",shadowColor:theme.pink,shadowOpacity:.18,shadowRadius:35,shadowOffset:{width:0,height:18},minHeight:350}, heroGlow:{position:"absolute",width:240,height:240,borderRadius:120,right:-100,top:-90,backgroundColor:"rgba(255,63,157,.20)"}, heroRing:{position:"absolute",width:190,height:190,borderRadius:95,right:-48,top:20,borderWidth:1,borderColor:"rgba(155,53,255,.28)"}, heroHeart:{position:"absolute",right:34,top:55,width:120,height:120,borderRadius:32,backgroundColor:"rgba(255,255,255,.035)",borderWidth:1,borderColor:"rgba(255,255,255,.10)",alignItems:"center",justifyContent:"center",transform:[{rotate:"12deg"}]}, heart:{fontSize:88,color:theme.pink,textShadowColor:"rgba(255,63,157,.8)",textShadowRadius:28,transform:[{rotate:"-12deg"}]},
  heroKicker:{color:theme.gold,fontSize:9,fontWeight:"900",letterSpacing:2}, heroTitle:{color:"#fff",fontSize:33,fontWeight:"900",lineHeight:36,marginTop:8,maxWidth:"82%"},heroGradient:{color:theme.pinkSoft},heroSub:{color:theme.muted,fontSize:13,lineHeight:19,maxWidth:"82%",marginTop:10},
  heroActions:{flexDirection:"row",gap:9,marginTop:20},primary:{flex:1,flexDirection:"row",justifyContent:"center",alignItems:"center",gap:8,backgroundColor:theme.pink,borderRadius:15,paddingVertical:14,shadowColor:theme.pink,shadowOpacity:.35,shadowRadius:18,shadowOffset:{width:0,height:8}},primaryText:{color:"#fff",fontWeight:"900"},arrow:{color:"#fff",fontSize:18,fontWeight:"900"},secondary:{flex:1,alignItems:"center",justifyContent:"center",borderRadius:15,paddingVertical:14,borderWidth:1,borderColor:"rgba(255,255,255,.12)",backgroundColor:"rgba(255,255,255,.04)"},secondaryText:{color:"#fff",fontWeight:"800"},
  sectionHead:{flexDirection:"row",justifyContent:"space-between",alignItems:"baseline",marginTop:24,marginBottom:12},sectionTitle:{color:"#fff",fontSize:20,fontWeight:"900"},sectionHint:{color:theme.dim,fontSize:10},grid:{flexDirection:"row",flexWrap:"wrap",gap:10},box:{width:"48.3%",minHeight:118,padding:14,borderRadius:20,borderWidth:1,borderColor:"rgba(255,255,255,.08)",backgroundColor:theme.surface,shadowColor:"#000",shadowOpacity:.22,shadowRadius:18,shadowOffset:{width:0,height:8}},boxIcon:{width:42,height:42,borderRadius:14,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255,63,157,.09)",borderWidth:1,borderColor:"rgba(255,63,157,.15)"},icon:{fontSize:22},boxTitle:{color:"#fff",fontWeight:"900",fontSize:13,marginTop:10},boxSub:{color:theme.dim,fontSize:9,marginTop:3},
  luxuryBanner:{marginTop:16,padding:18,borderRadius:22,borderWidth:1,borderColor:"rgba(255,216,107,.18)",backgroundColor:"rgba(255,216,107,.045)",flexDirection:"row",alignItems:"center",justifyContent:"space-between"},luxuryKicker:{color:theme.gold,fontSize:8,fontWeight:"900",letterSpacing:2},luxuryTitle:{color:"#fff",fontSize:20,fontWeight:"900",marginTop:5},luxuryText:{color:theme.muted,fontSize:10,marginTop:4,maxWidth:250},luxuryGem:{fontSize:44,color:theme.gold,textShadowColor:"rgba(255,216,107,.65)",textShadowRadius:25}
});
