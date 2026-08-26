import {useEffect,useState} from "react";
import {ActivityIndicator,Pressable,StyleSheet,Text,View} from "react-native";
import {useLocalSearchParams,router} from "expo-router";
import AppShell from "../../src/AppShell";
import {theme} from "../../src/theme";
import {phase3Api} from "../../src/phase3Api";

export default function Battle(){
 const {id}=useLocalSearchParams<{id:string}>();const [b,setB]=useState<any>(null),[joined,setJoined]=useState(false),[loading,setLoading]=useState(true);
 useEffect(()=>{if(id)phase3Api.battle(String(id)).then(setB).finally(()=>setLoading(false))},[id]);
 const join=async()=>{try{await phase3Api.joinBattle(String(id));setJoined(true)}catch{}};
 if(loading)return <AppShell><View style={s.center}><ActivityIndicator color={theme.pink}/></View></AppShell>;
 return <AppShell><View style={s.page}><Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.kicker}>LIVE BATTLE</Text><Text style={s.title}>Battle Arena</Text><View style={s.arena}><View style={s.side}><Text style={s.name}>{b?.team_a?.name||b?.creator_a?.display_name||"Team A"}</Text><Text style={s.score}>{b?.team_a?.score||b?.score_a||0}</Text></View><View><Text style={s.vs}>VS</Text><Text style={s.timer}>{b?.remaining_seconds||b?.countdown_seconds||0}</Text></View><View style={s.side}><Text style={s.name}>{b?.team_b?.name||b?.creator_b?.display_name||"Team B"}</Text><Text style={s.score}>{b?.team_b?.score||b?.score_b||0}</Text></View></View><Text style={s.note}>Realtime battle room. Connect the existing Socket.IO battle events here for live score updates and gift effects.</Text><Pressable onPress={join} style={s.join}><Text style={s.joinText}>{joined?"✓ Joined Battle":"Join Battle"}</Text></Pressable></View></AppShell>
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},back:{color:"#fff",fontSize:40},kicker:{color:"#ff6b6b",fontSize:8,fontWeight:"900",letterSpacing:2},title:{color:"#fff",fontSize:29,fontWeight:"900"},arena:{marginTop:25,backgroundColor:theme.surface,borderRadius:24,padding:24,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},side:{alignItems:"center",width:"34%"},name:{color:"#fff",fontSize:10,fontWeight:"900",textAlign:"center"},score:{color:theme.gold,fontSize:34,fontWeight:"900",marginTop:8},vs:{color:theme.pink,fontSize:14,fontWeight:"900",textAlign:"center"},timer:{color:theme.muted,fontSize:9,textAlign:"center",marginTop:8},note:{color:theme.muted,fontSize:9,lineHeight:15,textAlign:"center",marginTop:18},join:{backgroundColor:theme.pink,borderRadius:13,paddingVertical:14,alignItems:"center",marginTop:20},joinText:{color:"#fff",fontWeight:"900"},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:theme.bg}
});
