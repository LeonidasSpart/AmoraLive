import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { router, useFocusEffect } from "expo-router";
import { api } from "../src/api/client";
import AppShell from "../src/AppShell";
import { theme } from "../src/theme";

export default function Membership() {
  const [plans,setPlans]=useState<any[]>([]),[current,setCurrent]=useState<any>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(""),[error,setError]=useState("");
  const load=useCallback(async()=>{try{const [p,m]=await Promise.all([api.membershipPlans(),api.membership()]);setPlans(p||[]);setCurrent(m);setError("");}catch(e:any){setError(e.message||"Unable to load membership.");}finally{setLoading(false);}},[]);
  useFocusEffect(useCallback(()=>{load();},[load]));
  const choose=async(tier:string)=>{if(tier==="free")return;setBusy(tier);setError("");try{const d=await api.membershipCheckout(tier);if(d.checkoutUrl)await WebBrowser.openBrowserAsync(d.checkoutUrl);await load();}catch(e:any){setError(e.message||"Unable to start membership checkout.");}finally{setBusy("");}};
  if(loading)return <AppShell><View style={s.center}><ActivityIndicator color={theme.pink}/></View></AppShell>;
  return <AppShell><ScrollView style={s.page} contentContainerStyle={{paddingBottom:30}}>
    <Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable>
    <Text style={s.kicker}>AMORA ROYAL MEMBERSHIP</Text><Text style={s.title}>Choose your level.</Text>
    <View style={s.current}><Text style={s.currentKicker}>CURRENT</Text><Text style={s.currentTier}>{String(current?.label||current?.tier||"Free").toUpperCase()}</Text><Text style={s.muted}>Unlock more gifts, moments and exclusive experiences.</Text></View>
    {!!error&&<Text style={s.error}>{error}</Text>}
    {plans.map((plan)=><View key={plan.tier} style={[s.card,current?.tier===plan.tier&&s.active]}>
      <View style={s.row}><View><Text style={s.plan}>{plan.label}</Text><Text style={s.price}>{plan.price===0?"Free":`$${plan.price}/month`}</Text></View>{current?.tier===plan.tier&&<Text style={s.badge}>ACTIVE</Text>}</View>
      {plan.benefits?.map((b:string)=><Text key={b} style={s.benefit}>✦ {b}</Text>)}
      {plan.tier!=="free"&&current?.tier!==plan.tier&&<Pressable style={s.button} onPress={()=>choose(plan.tier)} disabled={!!busy}><Text style={s.buttonText}>{busy===plan.tier?"Opening…":"Choose "+plan.label}</Text></Pressable>}
    </View>)}
  </ScrollView></AppShell>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},back:{color:"#fff",fontSize:40},kicker:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2.3,marginTop:4},title:{color:"#fff",fontSize:29,fontWeight:"900",marginTop:5},current:{marginTop:18,padding:20,borderRadius:24,backgroundColor:"rgba(255,216,107,.06)",borderWidth:1,borderColor:"rgba(255,216,107,.22)"},currentKicker:{color:theme.gold,fontSize:8,fontWeight:"900",letterSpacing:2},currentTier:{color:"#fff",fontSize:25,fontWeight:"900",marginTop:4},muted:{color:theme.muted,fontSize:11,lineHeight:17,marginTop:4},error:{color:"#ff8bad",fontSize:10,textAlign:"center",marginVertical:10},card:{marginTop:12,padding:17,borderRadius:22,backgroundColor:theme.surface,borderWidth:1,borderColor:"rgba(255,255,255,.08)"},active:{borderColor:"rgba(255,79,163,.45)"},row:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},plan:{color:"#fff",fontSize:20,fontWeight:"900"},price:{color:theme.gold,fontWeight:"800",fontSize:12,marginTop:3},badge:{color:theme.pink,fontSize:8,fontWeight:"900",letterSpacing:1},benefit:{color:"#ddd4e5",fontSize:11,marginTop:10},button:{marginTop:15,borderRadius:13,paddingVertical:12,backgroundColor:theme.pink,alignItems:"center"},buttonText:{color:"#fff",fontWeight:"900",fontSize:11},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:theme.bg}});
