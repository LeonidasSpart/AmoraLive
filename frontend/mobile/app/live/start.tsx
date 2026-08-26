import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import AppShell from "../../src/AppShell";
import { theme } from "../../src/theme";
import { api } from "../../src/phase2Api";

const CATEGORIES=["Chat","Music","Entertainment","Gaming","Lifestyle","Travel","Q&A","Dating"];

export default function StartLive(){
 const [title,setTitle]=useState(""),[category,setCategory]=useState("Chat"),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const create=async()=>{if(!title.trim()){setError("Add a title for your live.");return;}setBusy(true);setError("");try{const r=await api.createLiveRoom({title:title.trim(),category});router.replace({pathname:"/live/[id]",params:{id:String(r.id)}});}catch(e:any){setError(e.message||"Unable to start live.");}finally{setBusy(false);}};
 return <AppShell><ScrollView style={s.page} contentContainerStyle={{paddingBottom:40}}><Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.kicker}>AMORA LIVE</Text><Text style={s.title}>Go Live</Text><Text style={s.subtitle}>Start a room and meet your audience.</Text><View style={s.card}><Text style={s.label}>Live title</Text><TextInput value={title} onChangeText={setTitle} placeholder="What are you talking about?" placeholderTextColor={theme.dim} style={s.input} maxLength={100}/><Text style={s.label}>Category</Text><View style={s.grid}>{CATEGORIES.map(c=><Pressable key={c} onPress={()=>setCategory(c)} style={[s.chip,category===c&&s.active]}><Text style={s.chipText}>{c}</Text></Pressable>)}</View><Pressable disabled={busy} onPress={create} style={s.start}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.startText}>🔴 Start Live</Text>}</Pressable></View>{!!error&&<Text style={s.error}>{error}</Text>}</ScrollView></AppShell>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},back:{color:"#fff",fontSize:40},kicker:{color:"#ff6b6b",fontSize:8,fontWeight:"900",letterSpacing:2.2},title:{color:"#fff",fontSize:31,fontWeight:"900",marginTop:5},subtitle:{color:theme.muted,fontSize:11,marginTop:4},card:{backgroundColor:theme.surface,borderRadius:20,padding:16,marginTop:18,borderWidth:1,borderColor:"rgba(255,255,255,.07)"},label:{color:theme.dim,fontSize:9,marginBottom:6,marginTop:5},input:{backgroundColor:"#11101b",color:"#fff",borderRadius:11,padding:13,borderWidth:1,borderColor:"rgba(255,255,255,.08)"},grid:{flexDirection:"row",flexWrap:"wrap",gap:7},chip:{paddingVertical:8,paddingHorizontal:10,borderRadius:15,backgroundColor:"#11101b"},active:{backgroundColor:theme.pink},chipText:{color:"#fff",fontSize:9,fontWeight:"800"},start:{marginTop:18,backgroundColor:"#e63d62",borderRadius:13,paddingVertical:14,alignItems:"center"},startText:{color:"#fff",fontWeight:"900"},error:{color:"#ff8bad",textAlign:"center",marginTop:12}
});
