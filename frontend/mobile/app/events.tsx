import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { theme } from "../src/theme";
import { api, API_URL } from "../src/api/client";

type EventScore = {
  user_id: string;
  event_id: string;
  team_side: string;
  total_gifts_sent: number;
  total_gifts_received: number;
  user: { username: string; display_name: string };
};

function formatTimeLeft(seconds: number) {
  if (seconds <= 0) return "Ended";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export default function Events() {
  const [event, setEvent] = useState<any>(null);
  const [myTeam, setMyTeam] = useState<string | null>(null);
  const [scores, setScores] = useState<EventScore[]>([]);
  const [teamTotals, setTeamTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const socketRef = useRef<any>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.activeEvent();
      setEvent(data);
      setMyTeam(data.myTeam);
      setTimeLeft(data.timeLeft);
      const board = await api.eventLeaderboard(data.id);
      setScores(board.scores || []);
      setTeamTotals(board.teamTotals || {});
      setError("");
    } catch (e: any) {
      if (e.status === 404) {
        setEvent(null);
      } else {
        setError(e.message || "Unable to load the current event.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!event) return;
    let active = true;
    (async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) return;
      const { io } = await import("socket.io-client");
      if (!active) return;
      const socket = io(API_URL, { transports: ["websocket"] });
      socketRef.current = socket;
      socket.on("connect", () => {
        socket.emit("authenticate", token, (ack: any) => {
          if (ack?.ok) socket.emit("join-event", event.id);
        });
      });
      socket.on("leaderboard-update", (payload: any) => {
        if (!active) return;
        setScores(payload.scores || []);
        setTeamTotals(payload.teamTotals || {});
      });
    })();
    return () => {
      active = false;
      socketRef.current?.disconnect();
    };
  }, [event?.id]);

  const joinTeam = async (team: string) => {
    if (!event) return;
    setJoining(true);
    setError("");
    try {
      await api.joinEventTeam(event.id, team);
      setMyTeam(team);
    } catch (e: any) {
      setError(e.message || "Unable to join this team.");
    } finally {
      setJoining(false);
    }
  };

  const teamA = event?.teams?.[0];
  const teamB = event?.teams?.[1];
  const totalA = teamTotals[teamA] || 0;
  const totalB = teamTotals[teamB] || 0;
  const totalAll = totalA + totalB || 1;

  if (loading) {
    return (
      <View style={[s.page, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={theme.pink} />
      </View>
    );
  }

  return (
    <View style={s.page}>
      <Pressable onPress={() => router.back()}>
        <Text style={s.back}>‹</Text>
      </Pressable>

      {!event ? (
        <View style={[s.page, { alignItems: "center", justifyContent: "center", padding: 0 }]}>
          <Text style={{ fontSize: 48 }}>🏆</Text>
          <Text style={s.muted}>No live event right now. Check back soon!</Text>
        </View>
      ) : (
        <FlatList
          data={scores.slice(0, 30)}
          keyExtractor={(item) => `${item.user_id}-${item.event_id}`}
          ListHeaderComponent={
            <View>
              <Text style={s.title}>{event.title}</Text>
              {!!event.description && <Text style={s.description}>{event.description}</Text>}
              <View style={s.timerBadge}>
                <Text style={s.timerText}>{formatTimeLeft(timeLeft)}</Text>
              </View>

              {!!error && <Text style={s.error}>{error}</Text>}

              {!myTeam ? (
                <View style={{ marginBottom: 20 }}>
                  <Text style={s.muted}>Pick a side to join the battle:</Text>
                  <View style={s.teamRow}>
                    {(event.teams || []).map((t: string) => (
                      <Pressable key={t} style={s.teamBtn} onPress={() => joinTeam(t)} disabled={joining}>
                        <Text style={s.teamBtnText}>{t}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={s.myTeamBanner}>
                  <Text style={s.myTeamText}>You're on Team <Text style={{ fontWeight: "900" }}>{myTeam}</Text> — send gifts to boost your score!</Text>
                </View>
              )}

              <View style={s.scoreBar}>
                <View style={[s.scoreBarFill, { width: `${(totalA / totalAll) * 100}%` }]} />
              </View>
              <View style={s.scoreLabels}>
                <Text style={s.scoreLabelText}>{teamA}: {totalA}</Text>
                <Text style={s.scoreLabelText}>{teamB}: {totalB}</Text>
              </View>

              <Text style={s.sectionTitle}>Top contributors</Text>
              {scores.length === 0 && <Text style={s.muted}>No one has scored yet — be the first!</Text>}
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={s.listItem}>
              <Text style={s.rank}>#{index + 1}</Text>
              <Text style={{ flex: 1, color: "#eee" }}>{item.user?.display_name || item.user?.username}</Text>
              <Text style={s.teamTag}>{item.team_side}</Text>
              <Text style={s.points}>{item.total_gifts_sent + item.total_gifts_received} pts</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#050407", padding: 20 },
  back: { fontSize: 42, color: "#fff" },
  title: { fontSize: 26, fontWeight: "900", color: "#fff", marginTop: 8 },
  description: { color: theme.muted, marginTop: 6, fontSize: 13 },
  timerBadge: { alignSelf: "flex-start", backgroundColor: "#2a2a3e", paddingHorizontal: 14, paddingVertical: 4, borderRadius: 16, marginVertical: 12 },
  timerText: { color: theme.gold, fontWeight: "800", fontSize: 12 },
  error: { color: "#ff6b6b", marginBottom: 12 },
  muted: { color: theme.muted, textAlign: "center", marginTop: 8 },
  teamRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  teamBtn: { flex: 1, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.pink, borderRadius: 12, padding: 14, alignItems: "center" },
  teamBtnText: { color: theme.pink, fontWeight: "900" },
  myTeamBanner: { backgroundColor: "#1e1526", borderWidth: 1, borderColor: theme.pink, borderRadius: 12, padding: 12, marginBottom: 20 },
  myTeamText: { color: "#eee", fontSize: 13 },
  scoreBar: { height: 10, backgroundColor: "#2a2a3e", borderRadius: 6, overflow: "hidden" },
  scoreBarFill: { height: "100%", backgroundColor: theme.pink },
  scoreLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  scoreLabelText: { color: theme.muted, fontSize: 12 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "800", marginTop: 24, marginBottom: 8 },
  listItem: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 10, marginBottom: 6 },
  rank: { color: theme.gold, fontWeight: "900", width: 30 },
  teamTag: { color: theme.muted, fontSize: 11 },
  points: { color: theme.pink, fontWeight: "900" }
});
