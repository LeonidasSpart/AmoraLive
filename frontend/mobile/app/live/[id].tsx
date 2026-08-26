import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Room, RoomEvent, Track } from "livekit-client";
import { VideoTrack } from "@livekit/react-native";
import { io, Socket } from "socket.io-client";
import AppShell from "../../src/AppShell";
import { theme } from "../../src/theme";
import { api } from "../../src/phase2Api";
import { API_URL, getValidAccessToken } from "../../src/api/client";

// NOTE: the LiveKit *client* calls here (Room/RoomEvent/Track, connect,
// track-subscription events) are the same stable, version-independent API
// already used correctly on the web app's live room this session. The
// <VideoTrack trackRef={...}/> rendering component is the one piece that
// can't be verified without a real device/build — if the prop shape has
// drifted for the installed @livekit/react-native version, that's the
// first thing to check against an actual build log.

export default function LiveRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [giftOpen, setGiftOpen] = useState(false);
  const [gifts, setGifts] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [remoteTrackRef, setRemoteTrackRef] = useState<any>(null);
  const [opponentTrackRef, setOpponentTrackRef] = useState<any>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [isHost, setIsHost] = useState(false);

  const [battle, setBattle] = useState<any>(null); // { battleId, mySide, endsAt, opponent, scoreA, scoreB }
  const [battleTimeLeft, setBattleTimeLeft] = useState(0);
  const [battleResult, setBattleResult] = useState("");
  const [incomingInvite, setIncomingInvite] = useState<any>(null);

  const lkRoom = useRef<Room | null>(null);
  const opponentRoom = useRef<Room | null>(null);
  const socket = useRef<Socket | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [r, g] = await Promise.all([api.liveRoom(String(id)), api.gifts()]);
      setRoom(r);
      setGifts(g || []);
      setViewerCount(r?.viewer_count || 0);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ---------- Real-time signaling (viewer count, battle events) ----------
  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      const token = await getValidAccessToken();
      if (!token || !active) return;
      const s = io(API_URL, { transports: ["websocket", "polling"] });
      socket.current = s;

      s.on("connect", () => {
        s.emit("authenticate", token, (ack: any) => {
          if (!ack?.ok) { setVideoError((prev) => prev || "Realtime connection failed to authenticate."); return; }
          s.emit("join-live", String(id));
        });
      });
      s.on("viewer-count", (data: any) => setViewerCount(data?.count ?? 0));

      s.on("battle:invite", (payload: any) => setIncomingInvite(payload));
      s.on("battle:invite_expired", () => setIncomingInvite(null));
      s.on("battle:invite_declined", () => setVideoError("Your battle invite was declined."));
      s.on("battle:invite_cancelled", () => setIncomingInvite(null));
      s.on("battle:started", async (payload: any) => {
        setIncomingInvite(null);
        setBattle({ battleId: payload.battleId, mySide: payload.mySide, endsAt: payload.endsAt, opponent: payload.opponent, scoreA: payload.scoreA || 0, scoreB: payload.scoreB || 0 });
        connectOpponentFeed(payload.opponent?.roomId);
      });
      s.on("battle:score", (payload: any) => {
        setBattle((prev: any) => (prev && prev.battleId === payload.battleId ? { ...prev, scoreA: payload.scoreA, scoreB: payload.scoreB } : prev));
      });
      s.on("battle:ended", (payload: any) => {
        setBattle((prev: any) => {
          if (!prev || prev.battleId !== payload.battleId) return prev;
          const myScore = prev.mySide === "a" ? payload.scoreA : payload.scoreB;
          const oppScore = prev.mySide === "a" ? payload.scoreB : payload.scoreA;
          setBattleResult(myScore === oppScore ? "🤝 It's a draw!" : myScore > oppScore ? "🏆 You won the battle!" : "😢 You lost the battle.");
          setTimeout(() => setBattleResult(""), 4000);
          return null;
        });
        opponentRoom.current?.disconnect();
        opponentRoom.current = null;
        setOpponentTrackRef(null);
      });

      // In case this viewer joins a room that's already mid-battle.
      fetch(`${API_URL}/live/${id}/battle`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((b) => {
          if (!b || !active) return;
          setBattle({ battleId: b.battleId, mySide: b.mySide, endsAt: b.endsAt, opponent: b.opponent, scoreA: b.scoreA, scoreB: b.scoreB });
          connectOpponentFeed(b.opponent?.roomId);
        })
        .catch(() => {});
    })();
    return () => { active = false; socket.current?.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---------- Battle countdown ----------
  useEffect(() => {
    if (!battle?.endsAt) { setBattleTimeLeft(0); return; }
    const tick = () => setBattleTimeLeft(Math.max(0, Math.ceil((battle.endsAt - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [battle?.endsAt, battle?.battleId]);

  // ---------- Real LiveKit video connection ----------
  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const data = await api.liveToken(String(id));
        if (!active || !data?.token || !data?.url) return;
        setIsHost(data.role === "host");

        const lk = new Room({ adaptiveStream: true, dynacast: true });
        lkRoom.current = lk;

        lk.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Video) {
            setRemoteTrackRef({ participant, publication });
          }
        });
        lk.on(RoomEvent.TrackUnsubscribed, () => setRemoteTrackRef(null));
        lk.on(RoomEvent.Disconnected, () => setConnected(false));

        await lk.connect(data.url, data.token);
        if (!active) { lk.disconnect(); return; }
        setConnected(true);

        if (data.role === "host") {
          await lk.localParticipant.setCameraEnabled(true);
          await lk.localParticipant.setMicrophoneEnabled(true);
          setRemoteTrackRef({ participant: lk.localParticipant, publication: null });
        }
      } catch (e: any) {
        if (active) setVideoError(e.message || "Unable to connect to the live stream.");
      }
    })();
    return () => {
      active = false;
      lkRoom.current?.disconnect();
      lkRoom.current = null;
    };
  }, [id]);

  const connectOpponentFeed = async (opponentRoomId: string) => {
    if (!opponentRoomId) return;
    try {
      const data = await api.liveToken(String(opponentRoomId));
      if (!data?.token || !data?.url) return;
      const room2 = new Room({ adaptiveStream: true, dynacast: true });
      opponentRoom.current = room2;
      room2.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Video) setOpponentTrackRef({ participant, publication });
      });
      await room2.connect(data.url, data.token);
    } catch {}
  };

  const respondToInvite = async (accept: boolean) => {
    if (!incomingInvite || !id) return;
    try {
      await fetch(`${API_URL}/live/${id}/battle/${accept ? "accept" : "decline"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getValidAccessToken()}` }
      });
    } catch {}
    setIncomingInvite(null);
  };

  const endBattle = async () => {
    if (!id) return;
    try { await api.battleEnd(String(id)); } catch {}
  };

  const sendGift = async (gift: any) => {
    try {
      await api.sendGift({ roomId: String(id), giftId: gift.id, quantity: 1 });
      setGiftOpen(false);
    } catch {}
  };

  if (loading) return <AppShell><View style={s.center}><ActivityIndicator color={theme.pink} /></View></AppShell>;

  const mine = battle ? (battle.mySide === "a" ? battle.scoreA : battle.scoreB) : 0;
  const theirs = battle ? (battle.mySide === "a" ? battle.scoreB : battle.scoreA) : 0;
  const total = mine + theirs || 1;

  return <AppShell>
    <ScrollView style={s.page} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={s.top}><Pressable onPress={() => router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.topTitle}>LIVE</Text><Text style={s.viewer}>👁 {viewerCount}</Text></View>

      <View style={[s.stage, battle && s.stageBattle]}>
        <View style={battle ? s.halfStage : s.fullStage}>
          {remoteTrackRef ? (
            <VideoTrack trackRef={remoteTrackRef} style={s.videoFill} />
          ) : room?.thumbnail_url ? (
            <Image source={{ uri: room.thumbnail_url }} style={s.thumb} />
          ) : (
            <View style={s.placeholder}><Text style={{ fontSize: 50 }}>🔴</Text><Text style={s.liveText}>{videoError ? "Video unavailable" : connected ? "Connecting video…" : "LIVE"}</Text></View>
          )}
        </View>
        {battle && (
          <View style={s.halfStage}>
            {opponentTrackRef ? <VideoTrack trackRef={opponentTrackRef} style={s.videoFill} /> : <View style={s.placeholder}><Text style={{ fontSize: 30 }}>⚔️</Text></View>}
            <Text style={s.opponentLabel}>{battle.opponent?.host?.display_name || battle.opponent?.host?.username}</Text>
          </View>
        )}
        {!battle && <View style={s.overlay}><Text style={s.roomTitle}>{room?.title || "Live room"}</Text><Text style={s.host}>{room?.host?.display_name || room?.host?.username || "Creator"}</Text></View>}

        {battle && (
          <View style={s.battleBar}>
            <View style={s.battleScoreRow}>
              <Text style={s.battleScore}>🔥 {mine}</Text>
              <Text style={s.battleTimer}>{Math.floor(battleTimeLeft / 60)}:{String(battleTimeLeft % 60).padStart(2, "0")}</Text>
              <Text style={s.battleScore}>{theirs} 🔥</Text>
            </View>
            <View style={s.battleFillTrack}><View style={[s.battleFill, { width: `${Math.round((mine / total) * 100)}%` }]} /></View>
          </View>
        )}
      </View>

      {!!battleResult && <View style={s.resultBanner}><Text style={s.resultText}>{battleResult}</Text></View>}
      {!!videoError && <Text style={s.errText}>{videoError}</Text>}

      {incomingInvite && (
        <View style={s.inviteBanner}>
          <Text style={s.inviteText}>⚔️ {incomingInvite.fromHost?.display_name || "A streamer"} wants to battle!</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <Pressable onPress={() => respondToInvite(true)} style={s.acceptBtn}><Text style={s.inviteBtnText}>Accept</Text></Pressable>
            <Pressable onPress={() => respondToInvite(false)} style={s.declineBtn}><Text style={s.inviteBtnText}>Decline</Text></Pressable>
          </View>
        </View>
      )}

      <View style={s.actions}>
        {isHost && battle && <Pressable style={s.action} onPress={endBattle}><Text style={s.actionIcon}>🏳️</Text><Text style={s.actionText}>End Battle</Text></Pressable>}
        <Pressable style={s.action} onPress={() => setGiftOpen(!giftOpen)}><Text style={s.actionIcon}>🎁</Text><Text style={s.actionText}>Gift</Text></Pressable>
        <Pressable style={s.action} onPress={() => router.push({ pathname: "/chat/[userId]", params: { userId: String(room?.host?.id) } })}><Text style={s.actionIcon}>💬</Text><Text style={s.actionText}>Message</Text></Pressable>
      </View>

      {giftOpen && <View style={s.giftPanel}>{gifts.slice(0, 8).map((g) => <Pressable key={g.id} style={s.gift} onPress={() => sendGift(g)}><Text style={{ fontSize: 25 }}>{g.emoji || "🎁"}</Text><Text style={s.giftName}>{g.name}</Text><Text style={s.coin}>🪙 {g.price_coins || g.coins || 0}</Text></Pressable>)}</View>}

      <View style={s.info}><Text style={s.section}>About this live</Text><Text style={s.muted}>#{room?.category || "General"} · {viewerCount} watching</Text></View>
    </ScrollView>
  </AppShell>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.bg, padding: 12 }, center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.bg },
  top: { height: 44, flexDirection: "row", alignItems: "center" }, back: { color: "#fff", fontSize: 38 }, topTitle: { color: "#ff6b6b", fontSize: 11, fontWeight: "900", letterSpacing: 2, flex: 1, marginLeft: 8 }, viewer: { color: "#fff", fontSize: 10 },
  stage: { height: 430, borderRadius: 22, overflow: "hidden", backgroundColor: "#11101b", position: "relative" }, stageBattle: { flexDirection: "row" },
  fullStage: { flex: 1, position: "relative" }, halfStage: { flex: 1, position: "relative", borderLeftWidth: 1, borderLeftColor: "#000" },
  videoFill: { width: "100%", height: "100%" },
  thumb: { width: "100%", height: "100%", resizeMode: "cover" }, placeholder: { flex: 1, alignItems: "center", justifyContent: "center" }, liveText: { color: "#ff6b6b", fontSize: 11, fontWeight: "900", marginTop: 7, textAlign: "center", paddingHorizontal: 10 },
  overlay: { position: "absolute", left: 14, right: 14, bottom: 14, padding: 12, borderRadius: 13, backgroundColor: "rgba(0,0,0,.45)" }, roomTitle: { color: "#fff", fontSize: 17, fontWeight: "900" }, host: { color: "#ddd", fontSize: 10, marginTop: 3 },
  opponentLabel: { position: "absolute", top: 8, left: 8, color: "#fff", fontSize: 9, fontWeight: "900", backgroundColor: "rgba(0,0,0,.5)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  battleBar: { position: "absolute", top: 8, left: 8, right: 8 }, battleScoreRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, battleScore: { color: "#fff", fontWeight: "900", fontSize: 13 }, battleTimer: { color: theme.gold, fontWeight: "900", fontSize: 12 },
  battleFillTrack: { height: 6, backgroundColor: "rgba(255,255,255,.15)", borderRadius: 3, marginTop: 4, overflow: "hidden" }, battleFill: { height: "100%", backgroundColor: theme.pink },
  resultBanner: { marginTop: 8, padding: 12, borderRadius: 14, backgroundColor: "rgba(255,216,107,.1)", alignItems: "center" }, resultText: { color: theme.gold, fontWeight: "900" },
  errText: { color: "#ff8bad", textAlign: "center", marginTop: 8, fontSize: 11 },
  inviteBanner: { marginTop: 8, padding: 14, borderRadius: 16, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }, inviteText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  acceptBtn: { flex: 1, backgroundColor: theme.pink, borderRadius: 10, paddingVertical: 9, alignItems: "center" }, declineBtn: { flex: 1, backgroundColor: "rgba(255,255,255,.08)", borderRadius: 10, paddingVertical: 9, alignItems: "center" }, inviteBtnText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 }, action: { flex: 1, backgroundColor: theme.surface, borderRadius: 13, paddingVertical: 10, alignItems: "center" }, actionIcon: { fontSize: 18 }, actionText: { color: "#fff", fontSize: 9, fontWeight: "900", marginTop: 3 },
  giftPanel: { flexDirection: "row", flexWrap: "wrap", gap: 7, backgroundColor: theme.surface, borderRadius: 16, padding: 10, marginTop: 8 }, gift: { width: "23%", alignItems: "center", paddingVertical: 8 }, giftName: { color: "#fff", fontSize: 8, fontWeight: "800", marginTop: 3, textAlign: "center" }, coin: { color: theme.gold, fontSize: 7, marginTop: 2 },
  info: { backgroundColor: theme.surface, borderRadius: 17, padding: 15, marginTop: 10 }, section: { color: "#fff", fontSize: 15, fontWeight: "900" }, muted: { color: theme.muted, fontSize: 9, lineHeight: 15, marginTop: 4 }
});
