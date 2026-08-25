import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import AppShell from "../../src/AppShell";
import { theme } from "../../src/theme";
import { api } from "../../src/phase2Api";

export default function LiveRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [room, setRoom] = useState<any>(null);
  const [token, setToken] = useState<any>(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [giftOpen, setGiftOpen] = useState(false);
  const [gifts, setGifts] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [r, g] = await Promise.all([api.liveRoom(String(id)), api.gifts()]);
      setRoom(r);
      setGifts(g || []);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const join = async () => {
    if (!id || joined) return;
    try {
      await api.joinLiveRoom(String(id));
      const t = await api.liveToken(String(id));
      setToken(t);
      setJoined(true);
    } catch {}
  };

  const leave = async () => {
    if (!id || !joined) return;
    try { await api.leaveLiveRoom(String(id)); } catch {}
    setJoined(false);
  };

  const sendGift = async (gift:any) => {
    try {
      await api.sendGift({ roomId:String(id), giftId:gift.id, quantity:1 });
      setGiftOpen(false);
    } catch {}
  };

  if (loading) return <AppShell><View style={s.center}><ActivityIndicator color={theme.pink}/></View></AppShell>;

  return <AppShell>
    <ScrollView style={s.page} contentContainerStyle={{paddingBottom:30}}>
      <View style={s.top}><Pressable onPress={async()=>{await leave();router.back();}}><Text style={s.back}>‹</Text></Pressable><Text style={s.topTitle}>LIVE</Text><Text style={s.viewer}>👁 {room?.viewer_count||0}</Text></View>
      <View style={s.stage}>
        {room?.thumbnail_url ? <Image source={{uri:room.thumbnail_url}} style={s.thumb}/> : <View style={s.placeholder}><Text style={{fontSize:50}}>🔴</Text><Text style={s.liveText}>LIVE</Text></View>}
        <View style={s.overlay}><Text style={s.roomTitle}>{room?.title||"Live room"}</Text><Text style={s.host}>{room?.host?.display_name||room?.host?.username||"Creator"}</Text></View>
      </View>
      <View style={s.actions}>
        <Pressable style={s.action} onPress={join}><Text style={s.actionIcon}>▶️</Text><Text style={s.actionText}>{joined?"Joined":"Join"}</Text></Pressable>
        <Pressable style={s.action} onPress={()=>setGiftOpen(!giftOpen)}><Text style={s.actionIcon}>🎁</Text><Text style={s.actionText}>Gift</Text></Pressable>
        <Pressable style={s.action} onPress={()=>router.push({pathname:"/chat/[userId]",params:{userId:String(room?.host?.id)}})}><Text style={s.actionIcon}>💬</Text><Text style={s.actionText}>Message</Text></Pressable>
      </View>
      {giftOpen&&<View style={s.giftPanel}>{gifts.slice(0,8).map(g=><Pressable key={g.id} style={s.gift} onPress={()=>sendGift(g)}><Text style={{fontSize:25}}>{g.emoji||"🎁"}</Text><Text style={s.giftName}>{g.name}</Text><Text style={s.coin}>🪙 {g.price_coins||g.coins||0}</Text></Pressable>)}</View>}
      <View style={s.info}><Text style={s.section}>About this live</Text><Text style={s.muted}>#{room?.category||"General"} · {room?.viewer_count||0} watching</Text></View>
      {token&&<View style={s.connected}><Text style={s.connectedText}>✓ Connected to the live room</Text><Text style={s.muted}>LiveKit session ready.</Text></View>}
    </ScrollView>
  </AppShell>;
}

const s=StyleSheet.create({
 page:{flex:1,backgroundColor:theme.bg,padding:12},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:theme.bg},top:{height:44,flexDirection:"row",alignItems:"center"},back:{color:"#fff",fontSize:38},topTitle:{color:"#ff6b6b",fontSize:11,fontWeight:"900",letterSpacing:2,flex:1,marginLeft:8},viewer:{color:"#fff",fontSize:10},stage:{height:430,borderRadius:22,overflow:"hidden",backgroundColor:"#11101b",position:"relative"},thumb:{width:"100%",height:"100%",resizeMode:"cover"},placeholder:{flex:1,alignItems:"center",justifyContent:"center"},liveText:{color:"#ff6b6b",fontSize:12,fontWeight:"900",marginTop:7},overlay:{position:"absolute",left:14,right:14,bottom:14,padding:12,borderRadius:13,backgroundColor:"rgba(0,0,0,.45)"},roomTitle:{color:"#fff",fontSize:17,fontWeight:"900"},host:{color:"#ddd",fontSize:10,marginTop:3},actions:{flexDirection:"row",gap:8,marginTop:10},action:{flex:1,backgroundColor:theme.surface,borderRadius:13,paddingVertical:10,alignItems:"center"},actionIcon:{fontSize:18},actionText:{color:"#fff",fontSize:9,fontWeight:"900",marginTop:3},giftPanel:{flexDirection:"row",flexWrap:"wrap",gap:7,backgroundColor:theme.surface,borderRadius:16,padding:10,marginTop:8},gift:{width:"23%",alignItems:"center",paddingVertical:8},giftName:{color:"#fff",fontSize:8,fontWeight:"800",marginTop:3,textAlign:"center"},coin:{color:theme.gold,fontSize:7,marginTop:2},info:{backgroundColor:theme.surface,borderRadius:17,padding:15,marginTop:10},section:{color:"#fff",fontSize:15,fontWeight:"900"},muted:{color:theme.muted,fontSize:9,lineHeight:15,marginTop:4},connected:{marginTop:8,padding:13,borderRadius:14,backgroundColor:"rgba(95,220,150,.08)"},connectedText:{color:theme.success,fontWeight:"900",fontSize:10}
});
