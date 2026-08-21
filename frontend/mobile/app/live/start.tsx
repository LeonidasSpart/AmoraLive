import { useState } from "react";
import { router } from "expo-router";
import { View, Text, Pressable, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { theme } from "../../src/theme";
import { api } from "../../src/api/client";

const CATEGORIES = ["Chat", "Music", "Dance", "Gaming", "Talent", "Just Chatting", "General"];

export default function StartLive() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startLive = async () => {
    setError("");
    if (!title.trim()) {
      setError("Give your live room a title.");
      return;
    }
    setLoading(true);
    try {
      const room = await api.createLiveRoom({ title: title.trim(), category });
      router.replace(`/live/${room.id}`);
    } catch (e: any) {
      setError(e.message || "Unable to start your live room.");
      setLoading(false);
    }
  };

  return (
    <View style={s.page}>
      <Pressable onPress={() => router.back()}>
        <Text style={s.back}>‹</Text>
      </Pressable>
      <Text style={s.title}>Go Live</Text>
      <Text style={s.subtitle}>Viewers can join, chat and send you gifts in real time.</Text>

      <TextInput
        style={s.input}
        placeholder="What's happening in your stream?"
        placeholderTextColor="#8d849b"
        value={title}
        onChangeText={setTitle}
        maxLength={80}
      />

      <View style={s.categoryGrid}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={category === c ? s.categoryActive : s.category}
          >
            <Text style={category === c ? s.categoryTextActive : s.categoryText}>{c}</Text>
          </Pressable>
        ))}
      </View>

      {!!error && <Text style={s.error}>{error}</Text>}

      <Pressable style={s.goBtn} onPress={startLive} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.goBtnText}>🔴 Go Live</Text>}
      </Pressable>

      <Text style={s.note}>You'll be asked to allow camera and microphone access once your room is created.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#050407", padding: 20 },
  back: { fontSize: 42, color: "#fff" },
  title: { fontSize: 28, fontWeight: "900", color: "#fff", marginTop: 8 },
  subtitle: { color: theme.muted, marginTop: 6, marginBottom: 20 },
  input: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 15, padding: 16, color: "#fff", marginBottom: 16 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  category: { borderWidth: 1, borderColor: theme.border, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  categoryActive: { backgroundColor: theme.pink, borderWidth: 1, borderColor: theme.pink, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  categoryText: { color: theme.muted, fontSize: 13 },
  categoryTextActive: { color: "#fff", fontSize: 13, fontWeight: "700" },
  error: { color: "#ff6b6b", marginTop: 16, textAlign: "center" },
  goBtn: { backgroundColor: "#ff3355", borderRadius: 16, padding: 18, alignItems: "center", marginTop: 24 },
  goBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  note: { color: "#666", fontSize: 12, marginTop: 16, textAlign: "center" }
});
