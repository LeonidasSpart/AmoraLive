import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { io, Socket } from "socket.io-client";
import { Room, RoomEvent, Track } from "livekit-client";
import { VideoTrack } from "@livekit/react-native";
import AppShell from "../src/AppShell";
import { theme } from "../src/theme";
import { API_URL, getValidAccessToken } from "../src/api/client";
import { useTranslation } from "../src/i18n";

// Same LiveKit client pattern verified in app/live/[id].tsx: Room/RoomEvent/
// Track are the stable, version-independent core API. VideoTrack rendering
// is the one part that needs confirming against a real device build.
//
// The socket flow here was broken before this fix in a way that failed
// silently: it connected with `auth: { token }` in the io() options, but
// the backend never reads socket.handshake.auth anywhere — it only sets
// socket.userId inside an explicit 'authenticate' event handler. Without
// that handshake, video_match:queue_join silently no-ops server-side
// (`if (!userId) return;`), so the screen would sit on "Finding someone…"
// forever with no error at all.

export default function VideoMatch() {
  const { t } = useTranslation();
  const socket = useRef<Socket | null>(null);
  const lkRoom = useRef<Room | null>(null);
  const [phase, setPhase] = useState("intro");
  const [peer, setPeer] = useState<any>();
  const [session, setSession] = useState<any>();
  const [deadline, setDeadline] = useState(0);
  const [result, setResult] = useState<any>();
  const [error, setError] = useState("");
  const [myTrackRef, setMyTrackRef] = useState<any>(null);
  const [peerTrackRef, setPeerTrackRef] = useState<any>(null);

  useEffect(() => () => {
    socket.current?.emit("video_match:queue_leave");
    socket.current?.disconnect();
    lkRoom.current?.disconnect();
  }, []);

  const connectVideo = async (liveKit: { token: string; url: string } | null) => {
    if (!liveKit) return; // LIVEKIT_* not configured server-side — preview-only mode
    try {
      const room = new Room({ adaptiveStream: true, dynacast: true });
      lkRoom.current = room;
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Video) setPeerTrackRef({ participant, publication });
      });
      room.on(RoomEvent.TrackUnsubscribed, () => setPeerTrackRef(null));
      await room.connect(liveKit.url, liveKit.token);
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
      setMyTrackRef({ participant: room.localParticipant, publication: null });
    } catch (e: any) {
      setError(e.message || t("videoMatchScreen.errorVideoConnect"));
    }
  };

  const disconnectVideo = () => {
    lkRoom.current?.disconnect();
    lkRoom.current = null;
    setMyTrackRef(null);
    setPeerTrackRef(null);
  };

  const start = async () => {
    setError("");
    setPhase("connecting");
    const token = await getValidAccessToken();
    if (!token) { router.replace("/auth"); return; }

    const s = io(API_URL, { transports: ["websocket", "polling"] });
    socket.current = s;

    s.on("connect", () => {
      s.emit("authenticate", token, (ack: any) => {
        if (!ack?.ok) { setError(t("videoMatchScreen.errorAuth")); setPhase("intro"); return; }
        setPhase("queued");
        s.emit("video_match:queue_join");
      });
    });
    s.on("connect_error", (e: any) => { setError(e.message || t("videoMatchScreen.errorConnect")); setPhase("intro"); });
    s.on("video_match:queued", () => setPhase("queued"));
    s.on("video_match:paired", (p: any) => {
      setPeer(p.peerPreview);
      setSession(p);
      setDeadline(p.deadline);
      setPhase("paired");
      connectVideo(p.liveKit);
    });
    s.on("video_match:decide_now", ({ deadline: d }: any) => { setDeadline(d); setPhase("deciding"); });
    s.on("video_match:result", (r: any) => { setResult(r); setPhase("result"); disconnectVideo(); });
    s.on("video_match:peer_left", () => { setPhase("result"); disconnectVideo(); });
    s.on("video_match:error", (e: any) => { setError(e.error || t("videoMatchScreen.errorMatchFailed")); setPhase("intro"); });
  };

  const decide = (d: "like" | "pass") => {
    if (session) socket.current?.emit("video_match:decide", { sessionId: session.sessionId, decision: d });
  };

  const secs = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setDeadline((x) => x), 250);
    return () => clearInterval(t);
  }, [deadline]);

  const showVideo = phase === "paired" || phase === "deciding";

  return <AppShell>
    <View style={s.p}>
      <Pressable onPress={() => router.back()}><Text style={s.back}>‹</Text></Pressable>
      <Text style={s.k}>{t("videoMatchScreen.kicker")}</Text>
      <Text style={s.t}>{t("videoMatchScreen.title")}</Text>

      {phase === "intro" && <View style={s.center}>
        <Text style={s.icon}>📹</Text>
        <Text style={s.title}>{t("videoMatchScreen.introTitle")}</Text>
        <Text style={s.muted}>{t("videoMatchScreen.introText")}</Text>
        <Pressable onPress={start} style={s.button}><Text style={s.bt}>{t("videoMatchScreen.startButton")}</Text></Pressable>
      </View>}

      {(phase === "connecting" || phase === "queued") && <View style={s.center}>
        <ActivityIndicator color={theme.pink} />
        <Text style={s.title}>{phase === "queued" ? t("videoMatchScreen.findingSomeone") : t("videoMatchScreen.connecting")}</Text>
        <Text style={s.muted}>{t("videoMatchScreen.stayHere")}</Text>
      </View>}

      {showVideo && <View style={s.videoStage}>
        {peerTrackRef ? <VideoTrack trackRef={peerTrackRef} style={s.videoFill} /> : <View style={s.videoPlaceholder}><Text style={{ fontSize: 40 }}>♡</Text><Text style={s.muted}>{t("videoMatchScreen.waitingForVideo")}</Text></View>}
        {myTrackRef && <View style={s.selfPip}><VideoTrack trackRef={myTrackRef} style={s.videoFill} /></View>}
        <View style={s.videoOverlay}>
          <Text style={s.title}>{peer?.age ? `${peer.age}` : t("videoMatchScreen.someoneWord")} {t("videoMatchScreen.isHereSuffix")}</Text>
          <Text style={s.muted}>{peer?.location || t("videoMatchScreen.readyToMeet")}{peer?.interests?.length ? ` · ${peer.interests.join(" · ")}` : ""}</Text>
          <Text style={s.timer}>{secs}s</Text>
        </View>
      </View>}

      {phase === "deciding" && <View style={s.decideBar}>
        <Text style={s.title}>{t("videoMatchScreen.howDidItFeel")}</Text>
        <Text style={s.timer}>{secs}s</Text>
        <View style={s.actions}>
          <Pressable onPress={() => decide("pass")} style={s.pass}><Text style={s.actionText}>{t("videoMatchScreen.pass")}</Text></Pressable>
          <Pressable onPress={() => decide("like")} style={s.like}><Text style={s.actionText}>{t("videoMatchScreen.like")}</Text></Pressable>
        </View>
      </View>}

      {phase === "result" && <View style={s.center}>
        <Text style={s.icon}>{result?.matched ? "💕" : "♡"}</Text>
        <Text style={s.title}>{result?.matched ? t("videoMatchScreen.matchExclaim") : t("videoMatchScreen.noMatchThisTime")}</Text>
        <Text style={s.muted}>{result?.matched ? t("videoMatchScreen.matchedBody") : t("videoMatchScreen.keepExploring")}</Text>
        {result?.matched && <Pressable onPress={() => router.push("/matches")} style={s.button}><Text style={s.bt}>{t("videoMatchScreen.openMatches")}</Text></Pressable>}
        <Pressable onPress={() => { socket.current?.disconnect(); setResult(null); setSession(null); setPhase("intro"); }} style={s.secondary}><Text style={s.bt}>{t("videoMatchScreen.tryAgain")}</Text></Pressable>
      </View>}

      {!!error && <Text style={s.err}>{error}</Text>}
    </View>
  </AppShell>;
}

const s = StyleSheet.create({
  p: { flex: 1, backgroundColor: theme.bg, padding: 16 },
  back: { color: "#fff", fontSize: 34 },
  k: { color: theme.pinkSoft, fontSize: 8, fontWeight: "900", letterSpacing: 2, marginTop: 8 },
  t: { color: "#fff", fontSize: 26, fontWeight: "900", marginTop: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  icon: { fontSize: 50 },
  title: { color: "#fff", fontSize: 18, fontWeight: "900", textAlign: "center" },
  muted: { color: theme.muted, fontSize: 11, textAlign: "center", marginTop: 4, maxWidth: 280 },
  button: { marginTop: 18, backgroundColor: theme.pink, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 30 },
  secondary: { marginTop: 10, backgroundColor: "rgba(255,255,255,.06)", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 26 },
  bt: { color: "#fff", fontWeight: "900", fontSize: 13, textAlign: "center" },
  err: { color: "#ff8bad", textAlign: "center", marginTop: 14, fontSize: 11 },
  videoStage: { flex: 1, marginTop: 16, borderRadius: 24, overflow: "hidden", backgroundColor: "#11101b", position: "relative" },
  videoFill: { width: "100%", height: "100%" },
  videoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  selfPip: { position: "absolute", top: 14, right: 14, width: 90, height: 130, borderRadius: 14, overflow: "hidden", borderWidth: 2, borderColor: "rgba(255,255,255,.3)" },
  videoOverlay: { position: "absolute", left: 16, right: 16, bottom: 16, padding: 14, borderRadius: 16, backgroundColor: "rgba(0,0,0,.5)" },
  timer: { color: theme.gold, fontWeight: "900", fontSize: 16, marginTop: 6, textAlign: "center" },
  decideBar: { marginTop: 14, alignItems: "center" },
  actions: { flexDirection: "row", gap: 14, marginTop: 12 },
  pass: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 14, backgroundColor: "rgba(255,255,255,.08)" },
  like: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 14, backgroundColor: theme.pink },
  actionText: { color: "#fff", fontWeight: "900" }
});
