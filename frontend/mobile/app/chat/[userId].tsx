import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import AppShell from "../../src/AppShell";
import { theme } from "../../src/theme";
import { api } from "../../src/phase2Api";

export default function Chat() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [peer, setPeer] = useState<any>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scroll = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [u, m] = await Promise.all([
        api.user(String(userId)),
        api.messages(String(userId), 100)
      ]);
      setPeer(u);
      setMessages(Array.isArray(m) ? m : m.messages || []);
    } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const send = async () => {
    const value = text.trim();
    if (!value || sending || !userId) return;
    setSending(true);
    setText("");
    try {
      const result = await api.sendMessage(String(userId), value);
      const message = result.message || result;
      setMessages(prev => [...prev, message]);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    } catch { setText(value); }
    finally { setSending(false); }
  };

  return <AppShell>
    <KeyboardAvoidingView style={s.page} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}><Text style={s.back}>‹</Text></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{peer?.display_name || peer?.username || "Chat"}</Text>
          <Text style={s.status}>Private conversation</Text>
        </View>
      </View>

      {loading ? <ActivityIndicator color={theme.pink} style={{ marginTop: 40 }} /> :
        <ScrollView ref={scroll} style={s.messages} contentContainerStyle={{ paddingVertical: 15 }} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
          {messages.map((m, i) => {
            const mine = m.sender_id !== String(userId);
            return <View key={m.id || i} style={[s.bubble, mine ? s.mine : s.theirs]}>
              <Text style={s.bubbleText}>{m.content}</Text>
            </View>;
          })}
          {!messages.length && <Text style={s.empty}>Start the conversation. Keep it kind. 💗</Text>}
        </ScrollView>}

      <View style={s.composer}>
        <TextInput value={text} onChangeText={setText} placeholder="Write a message…" placeholderTextColor={theme.dim} style={s.input} multiline />
        <Pressable disabled={!text.trim() || sending} onPress={send} style={[s.send, (!text.trim() || sending) && s.disabled]}>
          <Text style={s.sendText}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  </AppShell>;
}

const s = StyleSheet.create({
  page:{flex:1,backgroundColor:theme.bg},header:{flexDirection:"row",alignItems:"center",padding:12,borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,.07)"},back:{color:"#fff",fontSize:38,lineHeight:38,marginRight:8},name:{color:"#fff",fontSize:15,fontWeight:"900"},status:{color:theme.dim,fontSize:9,marginTop:2},call:{width:38,height:38,borderRadius:19,backgroundColor:theme.surface,alignItems:"center",justifyContent:"center"},messages:{flex:1,paddingHorizontal:12},bubble:{maxWidth:"78%",paddingHorizontal:13,paddingVertical:9,borderRadius:16,marginVertical:4},mine:{alignSelf:"flex-end",backgroundColor:theme.pink,borderBottomRightRadius:5},theirs:{alignSelf:"flex-start",backgroundColor:theme.surface,borderBottomLeftRadius:5},bubbleText:{color:"#fff",fontSize:12,lineHeight:17},empty:{color:theme.muted,textAlign:"center",paddingTop:80},composer:{flexDirection:"row",alignItems:"flex-end",gap:7,padding:10,borderTopWidth:1,borderTopColor:"rgba(255,255,255,.07)"},input:{flex:1,maxHeight:100,minHeight:44,backgroundColor:theme.surface,color:"#fff",borderRadius:20,paddingHorizontal:15,paddingVertical:11},send:{width:44,height:44,borderRadius:22,backgroundColor:theme.pink,alignItems:"center",justifyContent:"center"},sendText:{color:"#fff",fontSize:18,fontWeight:"900"},disabled:{opacity:.35}
});
