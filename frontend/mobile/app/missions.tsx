import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import AppShell from "../src/AppShell";
import { theme } from "../src/theme";
import { phase1Request } from "../src/phase1Api";

export default function Missions(){
 const [items,setItems]=useState<any[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[busy,setBusy]=useState("");
 const load=useCallback(async()=>{try{setItems(await phase1Request("/missions"));}catch(e:any){setError(e.message||"Unable to load missions.");}finally{setLoading(false);}},[]);
 useEffect(()=>{load();},[load]);
 const claim=async(m:any)=>{setBusy(m.key);try{await phase1Request(`/missions/${m.key}/claim`,{method:"POST"});await load();}catch(e:any){setError(e.message||"Unable to claim reward.");}finally{setBusy("");}};
 if(loading)return <AppShell><View style={s.center}><ActivityIndicator color={theme.pink}/></View></AppShell>;
 return <AppShell><ScrollView style={s.page} contentContainerStyle={{paddingBottom:40}}><Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.kicker}>AMORA PROGRESSION</Text><Text style={s.title}>Missions & Achievements</Text>{!!error&&<Text style={s.error}>{error}</Text>}
  {["daily","weekly","lifetime"].map(type=>{const list=items.filter(x=>x.type===type);if(!list.length)return null;return <View key={type}><Text style={s.section}>{type==="daily"?"📅 Daily":type==="weekly"?"🗓️ Weekly":"🏆 Achievements"}</Text>{list.map(m=>{const pct=Math.min(100,Math.round((m.progress/m.target)*100));return <View key={m.key} style={[s.card,m.claimed&&{opacity:.6}]}><View style={s.top}><Text style={s.icon}>{m.icon}</Text><View style={{flex:1}}><Text style={s.name}>{m.title}</Text><Text style={s.muted}>{m.description}</Text></View></View><View style={s.track}><View style={[s.fill,{width:`${pct}%`}]}/></View><View style={s.metaRow}><Text style={s.muted}>{m.progress}/{m.target}</Text><Text style={s.reward}>🪙 {m.reward?.coins||0}</Text></View>{m.claimed?<Text style={s.claimed}>✓ Claimed</Text>:m.completed?<Pressable style={s.claim} disabled={busy===m.key} onPress={()=>claim(m)}><Text style={s.claimText}>{busy===m.key?"Claiming…":"Claim reward"}</Text></Pressable>:<Text style={s.inProgress}>In progress</Text>}</View>})}</View>})}
 </ScrollView></AppShell>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},back:{color:"#fff",fontSize:40},kicker:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2.2},title:{color:"#fff",fontSize:27,fontWeight:"900",marginTop:5},section:{color:"#fff",fontSize:17,fontWeight:"900",marginTop:22,marginBottom:10},error:{color:"#ff8bad",textAlign:"center",marginTop:10},card:{backgroundColor:theme.surface,borderRadius:17,padding:15,marginBottom:9,borderWidth:1,borderColor:"rgba(255,255,255,.07)"},top:{flexDirection:"row",gap:10},icon:{fontSize:24},name:{color:"#fff",fontWeight:"900",fontSize:13},muted:{color:theme.muted,fontSize:9,lineHeight:15,marginTop:3},track:{height:6,backgroundColor:"#222",borderRadius:3,overflow:"hidden",marginTop:12},fill:{height:"100%",backgroundColor:theme.pink},metaRow:{flexDirection:"row",justifyContent:"space-between",marginTop:7},reward:{color:theme.gold,fontSize:10,fontWeight:"900"},claim:{marginTop:10,backgroundColor:theme.pink,borderRadius:9,paddingVertical:9,alignItems:"center"},claimText:{color:"#fff",fontWeight:"900",fontSize:10},claimed:{textAlign:"center",color:theme.success,marginTop:10,fontWeight:"900",fontSize:10},inProgress:{textAlign:"center",color:theme.dim,marginTop:10,fontSize:10},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:theme.bg}
});
