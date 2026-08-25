import { useCallback, useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { theme } from "../../src/theme";
import { api, API_URL, getUserId, getValidAccessToken } from "../../src/api/client";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

export default function Chat() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listRef = useRef<FlatList>(null);
  const socketRef = useRef<any>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await api.messages(String(userId));
      setMessages(Array.isArray(data) ? data : []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Unable to load this conversation.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    (async () => setMyId(await getUserId()))();
    load();
  }, [load]);

  // Live updates: connect a lightweight socket just to receive messages
  // sent by the other person while this screen is open.
  useEffect(() => {
    let active = true;
    let socket: any;
    (async () => {
      const token = await getValidAccessToken();
      if (!token) return;
      const { io } = await import("socket.io-client");
      if (!active) return;
      socket = io(API_URL, { transports: ["websocket"] });
      socketRef.current = socket;
      socket.on("connect", () => socket.emit("authenticate", token));
      socket.on("private-message", (message: Message) => {
        if (!active) return;
        if (message.sender_id === userId || message.receiver_id === userId) {
          setMessages((prev) => [...prev, message]);
        }
      });
    })();
    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [userId]);

  const send = async () => {
    const content = draft.trim();
    if (!content || !userId) return;
    setDraft("");
    try {
      const message = await api.sendMessage(String(userId), content);
      setMessages((prev) => [...prev, message]);
    } catch (e: any) {
      setError(e.message || "Message failed to send.");
    }
  };

  return (
    <KeyboardAvoidingView style={s.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={s.back}>‹</Text>
        </Pressable>
        <Text style={s.title}>Chat</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.pink} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12, gap: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[s.bubble, item.sender_id === myId ? s.bubbleMine : s.bubbleTheirs]}>
              <Text style={s.bubbleText}>{item.content}</Text>
            </View>
          )}
        />
      )}

      {!!error && <Text style={s.error}>{error}</Text>}

      <View style={s.composer}>
        <TextInput
          style={s.input}
          placeholder="Type a message…"
          placeholderTextColor="#8d849b"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
        />
        <Pressable style={s.sendBtn} onPress={send}>
          <Text style={s.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.bg, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  back: { fontSize: 36, color: theme.text },
  title: { fontSize: 22, fontWeight: "900", color: theme.text },
  bubble: { maxWidth: "78%", borderRadius: 16, padding: 12 },
  bubbleMine: { backgroundColor: theme.pink, alignSelf: "flex-end" },
  bubbleTheirs: { backgroundColor: theme.surface, alignSelf: "flex-start", borderWidth: 1, borderColor: theme.border },
  bubbleText: { color: "#fff" },
  error: { color: "#ff6b6b", textAlign: "center", marginVertical: 6 },
  composer: { flexDirection: "row", gap: 8, paddingTop: 8 },
  input: { flex: 1, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 15, padding: 14, color: theme.text },
  sendBtn: { backgroundColor: theme.pink, borderRadius: 15, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
  sendText: { color: "#fff", fontWeight: "800" }
});
