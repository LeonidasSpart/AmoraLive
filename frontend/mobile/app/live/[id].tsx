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
import * as SecureStore from "expo-secure-store";
import { Room, RoomEvent, Track, RemoteTrack } from "livekit-client";
import { VideoView } from "@livekit/react-native";
import { theme } from "../../src/theme";
import { api, API_URL, getUserId } from "../../src/api/client";

type ChatMessage = { id: string; message?: string; content?: string; user_id?: string; system?: boolean };

export default function LiveRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [remoteTrack, setRemoteTrack] = useState<RemoteTrack | null>(null);
  const [videoAvailable, setVideoAvailable] = useState(true);

  const socketRef = useRef<any>(null);
  const livekitRoomRef = useRef<Room | null>(null);
  const listRef = useRef<FlatList>(null);

  const teardown = useCallback(async () => {
    if (livekitRoomRef.current) {
      await livekitRoomRef.current.disconnect();
      livekitRoomRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.emit("leave-live", id);
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    await api.leaveLiveRoom(String(id)).catch(() => {});
  }, [id]);

  useEffect(() => {
    let active = true;

    (async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        router.replace("/auth");
        return;
      }
      try {
        const myId = await getUserId();
        const room = await api.liveRoom(String(id));
        if (!active) return;
        setRoomInfo(room);
        setViewerCount(room.viewer_count || 0);
        setChat(room.messages || []);
        setIsHost(room.host?.id === myId);

        await api.joinLiveRoom(String(id)).catch(() => {});

        const { io } = await import("socket.io-client");
        if (!active) return;
        const socket = io(API_URL, { transports: ["websocket"] });
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("authenticate", token, (ack: any) => {
            if (!ack?.ok) {
              setError("Your session expired. Please sign in again.");
              return;
            }
            socket.emit("join-live", id);
          });
        });
        socket.on("new-chat", (msg: ChatMessage) => active && setChat((prev) => [...prev, msg]));
        socket.on("viewer-count", (payload: { count: number }) => active && setViewerCount(payload.count));
        socket.on("gift-animation", (tx: any) => {
          if (!active) return;
          setChat((prev) => [...prev, { id: `gift-${Date.now()}`, system: true, message: `🎁 ${tx.sender?.display_name || "Someone"} sent ${tx.gift?.name || "a gift"}!` }]);
        });

        // LiveKit: publish if host, subscribe-only otherwise.
        const tokenData = await api.liveToken(String(id)).catch(() => null);
        if (tokenData?.token && tokenData?.url) {
          const lkRoom = new Room({ adaptiveStream: true, dynacast: true });
          livekitRoomRef.current = lkRoom;
          lkRoom.on(RoomEvent.TrackSubscribed, (track) => {
            if (track.kind === Track.Kind.Video) setRemoteTrack(track as RemoteTrack);
          });
          lkRoom.on(RoomEvent.TrackUnsubscribed, () => setRemoteTrack(null));
          await lkRoom.connect(tokenData.url, tokenData.token);
          if (tokenData.role === "host") {
            await lkRoom.localParticipant.setCameraEnabled(true);
            await lkRoom.localParticipant.setMicrophoneEnabled(true);
          }
        } else {
          setVideoAvailable(false);
        }
      } catch (e: any) {
        if (active) setError(e.message || "Unable to load this live room.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const sendChat = () => {
    const message = draft.trim();
    if (!message) return;
    setDraft("");
    socketRef.current?.emit("live-chat", { roomId: id, message });
  };

  const endLive = async () => {
    try {
      await api.endLiveRoom(String(id));
    } catch {}
    await teardown();
    router.replace("/live");
  };

  const leave = async () => {
    await teardown();
    router.back();
  };

  if (loading) {
    return (
      <View style={[s.page, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={theme.pink} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.header}>
        <Pressable onPress={isHost ? endLive : leave}>
          <Text style={s.back}>‹</Text>
        </Pressable>
        <Text style={s.title} numberOfLines={1}>{roomInfo?.title || "Live"}</Text>
        <View style={s.viewerBadge}>
          <Text style={s.viewerBadgeText}>👁 {viewerCount}</Text>
        </View>
      </View>

      {!!error && <Text style={s.error}>{error}</Text>}

      <View style={s.videoBox}>
        {videoAvailable && remoteTrack ? (
          <VideoView style={s.videoFill} videoTrack={remoteTrack} objectFit="cover" />
        ) : (
          <View style={s.fallback}>
            <Text style={{ fontSize: 40 }}>📺</Text>
            <Text style={s.fallbackText}>{isHost ? "Starting your stream…" : "Waiting for video…"}</Text>
          </View>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={chat}
        keyExtractor={(item, idx) => item.id || String(idx)}
        style={{ flex: 1, marginTop: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <Text style={item.system ? s.systemMsg : s.chatMsg}>
            {item.message || item.content}
          </Text>
        )}
      />

      <View style={s.composer}>
        <TextInput
          style={s.input}
          placeholder="Say something…"
          placeholderTextColor="#8d849b"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={sendChat}
        />
        <Pressable style={s.sendBtn} onPress={sendChat}>
          <Text style={s.sendText}>Send</Text>
        </Pressable>
      </View>

      {isHost && (
        <Pressable style={s.endBtn} onPress={endLive}>
          <Text style={s.endBtnText}>End Live</Text>
        </Pressable>
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#050407", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  back: { fontSize: 36, color: "#fff" },
  title: { flex: 1, color: "#fff", fontSize: 18, fontWeight: "800" },
  viewerBadge: { backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  viewerBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  error: { color: "#ff6b6b", textAlign: "center", marginTop: 8 },
  videoBox: { width: "100%", aspectRatio: 4 / 3, backgroundColor: "#000", borderRadius: 16, overflow: "hidden", marginTop: 12, borderWidth: 1, borderColor: theme.border },
  videoFill: { width: "100%", height: "100%" },
  fallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  fallbackText: { color: theme.muted, marginTop: 8 },
  chatMsg: { color: "#eee", fontSize: 13, paddingVertical: 3 },
  systemMsg: { color: theme.gold, fontSize: 13, paddingVertical: 3, fontStyle: "italic" },
  composer: { flexDirection: "row", gap: 8, paddingTop: 8 },
  input: { flex: 1, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 15, padding: 12, color: "#fff" },
  sendBtn: { backgroundColor: theme.pink, borderRadius: 15, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  sendText: { color: "#fff", fontWeight: "800" },
  endBtn: { backgroundColor: "#ff3355", borderRadius: 14, padding: 12, alignItems: "center", marginTop: 10 },
  endBtnText: { color: "#fff", fontWeight: "900" }
});
