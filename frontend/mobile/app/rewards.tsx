import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import AppShell from "../src/AppShell";
import { theme } from "../src/theme";
import { api } from "../src/phase2Api";

export default function Rewards(){
 const [status,setStatus]=useState<any>(null),[history,setHistory]=useState<any[]>([]),[loading,setLoading]=useState(true),[claiming,setClaiming]=useState(false),[error,setError]=useState("");
 const load=useCallback(async()=>{try{const [s,h]=await Promise.all([api.dailyRewardStatus(),api.dailyRewardHistory()]);setStatus(s);setHistory(h||[]);}catch(e:any){setError(e.message||"Unable to load rewards.");}finally{setLoading(false);}},[]);
 useEffect(()=>{load();},[load]);
 const claim=async()=>{setClaiming(true);setError("");try{await api.claimDailyReward();await load();}catch(e:any){setError(e.message||"Reward is not available yet.");}finally{setClaiming(false);}};
 if(loading)return <AppShell><View style={s.center}><ActivityIndicator color={theme.gold}/></View></AppShell>;
 const claimed=status?status.canClaimToday===false:false;
 return <AppShell><ScrollView style={s.page} contentContainerStyle={{paddingBottom:40}}><Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.kicker}>AMORA REWARDS</Text><Text style={s.title}>Come back. Get rewarded.</Text><View style={s.hero}><Text style={s.emoji}>🎁</Text><Text style={s.streak}>{status?.currentStreak||0} day streak</Text><Text style={s.muted}>{status?.nextReward?.coins||0} coins available today</Text><Pressable disabled={claiming||claimed} onPress={claim} style={[s.claim,(claimed||claiming)&&s.disabled]}><Text style={s.claimText}>{claimed?"✓ Claimed today":claiming?"Claiming…":"Claim daily reward"}</Text></Pressable></View>{!!error&&<Text style={s.error}>{error}</Text>}<Text style={s.section}>Reward history</Text>{history.map((x,i)=><View key={x.id||i} style={s.row}><View style={{flex:1}}><Text style={s.day}>{x.claimed_at?new Date(x.claimed_at).toLocaleDateString():"Reward"}</Text><Text style={s.muted}>Day {x.day_number||1} of cycle{x.is_milestone?" · milestone":""}</Text></View><Text style={s.coins}>+{x.coins||0} 🪙</Text></View>)}</ScrollView></AppShell>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},back:{color:"#fff",fontSize:40},kicker:{color:theme.gold,fontSize:8,fontWeight:"900",letterSpacing:2},title:{color:"#fff",fontSize:29,fontWeight:"900",marginTop:5},hero:{backgroundColor:theme.surface,borderRadius:23,padding:22,marginTop:17,alignItems:"center",borderWidth:1,borderColor:"rgba(255,216,107,.2)"},emoji:{fontSize:55},streak:{color:"#fff",fontSize:22,fontWeight:"900",marginTop:7},muted:{color:theme.muted,fontSize:9,marginTop:4},claim:{marginTop:17,backgroundColor:theme.gold,borderRadius:13,paddingVertical:13,paddingHorizontal:25},disabled:{opacity:.45},claimText:{color:"#1b1409",fontWeight:"900",fontSize:10},error:{color:"#ff8bad",textAlign:"center",marginTop:10},section:{color:"#fff",fontSize:17,fontWeight:"900",marginTop:22,marginBottom:10},row:{flexDirection:"row",alignItems:"center",backgroundColor:theme.surface,borderRadius:13,padding:13,marginBottom:6},day:{color:"#fff",fontSize:10,fontWeight:"800"},coins:{color:theme.gold,fontWeight:"900",fontSize:11},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:theme.bg}
});
