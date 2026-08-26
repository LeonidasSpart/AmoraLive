import {useCallback,useEffect,useState} from "react";
import {ActivityIndicator,Pressable,ScrollView,StyleSheet,Text,View} from "react-native";
import {router} from "expo-router";
import AppShell from "../src/AppShell";
import {theme} from "../src/theme";
import {phase3Api} from "../src/phase3Api";

export default function Battles(){
 const [items,setItems]=useState<any[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=useCallback(async()=>{try{const r=await phase3Api.battles();setItems(r?.battles||r||[])}catch(e:any){setError(e.message||"Unable to load battles.")}finally{setLoading(false)}},[]);
 useEffect(()=>{load()},[load]);
 return <AppShell><ScrollView style={s.page} contentContainerStyle={{paddingBottom:30}}><Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.kicker}>AMORA LIVE</Text><Text style={s.title}>Live Battles</Text><Text style={s.sub}>Watch creators compete in real time.</Text>{loading?<ActivityIndicator color={theme.pink}/>:error?<Text style={s.error}>{error}</Text>:items.map((b,i)=><Pressable key={b.id||i} style={s.card} onPress={()=>router.push({pathname:"/battles/[id]",params:{id:String(b.id)}})}><View style={s.teams}><View><Text style={s.team}>{b.team_a?.name||b.creator_a?.display_name||"Team A"}</Text><Text style={s.score}>{b.team_a?.score||b.score_a||0}</Text></View><Text style={s.vs}>VS</Text><View style={{alignItems:"flex-end"}}><Text style={s.team}>{b.team_b?.name||b.creator_b?.display_name||"Team B"}</Text><Text style={s.score}>{b.team_b?.score||b.score_b||0}</Text></View></View><View style={s.bar}><View style={[s.fill,{width:`${Math.min(100,Number(b.progress_a||50))}%`} as any}/></View><Text style={s.meta}>{b.status||"live"} · {b.remaining_seconds||b.countdown_seconds||0}s</Text></Pressable>)}{!items.length&&!loading&&<Text style={s.empty}>No live battles right now.</Text>}</ScrollView></AppShell>
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},back:{color:"#fff",fontSize:40},kicker:{color:"#ff6b6b",fontSize:8,fontWeight:"900",letterSpacing:2},title:{color:"#fff",fontSize:30,fontWeight:"900",marginTop:4},sub:{color:theme.muted,fontSize:10,marginTop:4,marginBottom:14},card:{backgroundColor:theme.surface,borderRadius:19,padding:16,marginBottom:9},teams:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},team:{color:"#fff",fontSize:10,fontWeight:"900"},score:{color:theme.gold,fontSize:25,fontWeight:"900",marginTop:4},vs:{color:theme.pink,fontSize:11,fontWeight:"900"},bar:{height:7,backgroundColor:"#11101b",borderRadius:4,overflow:"hidden",marginTop:14},fill:{height:"100%",backgroundColor:theme.pink},meta:{color:theme.muted,fontSize:8,marginTop:7},error:{color:"#ff8bad",textAlign:"center",marginTop:30},empty:{color:theme.muted,textAlign:"center",marginTop:40}
});
