import { router } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { theme } from "../src/theme";

export default function AgeGate() {
  return <View style={s.page}>
    <View style={s.logo}><Text style={s.logoHeart}>♡</Text></View>
    <Text style={s.brand}>AMORA</Text>
    <Text style={s.tag}>MEANINGFUL CONNECTIONS</Text>
    <View style={s.card}>
      <Text style={s.title}>18+ only</Text>
      <Text style={s.copy}>Amora is an adults-only dating and social platform. You must be at least 18 years old to create or use an account.</Text>
      <Pressable style={s.primary} onPress={() => router.replace("/auth")}><Text style={s.primaryText}>I am 18 or older</Text></Pressable>
      <Pressable style={s.secondary} onPress={() => {}}><Text style={s.secondaryText}>I am under 18</Text></Pressable>
      <Text style={s.legal}>By continuing, you agree to Amora's Terms, Privacy Policy and Community Guidelines.</Text>
    </View>
  </View>;
}
const s=StyleSheet.create({
  page:{flex:1,backgroundColor:theme.bg,alignItems:"center",justifyContent:"center",padding:24},
  logo:{width:118,height:118,borderRadius:59,backgroundColor:"#21142f",alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:theme.pink},
  logoHeart:{fontSize:82,color:theme.pink,lineHeight:90},
  brand:{fontSize:38,fontWeight:"800",letterSpacing:8,color:theme.text,marginTop:18},
  tag:{color:theme.pink,letterSpacing:3,fontSize:11,marginTop:4},
  card:{width:"100%",backgroundColor:theme.surface,borderRadius:24,padding:22,marginTop:42,borderWidth:1,borderColor:theme.border},
  title:{fontSize:26,fontWeight:"800",color:theme.text},
  copy:{color:theme.muted,lineHeight:22,marginTop:10},
  primary:{backgroundColor:theme.pink,padding:16,borderRadius:16,alignItems:"center",marginTop:22},
  primaryText:{color:"#fff",fontWeight:"800",fontSize:16},
  secondary:{padding:14,alignItems:"center"},
  secondaryText:{color:theme.muted},
  legal:{fontSize:11,color:"#80778f",textAlign:"center",lineHeight:16,marginTop:8}
});
