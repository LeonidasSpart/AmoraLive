import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import AppShell from "../src/AppShell";
import { theme } from "../src/theme";
import { phase1Request } from "../src/phase1Api";

export default function Matches() {
  const [tab,setTab]=useState<"discover"|"matches">("discover");
  const [candidate,setCandidate]=useState<any>(null);
  const [matches,setMatches]=useState<any[]>([]);
  const [prefs,setPrefs]=useState<any>({gender:"",showMe:[],minAge:18,maxAge:60});
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  const load=useCallback(async()=>{
    setLoading(true); setError("");
    try{
      const [c,m,p]=await Promise.all([
        phase1Request("/matches/next").catch(e=>e.message==="API 404"?null:null),
        phase1Request("/matches"),
        phase1Request("/matches/preferences")
      ]);
      setCandidate(c); setMatches(Array.isArray(m)?m:[]); setPrefs({gender:p.gender||"",showMe:p.showMe||[],minAge:p.minAge||18,maxAge:p.maxAge||60});
    }catch(e:any){setError(e.message||"Unable to load matches.");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);

  const swipe=async(decision:string)=>{
    if(!candidate||busy)return; setBusy(true);
    try{
      const data=await phase1Request("/matches/swipe",{method:"POST",body:JSON.stringify({targetUserId:candidate.id,decision})});
      if(data.matched) alert("💕 It's a match!");
      await load();
    }catch(e:any){setError(e.message||"Unable to record your choice.");}
    finally{setBusy(false);}
  };
  const unmatch=async(id:string)=>{try{await phase1Request(`/matches/${id}/unmatch`,{method:"POST"});setMatches(x=>x.filter(m=>m.matchId!==id));}catch{}};

  return <AppShell><ScrollView style={s.page} contentContainerStyle={{paddingBottom:40}}>
    <View style={s.head}><View><Text style={s.kicker}>AMORA DATING</Text><Text style={s.title}>Matches</Text></View><Pressable style={s.pref} onPress={()=>alert(`Preferences: ${prefs.minAge}-${prefs.maxAge}`)}><Text style={s.prefText}>⚙️</Text></Pressable></View>
    <View style={s.tabs}><Pressable onPress={()=>setTab("discover")} style={[s.tab,tab==="discover"&&s.active]}><Text style={s.tabText}>Discover</Text></Pressable><Pressable onPress={()=>setTab("matches")} style={[s.tab,tab==="matches"&&s.active]}><Text style={s.tabText}>My Matches ({matches.length})</Text></Pressable></View>
    {!!error&&<Text style={s.error}>{error}</Text>}
    {loading?<ActivityIndicator color={theme.pink} style={{marginTop:50}}/>:tab==="discover"?
      candidate?<View style={s.profile}>
        {candidate.profile_photo?<Image source={{uri:candidate.profile_photo}} style={s.photo}/>:<View style={[s.photo,s.placeholder]}><Text style={{fontSize:50}}>💗</Text></View>}
        <Text style={s.name}>{candidate.display_name||candidate.username}{candidate.age?`, ${candidate.age}`:""}</Text>
        {candidate.compatibility?.score!=null&&<Text style={s.compat}>{candidate.compatibility.score}% compatibility</Text>}
        {!!candidate.bio&&<Text style={s.bio}>{candidate.bio}</Text>}
        <View style={s.actions}><Pressable disabled={busy} onPress={()=>swipe("pass")} style={[s.action,s.pass]}><Text style={s.actionText}>✕</Text></Pressable><Pressable disabled={busy} onPress={()=>swipe("superlike")} style={[s.action,s.super]}><Text style={s.actionText}>⭐</Text></Pressable><Pressable disabled={busy} onPress={()=>swipe("like")} style={[s.action,s.like]}><Text style={s.actionText}>❤️</Text></Pressable></View>
      </View>:<Text style={s.empty}>No more profiles right now. Check back later.</Text>
      :matches.length?<View style={s.matchGrid}>{matches.map(m=><View key={m.matchId} style={s.matchCard}>
        {m.peer?.profile_photo?<Image source={{uri:m.peer.profile_photo}} style={s.matchAvatar}/>:<View style={[s.matchAvatar,s.placeholder]}><Text>💗</Text></View>}
        <Text style={s.matchName}>{m.peer?.display_name||m.peer?.username}</Text><Text style={s.meta}>{m.compatibility?.score||0}% compatible</Text>
        <View style={s.row}><Pressable style={s.small} onPress={()=>router.push({pathname:"/chat/[userId]",params:{userId:m.peer.id}})}><Text style={s.btnText}>💬</Text></Pressable><Pressable style={s.small} onPress={()=>router.push({pathname:"/video",params:{userId:m.peer.id}})}><Text style={s.btnText}>📹</Text></Pressable><Pressable style={s.small} onPress={()=>unmatch(m.matchId)}><Text style={s.btnText}>✕</Text></Pressable></View>
      </View>)}</View>:<Text style={s.empty}>No matches yet — keep discovering!</Text>}
  </ScrollView></AppShell>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},head:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},kicker:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2},title:{color:"#fff",fontSize:30,fontWeight:"900"},pref:{width:40,height:40,borderRadius:20,backgroundColor:theme.surface,alignItems:"center",justifyContent:"center"},prefText:{fontSize:17},tabs:{flexDirection:"row",gap:8,marginVertical:15},tab:{paddingVertical:9,paddingHorizontal:14,borderRadius:18,borderWidth:1,borderColor:"rgba(255,255,255,.08)"},active:{backgroundColor:theme.pink,borderColor:theme.pink},tabText:{color:"#fff",fontSize:10,fontWeight:"900"},error:{color:"#ff8bad",textAlign:"center"},profile:{backgroundColor:theme.surface,borderRadius:25,overflow:"hidden",borderWidth:1,borderColor:"rgba(255,255,255,.08)"},photo:{width:"100%",height:420},placeholder:{backgroundColor:"#171325",alignItems:"center",justifyContent:"center"},name:{color:"#fff",fontSize:23,fontWeight:"900",paddingHorizontal:16,paddingTop:14},compat:{color:theme.gold,fontWeight:"900",paddingHorizontal:16,paddingTop:5},bio:{color:theme.muted,padding:16,lineHeight:19},actions:{flexDirection:"row",justifyContent:"center",gap:18,padding:18},action:{width:58,height:58,borderRadius:29,alignItems:"center",justifyContent:"center"},pass:{backgroundColor:"#3a2630"},super:{backgroundColor:"#2c2850"},like:{backgroundColor:theme.pink},actionText:{fontSize:22},empty:{color:theme.muted,textAlign:"center",paddingVertical:50},matchGrid:{flexDirection:"row",flexWrap:"wrap",gap:10},matchCard:{width:"48%",backgroundColor:theme.surface,borderRadius:18,padding:12,alignItems:"center"},matchAvatar:{width:80,height:80,borderRadius:40,backgroundColor:"#171325",alignItems:"center",justifyContent:"center"},matchName:{color:"#fff",fontWeight:"900",marginTop:8},meta:{color:theme.dim,fontSize:9,marginTop:3},row:{flexDirection:"row",gap:5,width:"100%",marginTop:10},small:{flex:1,paddingVertical:8,borderRadius:8,backgroundColor:theme.pink,alignItems:"center"},btnText:{color:"#fff",fontWeight:"900"}
});
