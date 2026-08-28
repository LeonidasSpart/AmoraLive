import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import { theme } from "../src/theme";
import { api, API_URL, getValidAccessToken } from "../src/api/client";
import AppShell from "../src/AppShell";
import { useTranslation } from "../src/i18n";

type EventScore = {
  user_id:string; event_id:string; team_side:string; total_gifts_sent:number; total_gifts_received:number;
  user:{username:string;display_name:string;profile_photo?:string|null};
};

function formatTimeLeft(seconds:number, t:(k:string)=>string) {
  if (seconds <= 0) return t("eventsScreen.ended");
  const d=Math.floor(seconds/86400), h=Math.floor((seconds%86400)/3600), m=Math.floor((seconds%3600)/60);
  if(d>0)return `${d}${t("eventsScreen.dayUnit")} ${h}${t("eventsScreen.hourUnit")} ${t("eventsScreen.left")}`;
  if(h>0)return `${h}${t("eventsScreen.hourUnit")} ${m}${t("eventsScreen.minuteUnit")} ${t("eventsScreen.left")}`;
  return `${m}${t("eventsScreen.minuteUnit")} ${t("eventsScreen.left")}`;
}

export default function Events() {
  const { t } = useTranslation();
  const [event,setEvent]=useState<any>(null),[myTeam,setMyTeam]=useState<string|null>(null),[scores,setScores]=useState<EventScore[]>([]);
  const [teamTotals,setTeamTotals]=useState<Record<string,number>>({}),[loading,setLoading]=useState(true),[joining,setJoining]=useState(false),[error,setError]=useState(""),[timeLeft,setTimeLeft]=useState(0);
  const socketRef=useRef<any>(null);

  const load=useCallback(async()=>{
    try{
      const data=await api.activeEvent();
      setEvent(data);setMyTeam(data.myTeam);setTimeLeft(data.timeLeft);
      const board=await api.eventLeaderboard(data.id);
      setScores(board.scores||[]);setTeamTotals(board.teamTotals||{});setError("");
    }catch(e:any){
      if(e.status===404)setEvent(null); else setError(e.message||t("eventsScreen.errorLoad"));
    }finally{setLoading(false);}
  },[]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{const timer=setInterval(()=>setTimeLeft(t=>Math.max(0,t-1)),1000);return()=>clearInterval(timer);},[]);

  useEffect(()=>{
    if(!event?.id)return;
    let active=true;
    (async()=>{
      const token=await getValidAccessToken();if(!token)return;
      const {io}=await import("socket.io-client");if(!active)return;
      const socket=io(API_URL,{transports:["websocket"],reconnection:true});
      socketRef.current=socket;
      socket.on("connect",()=>socket.emit("authenticate",token,(ack:any)=>{if(ack?.ok)socket.emit("join-event",event.id);}));
      socket.on("leaderboard-update",(payload:any)=>{if(!active)return;setScores(payload.scores||[]);setTeamTotals(payload.teamTotals||{});});
    })();
    return()=>{active=false;socketRef.current?.disconnect();socketRef.current=null;};
  },[event?.id]);

  const joinTeam=async(team:string)=>{
    if(!event)return;setJoining(true);setError("");
    try{await api.joinEventTeam(event.id,team);setMyTeam(team);}
    catch(e:any){setError(e.message||t("eventsScreen.errorJoinTeam"));}
    finally{setJoining(false);}
  };

  const teamA=event?.teams?.[0],teamB=event?.teams?.[1],totalA=teamTotals[teamA]||0,totalB=teamTotals[teamB]||0,totalAll=totalA+totalB||1;

  if(loading)return <AppShell><View style={[s.page,s.center]}><ActivityIndicator color={theme.pink}/><Text style={s.muted}>{t("eventsScreen.openingEvent")}</Text></View></AppShell>;

  return <AppShell>
    <View style={s.page}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable>
        <View><Text style={s.kicker}>{t("eventsScreen.kicker")}</Text><Text style={s.headerTitle}>{t("eventsScreen.headerTitle")}</Text></View>
      </View>

      {!event ? <View style={[s.center,{flex:1}]}><Text style={s.trophy}>🏆</Text><Text style={s.emptyTitle}>{t("eventsScreen.noLiveEvent")}</Text><Text style={s.muted}>{t("eventsScreen.checkBackSoon")}</Text></View> : (
        <FlatList
          data={scores.slice(0,30)}
          keyExtractor={(item)=>`${item.user_id}-${item.event_id}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom:25}}
          ListHeaderComponent={
            <View>
              <View style={s.hero}>
                {event.banner_url?<Image source={{uri:event.banner_url}} style={s.banner}/>:<View style={s.bannerFallback}><Text style={s.trophy}>🏆</Text></View>}
                <View style={s.heroShade}/>
                <View style={s.heroCopy}>
                  <Text style={s.eventKicker}>{t("eventsScreen.liveEventKicker")}</Text>
                  <Text style={s.title}>{event.title}</Text>
                  {!!event.description&&<Text style={s.description}>{event.description}</Text>}
                  <View style={s.timer}><Text style={s.timerText}>⏱ {formatTimeLeft(timeLeft,t)}</Text></View>
                </View>
              </View>

              {!!error&&<Text style={s.error}>{error}</Text>}

              {!myTeam ? <View style={s.joinCard}>
                <Text style={s.joinTitle}>{t("eventsScreen.pickYourSide")}</Text>
                <Text style={s.mutedLeft}>{t("eventsScreen.sendGiftsHelp")}</Text>
                <View style={s.teamRow}>{(event.teams||[]).map((team:string)=><Pressable key={team} style={s.teamBtn} disabled={joining} onPress={()=>joinTeam(team)}><Text style={s.teamBtnText}>{team}</Text></Pressable>)}</View>
              </View> : <View style={s.myTeam}><Text style={s.myTeamKicker}>{t("eventsScreen.yourTeamKicker")}</Text><Text style={s.myTeamText}>{myTeam}</Text><Text style={s.mutedLeft}>{t("eventsScreen.giftsCountToward")}</Text></View>}

              <View style={s.scoreCard}>
                <View style={s.scoreTop}><Text style={s.scoreTitle}>{t("eventsScreen.battleScore")}</Text><Text style={s.scoreHint}>{t("eventsScreen.live")}</Text></View>
                <View style={s.scoreBar}><View style={[s.scoreFill,{width:`${(totalA/totalAll)*100}%`}]}/></View>
                <View style={s.scoreLabels}><Text style={s.scoreLabel}>{teamA}: <Text style={s.scoreValue}>{totalA}</Text></Text><Text style={s.scoreLabel}>{teamB}: <Text style={s.scoreValue}>{totalB}</Text></Text></View>
              </View>

              <Text style={s.sectionTitle}>{t("eventsScreen.topContributors")}</Text>
              {scores.length===0&&<Text style={s.mutedLeft}>{t("eventsScreen.noOneScoredYet")}</Text>}
            </View>
          }
          renderItem={({item,index})=><View style={s.listItem}>
            <Text style={s.rank}>#{index+1}</Text>
            <View style={s.contribAvatar}>{item.user?.profile_photo?<Image source={{uri:item.user.profile_photo}} style={s.contribImage}/>:<Text style={s.contribLetter}>{(item.user?.display_name||"A")[0]}</Text>}</View>
            <View style={{flex:1}}><Text style={s.contribName}>{item.user?.display_name||item.user?.username}</Text><Text style={s.teamTag}>{item.team_side}</Text></View>
            <Text style={s.points}>{item.total_gifts_sent+item.total_gifts_received} {t("eventsScreen.ptsSuffix")}</Text>
          </View>}
        />
      )}
    </View>
  </AppShell>;
}

const s=StyleSheet.create({
  page:{flex:1,backgroundColor:theme.bg,paddingHorizontal:18},header:{flexDirection:"row",alignItems:"center",gap:10,paddingTop:10,paddingBottom:12},backBtn:{width:38,height:38,borderRadius:13,backgroundColor:"rgba(255,255,255,.045)",borderWidth:1,borderColor:"rgba(255,255,255,.08)",alignItems:"center",justifyContent:"center"},back:{fontSize:31,color:"#fff",marginTop:-4},kicker:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2},headerTitle:{color:"#fff",fontSize:22,fontWeight:"900",marginTop:2},
  hero:{height:235,borderRadius:26,overflow:"hidden",borderWidth:1,borderColor:"rgba(255,255,255,.10)",backgroundColor:theme.surface,position:"relative",marginBottom:12},banner:{width:"100%",height:"100%",opacity:.65},bannerFallback:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:theme.surface2},heroShade:{position:"absolute",left:0,right:0,top:0,bottom:0,backgroundColor:"rgba(5,3,12,.42)"},heroCopy:{position:"absolute",left:18,right:18,bottom:18},eventKicker:{color:theme.gold,fontSize:8,fontWeight:"900",letterSpacing:2},title:{color:"#fff",fontSize:27,fontWeight:"900",marginTop:4},description:{color:"#d4cadf",fontSize:10,lineHeight:15,marginTop:4},timer:{alignSelf:"flex-start",backgroundColor:"rgba(8,6,15,.72)",borderWidth:1,borderColor:"rgba(255,216,107,.25)",borderRadius:999,paddingHorizontal:11,paddingVertical:6,marginTop:9},timerText:{color:theme.gold,fontSize:9,fontWeight:"900"},
  joinCard:{padding:16,borderRadius:20,backgroundColor:theme.surface,borderWidth:1,borderColor:"rgba(255,255,255,.08)",marginBottom:12},joinTitle:{color:"#fff",fontSize:17,fontWeight:"900"},mutedLeft:{color:theme.muted,fontSize:10,lineHeight:16,marginTop:3},teamRow:{flexDirection:"row",gap:9,marginTop:12},teamBtn:{flex:1,backgroundColor:"rgba(255,79,163,.08)",borderWidth:1,borderColor:"rgba(255,79,163,.5)",borderRadius:13,paddingVertical:13,alignItems:"center"},teamBtnText:{color:"#fff",fontWeight:"900",fontSize:11},
  myTeam:{padding:16,borderRadius:20,backgroundColor:"rgba(255,79,163,.07)",borderWidth:1,borderColor:"rgba(255,79,163,.35)",marginBottom:12},myTeamKicker:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2},myTeamText:{color:"#fff",fontSize:20,fontWeight:"900",marginTop:2},
  scoreCard:{padding:15,borderRadius:20,backgroundColor:theme.surface,borderWidth:1,borderColor:"rgba(255,255,255,.08)"},scoreTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:11},scoreTitle:{color:"#fff",fontSize:14,fontWeight:"900"},scoreHint:{color:theme.pink,fontSize:8,fontWeight:"900",letterSpacing:1.5},scoreBar:{height:12,borderRadius:6,backgroundColor:"#2a1b3d",overflow:"hidden"},scoreFill:{height:"100%",backgroundColor:theme.pink},scoreLabels:{flexDirection:"row",justifyContent:"space-between",marginTop:7},scoreLabel:{color:theme.muted,fontSize:10},scoreValue:{color:"#fff",fontWeight:"900"},
  sectionTitle:{color:"#fff",fontSize:18,fontWeight:"900",marginTop:22,marginBottom:9},listItem:{flexDirection:"row",alignItems:"center",gap:9,backgroundColor:theme.surface,borderWidth:1,borderColor:"rgba(255,255,255,.07)",borderRadius:15,padding:10,marginBottom:6},rank:{width:28,color:theme.gold,fontWeight:"900",fontSize:11},contribAvatar:{width:34,height:34,borderRadius:17,overflow:"hidden",backgroundColor:theme.purple,alignItems:"center",justifyContent:"center"},contribImage:{width:"100%",height:"100%"},contribLetter:{color:"#fff",fontWeight:"900"},contribName:{color:"#fff",fontWeight:"800",fontSize:11},teamTag:{color:theme.dim,fontSize:8,marginTop:2},points:{color:theme.pink,fontWeight:"900",fontSize:10},
  center:{alignItems:"center",justifyContent:"center"},trophy:{fontSize:48},emptyTitle:{color:"#fff",fontSize:20,fontWeight:"900",marginTop:10},muted:{color:theme.muted,textAlign:"center",fontSize:11,marginTop:5},error:{color:"#ff8bad",fontSize:10,textAlign:"center",paddingVertical:6}
});
