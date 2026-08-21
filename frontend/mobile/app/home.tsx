import { router } from "expo-router";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { theme } from "../src/theme";

export default function Home() {
  return <View style={s.page}>
    <View style={s.top}><Text style={s.brand}>AMORA</Text><Text style={s.coins}>🪙 0</Text></View>
    <View style={s.tabs}><Text style={s.active}>Swipe</Text><Text style={s.tab}>Discover</Text></View>
    <View style={s.profile}>
      <View style={s.photo}><Text style={s.photoText}>AMORA</Text></View>
      <View style={s.online}><Text style={s.onlineText}>● Online</Text></View>
      <View style={s.info}><Text style={s.name}>Discover someone new</Text><Text style={s.meta}>18+ · Nearby · Verified profiles</Text></View>
      <View style={s.actions}>
        <Pressable style={s.circle}><Text style={s.x}>×</Text></Pressable>
        <Pressable style={s.video} onPress={()=>router.push("/video")}><Text>▣</Text></Pressable>
        <Pressable style={s.circle}><Text style={s.heart}>♥</Text></Pressable>
      </View>
    </View>
    <View style={s.grid}>
      <Pressable style={s.box} onPress={()=>router.push("/messages")}><Text style={s.icon}>💬</Text><Text style={s.boxTitle}>Messages</Text></Pressable>
      <Pressable style={s.box} onPress={()=>router.push("/live")}><Text style={s.icon}>◉</Text><Text style={s.boxTitle}>Live</Text></Pressable>
      <Pressable style={s.box} onPress={()=>router.push("/wallet")}><Text style={s.icon}>🪙</Text><Text style={s.boxTitle}>Coins & Gifts</Text></Pressable>
      <Pressable style={s.box} onPress={()=>router.push("/profile")}><Text style={s.icon}>◎</Text><Text style={s.boxTitle}>Profile</Text></Pressable>
    </View>
  </View>
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:theme.bg,padding:16},top:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:18},
 brand:{fontSize:24,fontWeight:"900",letterSpacing:5,color:theme.text},coins:{color:theme.gold,fontWeight:"800",backgroundColor:theme.surface,padding:10,borderRadius:18},
 tabs:{flexDirection:"row",gap:26,paddingVertical:18},active:{fontSize:22,fontWeight:"900",color:theme.text},tab:{fontSize:22,color:theme.muted},
 profile:{flex:1,backgroundColor:theme.surface,borderRadius:24,overflow:"hidden",borderWidth:1,borderColor:theme.border,minHeight:440},
 photo:{flex:1,backgroundColor:"#241b3d",alignItems:"center",justifyContent:"center"},photoText:{fontSize:58,fontWeight:"900",color:"#5e4b80"},
 online:{position:"absolute",right:12,top:14,backgroundColor:theme.success,padding:9,borderRadius:18},onlineText:{fontWeight:"900",color:"#06110a"},
 info:{padding:18},name:{fontSize:24,fontWeight:"900",color:theme.text},meta:{color:theme.muted,marginTop:6},
 actions:{flexDirection:"row",justifyContent:"space-around",paddingBottom:18},circle:{width:62,height:62,borderRadius:31,backgroundColor:"#fff",alignItems:"center",justifyContent:"center"},x:{fontSize:42,color:"#aaa"},heart:{fontSize:28,color:"#ff3d70"},video:{width:72,height:72,borderRadius:36,backgroundColor:theme.pink,alignItems:"center",justifyContent:"center"},videoText:{color:"#fff",fontSize:28},
 grid:{flexDirection:"row",flexWrap:"wrap",gap:10,paddingVertical:14},box:{width:"48%",backgroundColor:theme.surface,borderRadius:16,padding:14,borderWidth:1,borderColor:theme.border},icon:{fontSize:24},boxTitle:{color:theme.text,fontWeight:"800",marginTop:6}
});
