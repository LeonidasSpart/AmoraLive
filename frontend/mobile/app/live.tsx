import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import { theme } from "../src/theme";
import { api } from "../src/api/client";

type LiveRoom = {
  id: string;
  title: string;
  category: string;
  viewer_count: number;
  thumbnail_url: string | null;
  host: { display_name: string; username: string; profile_photo: string | null };
};

export default function Live() {
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.liveRooms();
      setRooms(Array.isArray(data) ? data : []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Unable to load live rooms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={s.page}>
      <View style={s.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Text style={s.back}>‹</Text>
        </Pressable>
        <Text style={s.title}>Live</Text>
      </View>

      <Pressable style={s.goLiveBtn} onPress={() => router.push("/live/start")}>
        <Text style={s.goLiveText}>🔴 Go Live</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator color={theme.pink} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={s.muted}>{error}</Text>
      ) : rooms.length === 0 ? (
        <View style={s.banner}>
          <Text style={s.live}>● LIVE</Text>
          <Text style={s.bannerTitle}>No one's live right now</Text>
          <Text style={s.muted}>Be the first — tap Go Live above.</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <Pressable style={s.card} onPress={() => router.push(`/live/${item.id}`)}>
              <View style={s.thumb}>
                {item.thumbnail_url ? (
                  <Image source={{ uri: item.thumbnail_url }} style={s.thumbImg} />
                ) : (
                  <Text style={{ fontSize: 30 }}>📺</Text>
                )}
                <View style={s.liveBadge}>
                  <Text style={s.liveBadgeText}>LIVE</Text>
                </View>
                <View style={s.viewerBadge}>
                  <Text style={s.viewerBadgeText}>👁 {item.viewer_count}</Text>
                </View>
              </View>
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.cardHost} numberOfLines={1}>{item.host?.display_name || item.host?.username}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#050407", padding: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  back: { fontSize: 42, color: "#fff" },
  title: { fontSize: 30, fontWeight: "900", color: "#fff" },
  goLiveBtn: { backgroundColor: "#ff3355", borderRadius: 16, padding: 16, alignItems: "center", marginVertical: 16 },
  goLiveText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  muted: { color: theme.muted, marginTop: 8, textAlign: "center" },
  banner: { flex: 1, backgroundColor: "#201735", borderRadius: 24, padding: 24, alignItems: "center", justifyContent: "center" },
  live: { color: "#ff4d70", fontWeight: "900" },
  bannerTitle: { color: "#fff", fontSize: 20, fontWeight: "900", marginTop: 8 },
  card: { flex: 1, backgroundColor: theme.surface, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: theme.border },
  thumb: { aspectRatio: 1, backgroundColor: "#1a1330", alignItems: "center", justifyContent: "center", position: "relative" },
  thumbImg: { width: "100%", height: "100%" },
  liveBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "#ff3355", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveBadgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  viewerBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  viewerBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  cardTitle: { color: "#fff", fontWeight: "800", padding: 8, paddingBottom: 0 },
  cardHost: { color: theme.muted, fontSize: 12, padding: 8, paddingTop: 2 }
});
