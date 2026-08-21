import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { theme } from "../src/theme";
import { api } from "../src/api/client";

type Conversation = {
  id: string;
  username: string;
  display_name: string;
  profile_photo: string | null;
  online_status: string;
  last_message: string;
  last_message_time: string;
  last_sender_id: string;
  unread_count: number | string;
};

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.conversations();
      setConversations(Array.isArray(data) ? data : []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Unable to load your messages.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <View style={s.page}>
      <Pressable onPress={() => router.back()}>
        <Text style={s.back}>‹</Text>
      </Pressable>
      <Text style={s.title}>Messages</Text>

      {loading ? (
        <ActivityIndicator color={theme.pink} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={s.muted}>{error}</Text>
      ) : conversations.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.big}>♡</Text>
          <Text style={s.emptyTitle}>Your conversations</Text>
          <Text style={s.muted}>Matches and messages will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.pink} />}
          renderItem={({ item }) => (
            <Pressable style={s.card} onPress={() => router.push(`/chat/${item.id}`)}>
              <Text style={s.avatar}>●</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.display_name || item.username}</Text>
                <Text style={s.msg} numberOfLines={1}>{item.last_message}</Text>
              </View>
              {Number(item.unread_count) > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{item.unread_count}</Text>
                </View>
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.bg, padding: 20 },
  back: { fontSize: 42, color: theme.text },
  title: { fontSize: 30, fontWeight: "900", color: theme.text, marginVertical: 12 },
  card: { backgroundColor: theme.surface, borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  avatar: { fontSize: 32, color: theme.pink },
  name: { color: theme.text, fontWeight: "800" },
  msg: { color: theme.muted, marginTop: 4 },
  badge: { backgroundColor: theme.pink, borderRadius: 12, minWidth: 24, height: 24, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  big: { fontSize: 70, color: theme.pink },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: theme.text },
  muted: { color: theme.muted, marginTop: 8, textAlign: "center" }
});
