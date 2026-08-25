import { useCallback, useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator, Image, KeyboardAvoidingView, Linking, Platform, Pressable,
  StyleSheet, Text, TextInput, View, FlatList
} from "react-native";
import { theme } from "../../src/theme";
import { api, API_URL, getUserId, getValidAccessToken } from "../../src/api/client";
import LuxuryGiftTray from "../../src/LuxuryGiftTray";
import GiftIcon from "../../src/GiftIcon";

type Message = {
  id: string; sender_id: string; receiver_id: string; content: string; type?: string;
  media_urls?: string[]; created_at: string; read_at?: string | null;
};
type User = { id:string; username:string; display_name:string; profile_photo:string|null; is_verified?:boolean; membership_tier?:string };

export default function Chat() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const targetId = String(userId || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [typing, setTyping] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [giftBurst, setGiftBurst] = useState<any>(null);
  const listRef = useRef<FlatList>(null);
  const socketRef = useRef<any>(null);
  const typingTimer = useRef<any>(null);
  const seen = useRef(new Set<string>());

  const load = useCallback(async () => {
    if (!targetId) return;
    try {
      const [msgs, user] = await Promise.all([api.messages(targetId, 50), api.user(targetId)]);
      setMessages(Array.isArray(msgs) ? msgs : []);
      setOtherUser(user);
      setError("");
    } catch (e: any) {
      setError(e.message || "Unable to load this conversation.");
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => { getUserId().then(setMyId); load(); }, [load]);

  useEffect(() => {
    let active = true;
    let socket: any;

    (async () => {
      const token = await getValidAccessToken();
      if (!token || !targetId) return;
      const { io } = await import("socket.io-client");
      if (!active) return;
      socket = io(API_URL, { transports: ["websocket"], reconnection: true, reconnectionAttempts: 8 });
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("authenticate", token, (ack: any) => {
          if (ack?.ok) {
            setSocketReady(true);
          } else setError("Realtime authentication failed. Please sign in again.");
        });
      });
      socket.on("disconnect", () => setSocketReady(false));
      socket.on("connect_error", () => setSocketReady(false));

      const acceptMessage = (message: Message) => {
        if (!active || !message?.id) return;
        if (String(message.sender_id) !== targetId && String(message.receiver_id) !== targetId) return;
        setMessages((prev) => prev.some((m) => m.id === message.id) ? prev : [...prev, message]);
      };

      socket.on("private-message", acceptMessage);
      socket.on("private-message-sent", acceptMessage);
      socket.on("typing", (payload: any) => {
        if (String(payload?.from) === targetId) setTyping(Boolean(payload?.isTyping));
      });
      socket.on("read-receipt", ({ from }: any) => {
        setMessages((prev) => prev.map((m) => String(m.sender_id) === String(from) ? { ...m, read_at: new Date().toISOString() } : m));
      });
      socket.on("message-error", ({ error: msg }: any) => setError(msg || "Unable to send message."));
      socket.on("gift-received", showGift);
      socket.on("gift-sent", showGift);
    })();

    return () => {
      active = false;
      socket?.disconnect();
      socketRef.current = null;
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [targetId]);

  const showGift = (transaction: any) => {
    if (!transaction?.id || seen.current.has(transaction.id)) return;
    seen.current.add(transaction.id);
    const gift = transaction.gift || transaction;
    setGiftBurst({ ...gift, quantity: transaction.quantity || 1, sender: transaction.sender });
    setTimeout(() => setGiftBurst(null), 3200);
  };

  const send = async () => {
    const content = draft.trim();
    if (!content || !targetId || sending) return;
    setSending(true); setError("");
    if (socketRef.current && socketReady) {
      socketRef.current.emit("private-message", { receiverId: targetId, content });
      setDraft("");
      setSending(false);
      return;
    }
    try {
      const message = await api.sendMessage(targetId, content);
      setMessages((prev) => prev.some((m) => m.id === message.id) ? prev : [...prev, message]);
      setDraft("");
    } catch (e: any) {
      setError(e.message || "Message failed to send.");
    } finally { setSending(false); }
  };

  const handleTyping = (value: string) => {
    setDraft(value);
    if (!socketRef.current || !socketReady) return;
    socketRef.current.emit("typing", { receiverId: targetId, isTyping: true });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit("typing", { receiverId: targetId, isTyping: false });
    }, 1500);
  };

  const attach = async () => {
    if (uploading) return;
    const permission = await import("expo-image-picker").then((m) => m.requestMediaLibraryPermissionsAsync());
    if (!permission.granted) {
      setError("Photo access is needed to attach an image.");
      return;
    }
    const Picker = await import("expo-image-picker");
    const result = await Picker.launchImageLibraryAsync({
      mediaTypes: Picker.MediaTypeOptions.All,
      quality: 0.85,
      allowsEditing: false
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (!socketRef.current || !socketReady) {
      setError("Realtime connection is not ready.");
      return;
    }

    setUploading(true); setError("");
    try {
      const filename = asset.fileName || asset.uri.split("/").pop() || "chat-media.jpg";
      const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
      const mime = asset.type === "video" ? `video/${ext === "mov" ? "quicktime" : ext}` : `image/${ext === "jpg" ? "jpeg" : ext}`;
      const form = new FormData();
      form.append("media", { uri: asset.uri, name: filename, type: mime } as any);
      const data = await api.uploadMessageMedia(form);
      socketRef.current.emit("private-message", {
        receiverId: targetId, content: "", type: data.type, media_urls: [data.url]
      });
    } catch (e: any) {
      setError(e.message || "Unable to upload media.");
    } finally { setUploading(false); }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const mine = String(item.sender_id) === String(myId);
    const media = item.media_urls?.[0];
    return (
      <View style={[s.messageRow, mine && s.messageRowMine]}>
        {!mine && (
          <View style={s.smallAvatar}>
            {otherUser?.profile_photo ? <Image source={{uri:otherUser.profile_photo}} style={s.smallAvatarImage}/> : <Text style={s.avatarLetter}>{(otherUser?.display_name || "A")[0]}</Text>}
          </View>
        )}
        <View style={[s.bubble, mine ? s.mineBubble : s.theirBubble]}>
          {!!media && item.type === "image" && <Image source={{uri:media}} style={s.media} />}
          {!!media && item.type === "video" && (
            <Pressable style={s.videoCard} onPress={() => Linking.openURL(media)}><Text style={s.videoIcon}>▶</Text><Text style={s.videoText}>Open video</Text></Pressable>
          )}
          {!!item.content && <Text style={s.bubbleText}>{item.content}</Text>}
          <View style={s.meta}><Text style={s.metaText}>{item.created_at ? new Date(item.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : ""}</Text>{mine && <Text style={[s.checks,item.read_at&&s.read]}>✓✓</Text>}</View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={s.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}><Text style={s.back}>‹</Text></Pressable>
        <Pressable style={s.identity} onPress={() => {}}>
          <View style={s.headerAvatar}>
            {otherUser?.profile_photo ? <Image source={{uri:otherUser.profile_photo}} style={s.headerAvatarImage}/> : <Text style={s.headerLetter}>{(otherUser?.display_name || "A")[0]}</Text>}
            <View style={[s.statusDot,{backgroundColor:socketReady?theme.success:theme.gold}]} />
          </View>
          <View style={{flex:1}}>
            <Text style={s.name} numberOfLines={1}>{otherUser?.display_name || otherUser?.username || "Chat"}</Text>
            <Text style={s.status}>{typing ? "typing…" : socketReady ? "Private conversation • Online" : "Connecting securely…"}</Text>
          </View>
        </Pressable>
        <Pressable style={s.headerAction} onPress={() => setShowGifts(true)}><Text style={s.headerGift}>♢</Text></Pressable>
      </View>

      <View style={s.privatePill}><Text style={s.privateText}>PRIVATE • SECURE CONVERSATION</Text></View>

      {loading ? <ActivityIndicator color={theme.pink} style={{marginTop:40}}/> : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item,index)=>item.id || String(index)}
          renderItem={renderMessage}
          contentContainerStyle={{paddingVertical:10,paddingBottom:18}}
          onContentSizeChange={()=>listRef.current?.scrollToEnd({animated:true})}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={s.welcome}><View style={s.welcomeIcon}><Text style={s.welcomeStar}>✦</Text></View><Text style={s.welcomeTitle}>Start something beautiful.</Text><Text style={s.welcomeSub}>Your first message begins this private conversation.</Text></View>}
        />
      )}

      {!!error && <Text style={s.error}>{error}</Text>}

      <View style={s.composer}>
        <Pressable style={[s.composerIcon,showGifts&&s.composerActive]} onPress={()=>setShowGifts(v=>!v)}><Text style={s.composerIconText}>♢</Text></Pressable>
        <Pressable style={s.composerIcon} onPress={attach} disabled={uploading}><Text style={s.composerIconText}>{uploading?"…":"＋"}</Text></Pressable>
        <TextInput style={s.input} placeholder="Write a private message…" placeholderTextColor="#81788d" value={draft} onChangeText={handleTyping} onSubmitEditing={send} returnKeyType="send" />
        <Pressable style={[s.sendBtn,(!draft.trim()||sending)&&s.sendDisabled]} onPress={send} disabled={!draft.trim()||sending}><Text style={s.sendText}>↑</Text></Pressable>
      </View>

      {giftBurst && (
        <View style={s.burst} pointerEvents="none">
          <View style={s.burstCard}><Text style={s.burstKicker}>GIFT SENT</Text><GiftIcon name={giftBurst.name} glyph={giftBurst.glyph} rarity={giftBurst.rarity} size={105} animated/><Text style={s.burstName}>{giftBurst.name}</Text><Text style={s.burstMeta}>×{giftBurst.quantity || 1} • ✦ A little luxury, delivered.</Text></View>
        </View>
      )}

      {showGifts && <LuxuryGiftTray receiverId={targetId} onClose={()=>setShowGifts(false)} onSent={(payload)=>{showGift(payload.transaction || payload);setShowGifts(false);}} />}
    </KeyboardAvoidingView>
  );
}

const s=StyleSheet.create({
  page:{flex:1,backgroundColor:"#08070e",paddingHorizontal:14},
  header:{flexDirection:"row",alignItems:"center",gap:9,paddingTop:12,paddingBottom:10},
  backBtn:{width:38,height:38,borderRadius:13,backgroundColor:"rgba(255,255,255,.045)",borderWidth:1,borderColor:"rgba(255,255,255,.08)",alignItems:"center",justifyContent:"center"},back:{color:"#fff",fontSize:31,marginTop:-4},
  identity:{flex:1,flexDirection:"row",alignItems:"center",gap:9},headerAvatar:{width:42,height:42,borderRadius:21,backgroundColor:theme.surface2,position:"relative",alignItems:"center",justifyContent:"center",overflow:"hidden",borderWidth:1,borderColor:"rgba(255,255,255,.12)"},headerAvatarImage:{width:"100%",height:"100%"},headerLetter:{color:"#fff",fontWeight:"900",fontSize:17},statusDot:{position:"absolute",right:0,bottom:0,width:11,height:11,borderRadius:6,borderWidth:2,borderColor:"#08070e"},name:{color:"#fff",fontSize:15,fontWeight:"900"},status:{color:theme.dim,fontSize:9,marginTop:2},headerAction:{width:40,height:40,borderRadius:14,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255,79,163,.08)",borderWidth:1,borderColor:"rgba(255,79,163,.2)"},headerGift:{color:theme.pink,fontSize:23},
  privatePill:{alignSelf:"center",paddingHorizontal:12,paddingVertical:5,borderRadius:999,backgroundColor:"rgba(255,255,255,.035)",borderWidth:1,borderColor:"rgba(255,255,255,.07)"},privateText:{color:"#6f677a",fontSize:7,fontWeight:"900",letterSpacing:1.5},
  messageRow:{flexDirection:"row",alignItems:"flex-end",gap:7,marginVertical:4,paddingHorizontal:2},messageRowMine:{justifyContent:"flex-end"},smallAvatar:{width:27,height:27,borderRadius:14,overflow:"hidden",backgroundColor:theme.purple,alignItems:"center",justifyContent:"center"},smallAvatarImage:{width:"100%",height:"100%"},avatarLetter:{color:"#fff",fontWeight:"900",fontSize:10},
  bubble:{maxWidth:"80%",borderRadius:20,paddingHorizontal:12,paddingTop:9,paddingBottom:6,borderWidth:1},mineBubble:{backgroundColor:theme.pink,borderColor:"rgba(255,255,255,.08)",borderBottomRightRadius:7},theirBubble:{backgroundColor:"#151024",borderColor:"#3a2b59",borderBottomLeftRadius:7},bubbleText:{color:"#fff",fontSize:13,lineHeight:19},meta:{flexDirection:"row",justifyContent:"flex-end",alignItems:"center",gap:5,marginTop:4},metaText:{color:"rgba(255,255,255,.52)",fontSize:7},checks:{color:"rgba(255,255,255,.5)",fontSize:9},read:{color:"#aee6ff"},media:{width:220,height:170,borderRadius:14,marginBottom:4},videoCard:{width:190,height:80,borderRadius:14,backgroundColor:"rgba(0,0,0,.25)",alignItems:"center",justifyContent:"center",gap:4,marginBottom:4},videoIcon:{color:theme.pink,fontSize:22},videoText:{color:"#fff",fontSize:10,fontWeight:"800"},
  welcome:{alignItems:"center",paddingTop:70,paddingHorizontal:30},welcomeIcon:{width:70,height:70,borderRadius:24,backgroundColor:"rgba(255,79,163,.08)",borderWidth:1,borderColor:"rgba(255,79,163,.18)",alignItems:"center",justifyContent:"center"},welcomeStar:{color:theme.pink,fontSize:30},welcomeTitle:{color:"#fff",fontSize:20,fontWeight:"900",marginTop:12},welcomeSub:{color:theme.dim,textAlign:"center",fontSize:10,lineHeight:16,marginTop:5},
  error:{color:"#ff8bad",fontSize:10,textAlign:"center",paddingVertical:4},composer:{flexDirection:"row",alignItems:"center",gap:7,paddingTop:7,paddingBottom:10},composerIcon:{width:40,height:42,borderRadius:14,backgroundColor:"#151024",borderWidth:1,borderColor:"#302842",alignItems:"center",justifyContent:"center"},composerActive:{borderColor:theme.pink,backgroundColor:"rgba(255,79,163,.10)"},composerIconText:{color:"#d9cfe1",fontSize:19},input:{flex:1,minHeight:42,maxHeight:100,borderRadius:15,backgroundColor:"#151024",borderWidth:1,borderColor:"#3a2b59",paddingHorizontal:13,color:"#fff",fontSize:12},sendBtn:{width:44,height:42,borderRadius:15,backgroundColor:theme.pink,alignItems:"center",justifyContent:"center",shadowColor:theme.pink,shadowOpacity:.3,shadowRadius:16,shadowOffset:{width:0,height:7}},sendDisabled:{opacity:.45},sendText:{color:"#fff",fontSize:22,fontWeight:"900"},
  burst:{position:"absolute",left:0,right:0,top:"18%",alignItems:"center",zIndex:20},burstCard:{width:290,minHeight:330,borderRadius:30,borderWidth:1,borderColor:"rgba(255,216,107,.3)",backgroundColor:"rgba(12,8,22,.96)",alignItems:"center",justifyContent:"center",padding:18,shadowColor:theme.pink,shadowOpacity:.55,shadowRadius:45,shadowOffset:{width:0,height:20}},burstKicker:{color:theme.gold,fontSize:8,fontWeight:"900",letterSpacing:2},burstName:{color:"#fff",fontSize:23,fontWeight:"900"},burstMeta:{color:"#cfc3da",fontSize:10,marginTop:4}
});
