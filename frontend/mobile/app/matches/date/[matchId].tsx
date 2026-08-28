import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Room, RoomEvent, Track } from "livekit-client";
import { VideoTrack } from "@livekit/react-native";
import AppShell from "../../../src/AppShell";
import { theme } from "../../../src/theme";
import { phase5Api } from "../../../src/phase5Api";
import { useTranslation } from "../../../src/i18n";

// Same verified LiveKit connection pattern as app/live/[id].tsx and
// app/video-match.tsx — both people in the match connect to the same
// deterministic room name the backend derives from the match id, and both
// can publish (unlike the host/viewer live-room model).
export default function VideoDate() {
  const { t } = useTranslation();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [myTrackRef, setMyTrackRef] = useState<any>(null);
  const [peerTrackRef, setPeerTrackRef] = useState<any>(null);
  const lkRoom = useRef<Room | null>(null);

  useEffect(() => {
    if (!matchId) return;
    let active = true;
    (async () => {
      try {
        const data = await phase5Api.videoDateToken(String(matchId));
        if (!active || !data?.token || !data?.url) return;

        const room = new Room({ adaptiveStream: true, dynacast: true });
        lkRoom.current = room;
        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Video) setPeerTrackRef({ participant, publication });
        });
        room.on(RoomEvent.TrackUnsubscribed, () => setPeerTrackRef(null));

        await room.connect(data.url, data.token);
        if (!active) { room.disconnect(); return; }
        setConnected(true);

        await room.localParticipant.setCameraEnabled(true);
        await room.localParticipant.setMicrophoneEnabled(true);
        setMyTrackRef({ participant: room.localParticipant, publication: null });
      } catch (e: any) {
        if (active) setError(e.message || t("videoDateScreen.errorStart"));
      }
    })();
    return () => {
      active = false;
      lkRoom.current?.disconnect();
      lkRoom.current = null;
    };
  }, [matchId]);

  return <AppShell>
    <View style={s.p}>
      <Pressable onPress={() => { lkRoom.current?.disconnect(); router.back(); }} style={s.closeBtn}><Text style={s.back}>✕</Text></Pressable>

      {error ? (
        <View style={s.center}>
          <Text style={s.err}>{error}</Text>
          <Pressable onPress={() => router.back()} style={s.button}><Text style={s.bt}>{t("videoDateScreen.backToMatches")}</Text></Pressable>
        </View>
      ) : (
        <View style={s.videoStage}>
          {peerTrackRef ? <VideoTrack trackRef={peerTrackRef} style={s.videoFill} /> : (
            <View style={s.center}>
              <ActivityIndicator color={theme.pink} />
              <Text style={s.muted}>{connected ? t("videoDateScreen.waitingOtherPerson") : t("videoDateScreen.connecting")}</Text>
            </View>
          )}
          {myTrackRef && <View style={s.selfPip}><VideoTrack trackRef={myTrackRef} style={s.videoFill} /></View>}
        </View>
      )}
    </View>
  </AppShell>;
}

const s = StyleSheet.create({
  p: { flex: 1, backgroundColor: "#000" },
  closeBtn: { position: "absolute", top: 50, left: 16, zIndex: 5, width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,.5)", alignItems: "center", justifyContent: "center" },
  back: { color: "#fff", fontSize: 16, fontWeight: "900" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  err: { color: "#ff8bad", textAlign: "center", paddingHorizontal: 30 },
  muted: { color: theme.muted, fontSize: 12 },
  button: { marginTop: 14, backgroundColor: theme.pink, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 26 },
  bt: { color: "#fff", fontWeight: "900" },
  videoStage: { flex: 1, position: "relative" },
  videoFill: { width: "100%", height: "100%" },
  selfPip: { position: "absolute", bottom: 30, right: 16, width: 100, height: 140, borderRadius: 14, overflow: "hidden", borderWidth: 2, borderColor: "rgba(255,255,255,.3)" }
});
