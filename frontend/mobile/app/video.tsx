import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Room, RoomEvent, Track, RemoteTrack, LocalTrack } from "livekit-client";
import { VideoView } from "@livekit/react-native";
import { theme } from "../src/theme";
import { API_URL } from "../src/api/client";

type Phase = "connecting" | "queued" | "paired" | "deciding" | "result";
type PeerPreview = { age: number | null; location: string | null; interests: string[] };
type ResultPayload = { matched: boolean; matchId?: string; peer?: { id: string; display_name?: string; username?: string } };

export default function VideoMatch() {
  const [phase, setPhase] = useState<Phase>("connecting");
  const [error, setError] = useState("");
  const [peerPreview, setPeerPreview] = useState<PeerPreview | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [myDecision, setMyDecision] = useState<"like" | "pass" | null>(null);
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [localTrack, setLocalTrack] = useState<LocalTrack | null>(null);
  const [remoteTrack, setRemoteTrack] = useState<RemoteTrack | null>(null);
  const [videoAvailable, setVideoAvailable] = useState(true);

  const socketRef = useRef<any>(null);
  const roomRef = useRef<Room | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
  };

  const startCountdown = (deadline: number) => {
    clearCountdown();
    const tick = () => setRemainingMs(Math.max(0, deadline - Date.now()));
    tick();
    countdownRef.current = setInterval(tick, 250);
  };

  const teardownRoom = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setLocalTrack(null);
    setRemoteTrack(null);
  }, []);

  const connectLiveKit = useCallback(async (liveKit: { url: string; token: string } | null) => {
    if (!liveKit) {
      setVideoAvailable(false);
      return;
    }
    try {
      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;
      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Video) setRemoteTrack(track as RemoteTrack);
      });
      room.on(RoomEvent.TrackUnsubscribed, () => setRemoteTrack(null));
      await room.connect(liveKit.url, liveKit.token);
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
      const videoPub = Array.from(room.localParticipant.videoTrackPublications.values())[0];
      if (videoPub?.track) setLocalTrack(videoPub.track as LocalTrack);
    } catch (e) {
      console.error("LiveKit connect failed:", e);
      setVideoAvailable(false);
    }
  }, []);

  const joinQueue = useCallback(() => {
    setError("");
    setResult(null);
    setMyDecision(null);
    setPeerPreview(null);
    teardownRoom();
    setPhase("queued");
    socketRef.current?.emit("video_match:queue_join");
  }, [teardownRoom]);

  useEffect(() => {
    let active = true;
    let socket: any;

    (async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        router.replace("/auth");
        return;
      }
      const { io } = await import("socket.io-client");
      if (!active) return;
      socket = io(API_URL, { transports: ["websocket"] });
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("authenticate", token, (ack: any) => {
          if (!active) return;
          if (!ack?.ok) {
            setError("Your session expired. Please sign in again.");
            return;
          }
          joinQueue();
        });
      });

      socket.on("connect_error", () => active && setError("Unable to connect. Check your connection and try again."));
      socket.on("video_match:queued", () => active && setPhase("queued"));

      socket.on("video_match:paired", async (payload: any) => {
        if (!active) return;
        sessionIdRef.current = payload.sessionId;
        setPeerPreview(payload.peerPreview);
        setPhase("paired");
        startCountdown(payload.deadline);
        await connectLiveKit(payload.liveKit);
      });

      socket.on("video_match:decide_now", (payload: any) => {
        if (!active) return;
        setPhase("deciding");
        startCountdown(payload.deadline);
      });

      socket.on("video_match:peer_left", () => active && setError("The other person left the video match."));

      socket.on("video_match:result", async (payload: ResultPayload) => {
        if (!active) return;
        clearCountdown();
        await teardownRoom();
        setResult(payload);
        setPhase("result");
      });

      socket.on("video_match:error", (payload: any) => active && setError(payload?.error || "Video match is unavailable right now."));
    })();

    return () => {
      active = false;
      clearCountdown();
      teardownRoom();
      socket?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decide = (decision: "like" | "pass") => {
    if (myDecision) return;
    setMyDecision(decision);
    socketRef.current?.emit("video_match:decide", { sessionId: sessionIdRef.current, decision });
  };

  const seconds = Math.ceil(remainingMs / 1000);

  return (
    <View style={s.page}>
      <View style={s.headerRow}>
        <Pressable onPress={() => router.back()}><Text style={s.back}>‹</Text></Pressable>
        <Text style={s.title}>Video Match</Text>
        {(phase === "paired" || phase === "deciding") && (
          <View style={[s.timerBadge, seconds <= 3 && { backgroundColor: "#ff4444" }]}>
            <Text style={s.timerText}>{seconds}s</Text>
          </View>
        )}
      </View>

      {!!error && <Text style={s.error}>{error}</Text>}

      {phase === "connecting" && (
        <View style={s.stage}><ActivityIndicator color={theme.pink} /></View>
      )}

      {phase === "queued" && (
        <View style={s.stage}>
          <ActivityIndicator color={theme.pink} />
          <Text style={s.wait}>Finding your next connection…</Text>
          <Text style={s.sub}>Both users must be 18+.</Text>
        </View>
      )}

      {(phase === "paired" || phase === "deciding") && (
        <View style={s.videoWrap}>
          <View style={s.remoteBox}>
            {videoAvailable && remoteTrack ? (
              <VideoView style={s.videoFill} videoTrack={remoteTrack} objectFit="cover" />
            ) : (
              <View style={s.fallback}>
                <Text style={{ fontSize: 40 }}>🎥</Text>
                <Text style={s.fallbackText}>
                  {peerPreview?.age ? `${peerPreview.age} · ` : ""}{peerPreview?.location || "Someone new"}
                </Text>
                {!!peerPreview?.interests?.length && (
                  <Text style={s.fallbackSub}>{peerPreview.interests.join(" · ")}</Text>
                )}
              </View>
            )}
          </View>
          {videoAvailable && localTrack && (
            <View style={s.localBox}>
              <VideoView style={s.videoFill} videoTrack={localTrack} objectFit="cover" mirror />
            </View>
          )}

          {phase === "deciding" ? (
            <View style={s.actions}>
              <Pressable style={s.skip} onPress={() => decide("pass")} disabled={!!myDecision}>
                <Text style={{ fontSize: 26 }}>✕</Text>
              </Pressable>
              <Pressable style={s.match} onPress={() => decide("like")} disabled={!!myDecision}>
                <Text style={{ fontSize: 26 }}>❤️</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={s.sub}>Say hi! You'll decide whether to match once time's up.</Text>
          )}
          {phase === "deciding" && myDecision && <Text style={s.sub}>Waiting for the other person…</Text>}
        </View>
      )}

      {phase === "result" && (
        <View style={s.stage}>
          {result?.matched ? (
            <>
              <Text style={{ fontSize: 48 }}>🎉</Text>
              <Text style={s.wait}>It's a match!</Text>
              <Text style={s.sub}>{result.peer?.display_name || result.peer?.username}</Text>
              <Pressable style={s.primaryBtn} onPress={() => router.push(`/chat/${result.peer?.id}`)}>
                <Text style={s.primaryBtnText}>Start chatting</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={s.sub}>No match this time.</Text>
              <Pressable style={s.primaryBtn} onPress={joinQueue}>
                <Text style={s.primaryBtnText}>Find another</Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#050407", padding: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { fontSize: 42, color: "#fff" },
  title: { fontSize: 22, fontWeight: "900", color: "#fff" },
  timerBadge: { backgroundColor: "#2a2a3e", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  timerText: { color: "#fff", fontWeight: "800" },
  error: { color: "#ff6b6b", textAlign: "center", marginTop: 8 },
  stage: { flex: 1, borderRadius: 24, backgroundColor: "#171021", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.border, gap: 8 },
  wait: { color: "#fff", fontSize: 20, fontWeight: "800" },
  sub: { color: theme.muted, marginTop: 4, textAlign: "center" },
  videoWrap: { flex: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  remoteBox: { width: "100%", flex: 1, borderRadius: 20, overflow: "hidden", backgroundColor: "#000", borderWidth: 1, borderColor: theme.border },
  localBox: { position: "absolute", width: 100, height: 140, borderRadius: 14, overflow: "hidden", right: 16, bottom: 100, borderWidth: 2, borderColor: "#fff" },
  videoFill: { width: "100%", height: "100%" },
  fallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  fallbackText: { color: "#fff", marginTop: 8 },
  fallbackSub: { color: theme.muted, marginTop: 4, fontSize: 12 },
  actions: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 20, width: "100%" },
  skip: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  match: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.pink, alignItems: "center", justifyContent: "center" },
  primaryBtn: { backgroundColor: theme.pink, padding: 14, paddingHorizontal: 32, borderRadius: 30, marginTop: 12 },
  primaryBtnText: { color: "#fff", fontWeight: "800" }
});
