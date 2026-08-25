import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import AppShell from "../src/AppShell";
import { theme } from "../src/theme";
import { phase1Request } from "../src/phase1Api";

const describe=(n:any)=>{
 const p=n.payload||{};
 const map:any={
  new_match:["❤️","You have a new match!","/matches"],
  super_liked:["⭐",`${p.fromName||"Someone"} super liked you!`,"/matches"],
  new_message:["💬",`${p.senderName||"Someone"} sent you a message${p.preview?`: "${p.preview}"`:""}`,p.senderId?`/chat/${p.senderId}`:"/messages"],
  gift_received:["🎁",`You received ${p.quantity||1}x ${p.giftName||"a gift"}!`,"/wallet"],
  level_up:["⭐",`Level up! You're now Level ${p.newLevel||""}`,"/levels"],
  daily_reward_claimed:["🎁",`Daily reward claimed: +${p.coins||0} coins`,"/rewards"],
  membership_bonus:["💎",`Your ${String(p.tier||"").toUpperCase()} monthly bonus arrived: +${p.coins||0} coins!`,"/wallet"],
  mission_claimed:["🎯",`Mission complete: ${p.title||"a mission"} — +${p.coins||0} coins`,"/missions"]
 };
 return map[n.type]||["🔔",String(n.type||"Notification").replace(/_/g," "),null];
};
const ago=(d:string)=>{const m=Math.floor((Date.now()-new Date(d).getTime())/60000);return m<1?"just now":m<60?`${m}m ago`:m<1440?`${Math.floor(m/60)}h ago`:`${Math.floor(m/1440)}d ago`};

export default function Notifications(){
 const [items,setItems]=useState<any[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=useCallback(async()=>{try{const d=await phase1Request("/notifications?limit=50");setItems(d.notifications||[]);}catch(e:any){setError(e.message||"Unable to load notifications.");}finally{setLoading(false);}},[]);
 useEffect(()=>{load();},[load]);
 const read=async(id:string)=>{setItems(x=>x.map(n=>n.id===id?{...n,is_read:true}:n));try{await phase1Request(`/notifications/${id}/read`,{method:"PATCH"});}catch{}};
 const all=async()=>{try{await phase1Request("/notifications/mark-all-read",{method:"POST"});setItems(x=>x.map(n=>({...n,is_read:true})));}catch{}};
 const remove=async(id:string)=>{setItems(x=>x.filter(n=>n.id!==id));try{await phase1Request(`/notifications/${id}`,{method:"DELETE"});}catch{}};
 return <AppShell><ScrollView style={s.page} contentContainerStyle={{paddingBottom:40}}>
  <View style={s.header}><Text style={s.title}>Notifications</Text>{items.some(n=>!n.is_read)&&<Pressable onPress={all} style={s.mark}><Text style={s.markText}>Mark all read</Text></Pressable>}</View>
  {!!error&&<Text style={s.error}>{error}</Text>}
  {loading?<ActivityIndicator color={theme.pink} style={{marginTop:40}}/>:items.length?<View style={s.list}>{items.map(n=>{const [icon,text,href]=describe(n);return <View key={n.id} style={[s.item,!n.is_read&&s.unread]}><Pressable style={s.itemMain} onPress={()=>{if(!n.is_read)read(n.id);if(href)router.push(href as any)}}><Text style={s.icon}>{icon}</Text><View style={{flex:1}}><Text style={s.text}>{text}</Text><Text style={s.time}>{ago(n.created_at)}</Text></View></Pressable><Pressable onPress={()=>remove(n.id)}><Text style={s.x}>✕</Text></Pressable></View>})}</View>:<Text style={s.empty}>🔔{"\n"}You're all caught up.</Text>}
 </ScrollView></AppShell>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:15},title:{color:"#fff",fontSize:28,fontWeight:"900"},mark:{borderRadius:16,borderWidth:1,borderColor:theme.pink,paddingVertical:7,paddingHorizontal:10},markText:{color:"#fff",fontSize:9,fontWeight:"900"},error:{color:"#ff8bad",textAlign:"center"},list:{gap:8},item:{flexDirection:"row",alignItems:"center",backgroundColor:theme.surface,borderRadius:15,padding:13,borderWidth:1,borderColor:"rgba(255,255,255,.07)"},unread:{borderColor:"rgba(255,79,163,.45)",backgroundColor:"#1d1426"},itemMain:{flexDirection:"row",alignItems:"center",gap:11,flex:1},icon:{fontSize:22},text:{color:"#eee",fontSize:12,lineHeight:17},time:{color:theme.dim,fontSize:9,marginTop:3},x:{color:theme.dim,padding:8},empty:{color:theme.muted,textAlign:"center",paddingVertical:60,lineHeight:24}
});
