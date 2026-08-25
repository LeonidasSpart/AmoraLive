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
  Image,
  Modal
} from "react-native";
import { Room, RoomEvent, Track, RemoteTrack } from "livekit-client";
import { VideoView } from "@livekit/react-native";
import { theme } from "../../src/theme";
import { api, API_URL, getUserId, getValidAccessToken } from "../../src/api/client";
import GiftIcon from "../../src/GiftIcon";

type ChatMessage = { id: string; message?: string; content?: string; user?: any; username?: string; system?: boolean };
type Gift = { id: string; name: string; image_url?: string | null; coin_price: number; glyph?: string | null; rarity?: string | null };
type TopGifter = { user: { id: string; display_name: string; username: string }; totalCoins: number };
type BattleState = {
  battleId: string;
  mySide: "a" | "b";
  endsAt: number;
  opponent: { id: string; title: string; host: any };
  scoreA: number;
  scoreB: number;
};

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
  const [opponentTrack, setOpponentTrack] = useState<RemoteTrack | null>(null);
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [topGifters, setTopGifters] = useState<TopGifter[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [giftAlert, setGiftAlert] = useState<string | null>(null);
  const [giftShowcase, setGiftShowcase] = useState<any | null>(null);
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);
  const [ending, setEnding] = useState(false);
  const giftShowcaseAnim = useRef(new Animated.Value(0)).current;

  const [battle, setBattle] = useState<BattleState | null>(null);
  const [battleTimeLeft, setBattleTimeLeft] = useState(0);
  const [battleResult, setBattleResult] = useState<string | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<any>(null);
  const [outgoingInvite, setOutgoingInvite] = useState<boolean>(false);
  const [showBattlePicker, setShowBattlePicker] = useState(false);
  const [challengeableRooms, setChallengeableRooms] = useState<any[]>([]);

  const socketRef = useRef<any>(null);
  const livekitRoomRef = useRef<Room | null>(null);
  const opponentRoomRef = useRef<Room | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!giftShowcase) return;
    giftShowcaseAnim.setValue(0);
    Animated.spring(giftShowcaseAnim, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }).start();
  }, [giftShowcase]);

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

  const disconnectOpponent = useCallback(async () => {
    if (opponentRoomRef.current) {
      await opponentRoomRef.current.disconnect();
      opponentRoomRef.current = null;
    }
    setOpponentTrack(null);
  }, []);

  const connectOpponentVideo = useCallback(async (opponentRoomId: string) => {
    try {
      const tokenData = await api.liveToken(opponentRoomId).catch(() => null);
      if (!tokenData?.token || !tokenData?.url) return;
      const room = new Room({ adaptiveStream: true, dynacast: true });
      opponentRoomRef.current = room;
      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Video) setOpponentTrack(track as RemoteTrack);
      });
      room.on(RoomEvent.TrackUnsubscribed, () => setOpponentTrack(null));
      await room.connect(tokenData.url, tokenData.token);
    } catch {}
  }, []);

  const teardown = useCallback(async () => {
    if (livekitRoomRef.current) {
      await livekitRoomRef.current.disconnect();
      livekitRoomRef.current = null;
    }
    await disconnectOpponent();
    if (socketRef.current) {
      socketRef.current.emit("leave-live", id);
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    await api.leaveLiveRoom(String(id)).catch(() => {});
  }, [id, disconnectOpponent]);

  useEffect(() => {
    let active = true;

    (async () => {
      const token = await getValidAccessToken();
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
          const gift = tx.gift || {};
          setChat((prev) => [...prev, { id: `gift-${Date.now()}`, system: true, message: `${name} sent ${tx.quantity > 1 ? `${tx.quantity}× ` : ""}${giftName}` }]);
          setGiftCount((prev) => prev + (tx.quantity || 1));
          setGiftAlert(`${name} sent ${tx.quantity > 1 ? `${tx.quantity}× ` : ""}${giftName}!`);
          setGiftShowcase({ ...gift, senderName: name, quantity: tx.quantity || 1 });
          spawnHeart();
          loadTopGifters();
          setTimeout(() => setGiftAlert(null), 3000);
          setTimeout(() => setGiftShowcase(null), 5200);
        });
        socket.on("room-ended", () => {
          if (!active) return;
          setError("This stream has ended.");
          setTimeout(() => router.replace("/live"), 1500);
        });

        // ---------- PK battle events ----------
        socket.on("battle:invite", (payload: any) => active && setIncomingInvite(payload));
        socket.on("battle:invite_expired", () => {
          if (!active) return;
          setIncomingInvite(null);
          setOutgoingInvite(false);
        });
        socket.on("battle:invite_declined", () => {
          if (!active) return;
          setOutgoingInvite(false);
          setError("Your battle invite was declined.");
        });
        socket.on("battle:invite_cancelled", () => active && setIncomingInvite(null));
        socket.on("battle:started", async (payload: any) => {
          if (!active) return;
          setIncomingInvite(null);
          setOutgoingInvite(false);
          setBattle({ ...payload, scoreA: 0, scoreB: 0 });
          setBattleResult(null);
          await connectOpponentVideo(payload.opponent.id);
        });
        socket.on("battle:score", (payload: any) => {
          if (!active) return;
          setBattle((prev) => (prev && prev.battleId === payload.battleId ? { ...prev, scoreA: payload.scoreA, scoreB: payload.scoreB } : prev));
        });
        socket.on("battle:ended", async (payload: any) => {
          if (!active) return;
          setBattle((prev) => {
            if (!prev || prev.battleId !== payload.battleId) return prev;
            const mine = prev.mySide === "a" ? payload.scoreA : payload.scoreB;
            const theirs = prev.mySide === "a" ? payload.scoreB : payload.scoreA;
            setBattleResult(mine === theirs ? "🤝 It's a draw!" : mine > theirs ? "🏆 You won the battle!" : "😢 You lost the battle.");
            return { ...prev, scoreA: payload.scoreA, scoreB: payload.scoreB };
          });
          await disconnectOpponent();
          setTimeout(() => {
            if (active) {
              setBattle(null);
              setBattleResult(null);
            }
          }, 4000);
        });

        // In case this viewer joined a room that's already mid-battle.
        api.battleStatus(String(id)).then(async (b: any) => {
          if (!active || !b?.active) return;
          setBattle({ battleId: b.battleId, mySide: b.mySide, endsAt: b.endsAt, opponent: b.opponent, scoreA: b.scoreA, scoreB: b.scoreB });
          await connectOpponentVideo(b.opponent.id);
        }).catch(() => {});

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

  useEffect(() => {
    if (!battle?.endsAt) {
      setBattleTimeLeft(0);
      return;
    }
    const tick = () => setBattleTimeLeft(Math.max(0, Math.ceil((battle.endsAt - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [battle?.endsAt, battle?.battleId]);

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

  const openBattlePicker = async () => {
    try {
      const rooms = await api.liveRooms();
      setChallengeableRooms((Array.isArray(rooms) ? rooms : []).filter((r: any) => r.id !== id));
    } catch {}
    setShowBattlePicker(true);
  };

  const startChallenge = async (targetRoomId: string) => {
    try {
      await api.battleInvite(String(id), targetRoomId);
      setOutgoingInvite(true);
      setShowBattlePicker(false);
    } catch (e: any) {
      setError(e.message || "Unable to send battle invite.");
    }
  };

  const respondToInvite = async (accept: boolean) => {
    if (!incomingInvite) return;
    try {
      if (accept) await api.battleAccept(String(id));
      else await api.battleDecline(String(id));
    } catch {}
    setIncomingInvite(null);
  };

  const endBattle = async () => {
    try {
      await api.battleEnd(String(id));
    } catch {}
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

  const myScore = battle ? (battle.mySide === "a" ? battle.scoreA : battle.scoreB) : 0;
  const oppScore = battle ? (battle.mySide === "a" ? battle.scoreB : battle.scoreA) : 0;
  const battleFillPct = battle ? Math.round((myScore / (myScore + oppScore || 1)) * 100) : 50;

  return (
    <KeyboardAvoidingView style={s.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={battle ? s.videoTopHalf : s.videoBox}>
        {videoAvailable && remoteTrack ? (
          <VideoView style={s.videoFill} videoTrack={remoteTrack} objectFit="cover" />
        ) : (
          <View style={s.fallback}>
            <Text style={{ fontSize: 40 }}>📺</Text>
            <Text style={s.fallbackText}>{isHost ? "Starting your stream…" : "Waiting for video…"}</Text>
          </View>
        )}
      </View>

      {battle && (
        <View style={s.videoBottomHalf}>
          {opponentTrack ? (
            <VideoView style={s.videoFill} videoTrack={opponentTrack} objectFit="cover" />
          ) : (
            <View style={s.fallback}>
              <Text style={{ fontSize: 30 }}>📺</Text>
            </View>
          )}
          <View style={s.opponentLabel}>
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{battle.opponent?.host?.display_name || battle.opponent?.host?.username}</Text>
          </View>
        </View>
      )}

      {battle && (
        <View style={s.battleBar}>
          <View style={s.battleScoreRow}>
            <Text style={s.battleScoreText}>🔥 {myScore}</Text>
            <View style={s.battleTimerBadge}>
              <Text style={{ color: "#fff", fontSize: 12 }}>{Math.floor(battleTimeLeft / 60)}:{String(battleTimeLeft % 60).padStart(2, "0")}</Text>
            </View>
            <Text style={s.battleScoreText}>{oppScore} 🔥</Text>
          </View>
          <View style={s.battleFillTrack}>
            <View style={[s.battleFill, { width: `${battleFillPct}%` }]} />
          </View>
        </View>
      )}
      {!!battleResult && (
        <View style={s.battleResultBanner}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>{battleResult}</Text>
        </View>
      )}

      <View style={s.topBar}>
        <Pressable onPress={leave} style={s.closeBtn}>
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
      {outgoingInvite && !battle && (
        <View style={s.inviteBanner}><Text style={{ color: "#fff", fontSize: 13 }}>⚔️ Battle invite sent — waiting for a response…</Text></View>
      )}
      {!!giftShowcase && (
        <Animated.View style={[s.giftShowcase, { opacity: giftShowcaseAnim, transform: [{ perspective: 900 }, { scale: giftShowcaseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.62, 1] }) }, { translateY: giftShowcaseAnim.interpolate({ inputRange: [0, 1], outputRange: [35, 0] }) }, { rotateY: giftShowcaseAnim.interpolate({ inputRange: [0, 1], outputRange: ["-10deg", "0deg"] }) }] }]} pointerEvents="none">
          <View style={s.giftLuxuryCard}>
            <View style={s.giftHalo} />
            <View style={s.giftSparkle}><Text style={s.giftSparkleText}>✦</Text></View>
            <Text style={s.giftRarity}>{String(giftShowcase.rarity || "PREMIUM").toUpperCase()}</Text>
            <GiftIcon name={giftShowcase.name} glyph={giftShowcase.glyph} rarity={giftShowcase.rarity} size={210} animated />
            <Text style={s.giftShowcaseEyebrow}>AMORA LUXURY GIFT</Text>
            <Text style={s.giftShowcaseName}>{giftShowcase.name}</Text>
            <Text style={s.giftShowcaseMeta}>{giftShowcase.senderName} · {giftShowcase.coin_price || 0} coins{giftShowcase.quantity > 1 ? ` · ×${giftShowcase.quantity}` : ""}</Text>
          </View>
        </Animated.View>
      )}
      {!!giftAlert && (
        <View style={s.giftAlert}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>{giftAlert}</Text>
        </View>
      )}

      {incomingInvite && isHost && !battle && (
        <View style={s.inviteBanner}>
          <Text style={{ color: "#fff", fontWeight: "700", marginBottom: 8 }}>🔥 {incomingInvite.fromHost?.display_name || incomingInvite.fromHost?.username} wants to battle!</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable onPress={() => respondToInvite(true)} style={s.acceptBtn}><Text style={{ color: "#06110a", fontWeight: "700" }}>Accept</Text></Pressable>
            <Pressable onPress={() => respondToInvite(false)} style={s.declineBtn}><Text style={{ color: "#fff", fontWeight: "700" }}>Decline</Text></Pressable>
          </View>
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
          <View style={s.railIcon}><View style={s.gemIcon}><Text style={{ color: "#fff", fontSize: 15 }}>✦</Text></View></View>
          <Text style={s.railCount}>{giftCount}</Text>
        </Pressable>
        <Pressable onPress={() => setShowLeaderboard((v) => !v)} style={s.railBtn}>
          <View style={s.railIcon}><Text style={{ fontSize: 22 }}>🏆</Text></View>
          <Text style={s.railCount}>Top</Text>
        </Pressable>
        {isHost && !battle && (
          <Pressable onPress={openBattlePicker} style={s.railBtn}>
            <View style={s.railIcon}><Text style={{ fontSize: 22 }}>⚔️</Text></View>
            <Text style={s.railCount}>Battle</Text>
          </Pressable>
        )}
        {isHost && battle && (
          <Pressable onPress={endBattle} style={s.railBtn}>
            <View style={s.railIcon}><Text style={{ fontSize: 22 }}>⚔️</Text></View>
            <Text style={s.railCount}>End</Text>
          </Pressable>
        )}
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
              <GiftIcon name={g.name} glyph={g.glyph} rarity={g.rarity} size={50} animated={g.rarity === "legendary" || g.rarity === "mythic"} />
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }} numberOfLines={1}>{g.name}</Text>
              <Text style={{ color: theme.gold, fontSize: 10 }}>🪙 {g.coin_price}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Modal visible={showBattlePicker} transparent animationType="fade" onRequestClose={() => setShowBattlePicker(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setShowBattlePicker(false)}>
          <Pressable style={s.modalPanel} onPress={(e) => e.stopPropagation()}>
            <Text style={{ color: "#fff", fontWeight: "800", marginBottom: 10 }}>⚔️ Challenge a live streamer</Text>
            {challengeableRooms.length === 0 ? (
              <Text style={{ color: "#999", fontSize: 13 }}>No other streamers are live right now.</Text>
            ) : (
              <FlatList
                data={challengeableRooms}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 320 }}
                renderItem={({ item }) => (
                  <Pressable onPress={() => startChallenge(item.id)} style={s.challengeRow}>
                    <Text style={{ color: "#fff", flex: 1, fontSize: 13 }} numberOfLines={1}>{item.host?.display_name || item.host?.username} — {item.title}</Text>
                    <Text style={{ color: "#999", fontSize: 12 }}>👁 {item.viewer_count}</Text>
                  </Pressable>
                )}
              />
            )}
            <Pressable onPress={() => setShowBattlePicker(false)} style={[s.declineBtn, { marginTop: 12 }]}>
              <Text style={{ color: "#fff", fontWeight: "700", textAlign: "center" }}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

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
  videoTopHalf: { position: "absolute", top: 0, left: 0, right: 0, height: "50%", backgroundColor: "#0a0a12", alignItems: "center", justifyContent: "center", borderBottomWidth: 2, borderBottomColor: theme.pink, overflow: "hidden" },
  videoBottomHalf: { position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", backgroundColor: "#0a0a12", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  opponentLabel: { position: "absolute", bottom: 8, left: 8, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  videoFill: { width: "100%", height: "100%" },
  fallback: { alignItems: "center", justifyContent: "center" },
  fallbackText: { color: theme.muted, marginTop: 8 },
  battleBar: { position: "absolute", top: "50%", left: 0, right: 0, transform: [{ translateY: -20 }], zIndex: 5, paddingHorizontal: 16 },
  battleScoreRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  battleScoreText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  battleTimerBadge: { backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 2 },
  battleFillTrack: { height: 6, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 4, overflow: "hidden" },
  battleFill: { height: "100%", backgroundColor: theme.pink },
  battleResultBanner: { position: "absolute", top: "40%", alignSelf: "center", backgroundColor: "rgba(0,0,0,0.8)", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, zIndex: 6 },
  topBar: { position: "absolute", top: 50, left: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  hostChip: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  hostAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.pink, alignItems: "center", justifyContent: "center" },
  followBtn: { backgroundColor: theme.pink, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  followingBtn: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  viewerBadge: { backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  viewerBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  error: { color: "#ff6b6b", textAlign: "center", marginTop: 100, position: "absolute", left: 12, right: 12 },
  inviteBanner: { position: "absolute", top: 100, left: 12, right: 12, backgroundColor: "rgba(20,20,35,0.95)", borderWidth: 1, borderColor: theme.pink, borderRadius: 12, padding: 12, zIndex: 5 },
  acceptBtn: { flex: 1, backgroundColor: "#35df70", borderRadius: 10, paddingVertical: 8, alignItems: "center" },
  declineBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10, paddingVertical: 8, alignItems: "center" },
  giftAlert: { position: "absolute", top: 140, alignSelf: "center", backgroundColor: "rgba(15,10,28,0.92)", borderWidth: 1, borderColor: "rgba(255,105,190,.55)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, zIndex: 12 },
  giftShowcase: { position: "absolute", left: 0, right: 0, top: "18%", alignItems: "center", zIndex: 20 },
  giftLuxuryCard: { width: 300, minHeight: 355, borderRadius: 30, borderWidth: 1, borderColor: "rgba(255,216,107,.30)", backgroundColor: "rgba(12,8,22,.88)", alignItems: "center", justifyContent: "center", overflow: "hidden", paddingVertical: 18, shadowColor: theme.pink, shadowOpacity: .55, shadowRadius: 45, shadowOffset: { width: 0, height: 20 } },
  giftSparkle: { position: "absolute", right: 18, top: 18, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,216,107,.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,216,107,.20)" },
  giftSparkleText: { color: theme.gold, fontSize: 18 },
  giftRarity: { color: theme.gold, fontSize: 8, fontWeight: "900", letterSpacing: 2.2, marginBottom: -4 },
  giftHalo: { position: "absolute", width: 290, height: 290, borderRadius: 145, backgroundColor: "rgba(255,63,157,.18)", borderWidth: 1, borderColor: "rgba(255,216,107,.24)", shadowColor: theme.pink, shadowOpacity: .9, shadowRadius: 55, shadowOffset: { width: 0, height: 0 } },
  giftShowcaseImage: { width: 235, height: 235, resizeMode: "contain" },
  giftShowcaseEyebrow: { color: theme.gold, fontSize: 10, letterSpacing: 3, fontWeight: "900", marginTop: -8 },
  giftShowcaseName: { color: "#fff", fontSize: 27, fontWeight: "900", textShadowColor: "rgba(255,63,157,.8)", textShadowRadius: 18, marginTop: 2 },
  giftShowcaseMeta: { color: "#e8dff1", fontSize: 12, marginTop: 4 },
  heartLayer: { ...StyleSheet.absoluteFillObject },
  rightRail: { position: "absolute", right: 10, bottom: 160, alignItems: "center", gap: 18 },
  railBtn: { alignItems: "center", gap: 2 },
  railIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  gemIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: theme.pink, alignItems: "center", justifyContent: "center", transform: [{ rotate: "45deg" }] },
  giftImage: { width: 48, height: 48, resizeMode: "contain" },
  railCount: { color: "#fff", fontSize: 11, fontWeight: "700" },
  leaderboardPanel: { position: "absolute", right: 66, bottom: 160, width: 200, backgroundColor: "rgba(15,15,26,0.92)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#333" },
  giftPicker: { position: "absolute", left: 10, right: 62, bottom: 158, backgroundColor: "rgba(13,9,25,0.96)", borderRadius: 22, padding: 11, flexDirection: "row", flexWrap: "wrap", gap: 8, maxHeight: 250, borderWidth: 1, borderColor: "rgba(255,255,255,.12)", shadowColor: "#000", shadowOpacity: .5, shadowRadius: 28, shadowOffset: { width: 0, height: 12 } },
  giftBtn: { width: "22%", backgroundColor: "rgba(255,255,255,0.055)", borderRadius: 15, padding: 7, alignItems: "center", gap: 2, borderWidth: 1, borderColor: "rgba(255,255,255,.06)" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  modalPanel: { width: "85%", maxHeight: "70%", backgroundColor: "#161625", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#333" },
  challengeRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 10, marginBottom: 8 },
  chatOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingBottom: 20, paddingTop: 10 },
  chatMsg: { color: "#eee", fontSize: 13, paddingVertical: 3 },
  systemMsg: { color: theme.gold, fontSize: 13, paddingVertical: 3, fontStyle: "italic" },
  composer: { flexDirection: "row", gap: 8, marginTop: 8 },
  input: { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, padding: 12, color: "#fff" },
  sendBtn: { backgroundColor: theme.pink, borderRadius: 20, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  sendText: { color: "#fff", fontWeight: "800" }
});
