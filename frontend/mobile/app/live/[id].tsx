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
  Platform,
  Animated,
  Image
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Room, RoomEvent, Track, RemoteTrack } from "livekit-client";
import { VideoView } from "@livekit/react-native";
import { theme } from "../../src/theme";
import { api, API_URL, getUserId } from "../../src/api/client";

type ChatMessage = { id: string; message?: string; content?: string; user?: any; username?: string; system?: boolean };
type Gift = { id: string; name: string; image_url: string; coin_price: number };
type TopGifter = { user: { id: string; display_name: string; username: string }; totalCoins: number };

let heartSeq = 0;

function FloatingHeart({ left, onDone }: { left: number; onDone: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 2200, useNativeDriver: true }).start(onDone);
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -420] });
  const opacity = anim.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.1] });
  return (
    <Animated.Text style={{ position: "absolute", bottom: 140, left: `${left}%`, fontSize: 26, transform: [{ translateY }, { scale }], opacity }}>
      ❤️
    </Animated.Text>
  );
}

export default function LiveRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [giftCount, setGiftCount] = useState(0);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [remoteTrack, setRemoteTrack] = useState<RemoteTrack | null>(null);
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [topGifters, setTopGifters] = useState<TopGifter[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [giftAlert, setGiftAlert] = useState<string | null>(null);
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);
  const [ending, setEnding] = useState(false);

  const socketRef = useRef<any>(null);
  const livekitRoomRef = useRef<Room | null>(null);
  const listRef = useRef<FlatList>(null);

  const spawnHeart = () => {
    const newId = heartSeq++;
    setHearts((prev) => [...prev.slice(-20), { id: newId, left: 10 + Math.random() * 60 }]);
  };
  const removeHeart = (heartId: number) => setHearts((prev) => prev.filter((h) => h.id !== heartId));

  const loadTopGifters = useCallback(async () => {
    try {
      const data = await api.topGifters(String(id));
      setTopGifters(Array.isArray(data) ? data : []);
    } catch {}
  }, [id]);

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
        const [room, giftCatalog] = await Promise.all([api.liveRoom(String(id)), api.gifts().catch(() => [])]);
        if (!active) return;
        setRoomInfo(room);
        setViewerCount(room.viewer_count || 0);
        setLikeCount(room.like_count || 0);
        setGiftCount(room.gift_count || 0);
        setChat(room.messages || []);
        setGifts(Array.isArray(giftCatalog) ? giftCatalog : []);
        const hostIsMe = room.host?.id === myId;
        setIsHost(hostIsMe);
        loadTopGifters();

        if (!hostIsMe && room.host?.id) {
          api.followStatus(room.host.id).then((d) => active && setIsFollowing(d.following)).catch(() => {});
        }

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
        socket.on("like-count", (payload: { count: number }) => {
          if (!active) return;
          setLikeCount(payload.count);
          spawnHeart();
        });
        socket.on("gift-animation", (tx: any) => {
          if (!active) return;
          const name = tx.sender?.display_name || tx.sender?.username || "Someone";
          const giftName = tx.gift?.name || "a gift";
          setChat((prev) => [...prev, { id: `gift-${Date.now()}`, system: true, message: `🎁 ${name} sent ${giftName}!` }]);
          setGiftCount((prev) => prev + (tx.quantity || 1));
          setGiftAlert(`${name} sent ${tx.quantity > 1 ? `${tx.quantity}x ` : ""}${giftName}!`);
          spawnHeart();
          loadTopGifters();
          setTimeout(() => setGiftAlert(null), 3000);
        });
        socket.on("room-ended", () => {
          if (!active) return;
          setError("This stream has ended.");
          setTimeout(() => router.replace("/live"), 1500);
        });

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

  const sendLike = () => {
    setLikeCount((c) => c + 1);
    spawnHeart();
    socketRef.current?.emit("live-like", id);
  };

  const sendGift = async (giftId: string) => {
    try {
      await api.sendGift({ giftId, roomId: id, idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2)}` });
      setShowGiftPicker(false);
    } catch (e: any) {
      setError(e.message || "Gift failed.");
    }
  };

  const toggleFollow = async () => {
    if (!roomInfo?.host?.id) return;
    setFollowBusy(true);
    try {
      if (isFollowing) await api.unfollowUser(roomInfo.host.id);
      else await api.followUser(roomInfo.host.id);
      setIsFollowing((v) => !v);
    } catch {} finally {
      setFollowBusy(false);
    }
  };

  const endLive = async () => {
    setEnding(true);
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

      <View style={s.topBar}>
        <Pressable onPress={isHost ? leave : leave} style={s.closeBtn}>
          <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
        </Pressable>
        <View style={s.hostChip}>
          <View style={s.hostAvatar}>
            <Text style={{ color: "#fff", fontWeight: "900" }}>{(roomInfo?.host?.display_name || roomInfo?.host?.username || "?")[0]?.toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }} numberOfLines={1}>{roomInfo?.host?.display_name || roomInfo?.host?.username}</Text>
            <Text style={{ color: "#ccc", fontSize: 10 }}>#{roomInfo?.category}</Text>
          </View>
          {!isHost && (
            <Pressable onPress={toggleFollow} disabled={followBusy} style={isFollowing ? s.followingBtn : s.followBtn}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{isFollowing ? "Following" : "+ Follow"}</Text>
            </Pressable>
          )}
        </View>
        <View style={s.viewerBadge}>
          <Text style={s.viewerBadgeText}>🔴 {viewerCount}</Text>
        </View>
      </View>

      {!!error && <Text style={s.error}>{error}</Text>}
      {!!giftAlert && (
        <View style={s.giftAlert}>
          <Text style={{ color: "#3a2a00", fontWeight: "800", fontSize: 13 }}>{giftAlert}</Text>
        </View>
      )}

      <View style={s.heartLayer} pointerEvents="none">
        {hearts.map((h) => (
          <FloatingHeart key={h.id} left={h.left} onDone={() => removeHeart(h.id)} />
        ))}
      </View>

      <View style={s.rightRail}>
        <Pressable onPress={sendLike} style={s.railBtn}>
          <View style={s.railIcon}><Text style={{ fontSize: 22 }}>❤️</Text></View>
          <Text style={s.railCount}>{likeCount}</Text>
        </Pressable>
        <Pressable onPress={() => setShowGiftPicker((v) => !v)} style={s.railBtn}>
          <View style={s.railIcon}><Text style={{ fontSize: 22 }}>🎁</Text></View>
          <Text style={s.railCount}>{giftCount}</Text>
        </Pressable>
        <Pressable onPress={() => setShowLeaderboard((v) => !v)} style={s.railBtn}>
          <View style={s.railIcon}><Text style={{ fontSize: 22 }}>🏆</Text></View>
          <Text style={s.railCount}>Top</Text>
        </Pressable>
        {isHost && (
          <Pressable onPress={endLive} disabled={ending} style={s.railBtn}>
            <View style={s.railIcon}><Text style={{ fontSize: 20 }}>⏹</Text></View>
            <Text style={s.railCount}>{ending ? "…" : "End"}</Text>
          </Pressable>
        )}
      </View>

      {showLeaderboard && (
        <View style={s.leaderboardPanel}>
          <Text style={{ color: "#fff", fontWeight: "800", marginBottom: 8 }}>Top gifters this stream</Text>
          {topGifters.length === 0 ? (
            <Text style={{ color: "#999", fontSize: 12 }}>No gifts yet — be the first!</Text>
          ) : (
            topGifters.map((g, i) => (
              <View key={g.user?.id || i} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 }}>
                <Text style={{ color: theme.gold, fontWeight: "800", width: 20 }}>#{i + 1}</Text>
                <Text style={{ color: "#fff", flex: 1, fontSize: 13 }} numberOfLines={1}>{g.user?.display_name || g.user?.username || "Someone"}</Text>
                <Text style={{ color: theme.gold, fontSize: 13 }}>🪙 {g.totalCoins}</Text>
              </View>
            ))
          )}
        </View>
      )}

      {showGiftPicker && (
        <View style={s.giftPicker}>
          {gifts.map((g) => (
            <Pressable key={g.id} onPress={() => sendGift(g.id)} style={s.giftBtn}>
              {g.image_url?.startsWith("http") ? (
                <Image source={{ uri: g.image_url }} style={{ width: 26, height: 26 }} />
              ) : (
                <Text style={{ fontSize: 22 }}>{g.image_url || "🎁"}</Text>
              )}
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }} numberOfLines={1}>{g.name}</Text>
              <Text style={{ color: theme.gold, fontSize: 10 }}>🪙 {g.coin_price}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={s.chatOverlay}>
        <FlatList
          ref={listRef}
          data={chat.slice(-30)}
          keyExtractor={(item, idx) => item.id || String(idx)}
          style={{ maxHeight: 130 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <Text style={item.system ? s.systemMsg : s.chatMsg}>
              {!item.system && <Text style={{ fontWeight: "800" }}>{item.user?.display_name || item.username || ""}: </Text>}
              {item.message || item.content}
            </Text>
          )}
        />
        <View style={s.composer}>
          <TextInput
            style={s.input}
            placeholder="Say something…"
            placeholderTextColor="#ddd"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={sendChat}
          />
          <Pressable style={s.sendBtn} onPress={sendChat}>
            <Text style={s.sendText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#000" },
  videoBox: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0a0a12", alignItems: "center", justifyContent: "center" },
  videoFill: { width: "100%", height: "100%" },
  fallback: { alignItems: "center", justifyContent: "center" },
  fallbackText: { color: theme.muted, marginTop: 8 },
  topBar: { position: "absolute", top: 50, left: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  hostChip: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  hostAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.pink, alignItems: "center", justifyContent: "center" },
  followBtn: { backgroundColor: theme.pink, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  followingBtn: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  viewerBadge: { backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  viewerBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  error: { color: "#ff6b6b", textAlign: "center", marginTop: 100, position: "absolute", left: 12, right: 12 },
  giftAlert: { position: "absolute", top: 110, alignSelf: "center", backgroundColor: "rgba(255,209,102,0.95)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  heartLayer: { ...StyleSheet.absoluteFillObject },
  rightRail: { position: "absolute", right: 10, bottom: 160, alignItems: "center", gap: 18 },
  railBtn: { alignItems: "center", gap: 2 },
  railIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  railCount: { color: "#fff", fontSize: 11, fontWeight: "700" },
  leaderboardPanel: { position: "absolute", right: 66, bottom: 160, width: 200, backgroundColor: "rgba(15,15,26,0.92)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#333" },
  giftPicker: { position: "absolute", left: 12, right: 66, bottom: 160, backgroundColor: "rgba(15,15,26,0.92)", borderRadius: 14, padding: 10, flexDirection: "row", flexWrap: "wrap", gap: 8, maxHeight: 220, borderWidth: 1, borderColor: "#333" },
  giftBtn: { width: "22%", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 8, alignItems: "center", gap: 2 },
  chatOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingBottom: 20, paddingTop: 10 },
  chatMsg: { color: "#eee", fontSize: 13, paddingVertical: 3 },
  systemMsg: { color: theme.gold, fontSize: 13, paddingVertical: 3, fontStyle: "italic" },
  composer: { flexDirection: "row", gap: 8, marginTop: 8 },
  input: { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, padding: 12, color: "#fff" },
  sendBtn: { backgroundColor: theme.pink, borderRadius: 20, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  sendText: { color: "#fff", fontWeight: "800" }
});
