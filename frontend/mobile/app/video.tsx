import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import AppShell from "../src/AppShell";
import { theme } from "../src/theme";
import { api } from "../src/phase2Api";

export default function Video(){
 const {userId}=useLocalSearchParams<{userId:string}>();const [peer,setPeer]=useState<any>(null),[loading,setLoading]=useState(true);
 useEffect(()=>{if(userId)api.user(String(userId)).then(setPeer).finally(()=>setLoading(false));},[userId]);
 if(loading)return <AppShell><View style={s.center}><ActivityIndicator color={theme.pink}/></View></AppShell>;
 return <AppShell><View style={s.page}><Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable><View style={s.stage}><Text style={{fontSize:55}}>📹</Text><Text style={s.title}>Video call</Text><Text style={s.name}>{peer?.display_name||peer?.username||"Amora member"}</Text><Text style={s.muted}>LiveKit call screen ready.</Text><Text style={s.muted}>Connect the existing native LiveKit Room here for the production media session.</Text></View><View style={s.actions}><Pressable style={s.end} onPress={()=>router.back()}><Text style={s.endText}>End call</Text></Pressable></View></View></AppShell>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},back:{color:"#fff",fontSize:40},stage:{flex:1,borderRadius:25,backgroundColor:"#11101b",alignItems:"center",justifyContent:"center"},title:{color:"#fff",fontSize:24,fontWeight:"900",marginTop:10},name:{color:theme.pinkSoft,fontSize:13,fontWeight:"800",marginTop:5},muted:{color:theme.muted,fontSize:9,textAlign:"center",maxWidth:260,lineHeight:15,marginTop:7},actions:{paddingVertical:15},end:{backgroundColor:"#e84b67",borderRadius:14,paddingVertical:14,alignItems:"center"},endText:{color:"#fff",fontWeight:"900"},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:theme.bg}
});
