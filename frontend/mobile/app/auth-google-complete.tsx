import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, Pressable, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { theme } from "../src/theme";
import { api } from "../src/api/client";

export default function AuthGoogleComplete() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finish = async () => {
    setError("");
    if (!/^[A-Za-z0-9_.-]{3,20}$/.test(username)) {
      setError("Username must be 3-20 characters: letters, numbers, dots, dashes or underscores.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      setError("Enter your date of birth as YYYY-MM-DD.");
      return;
    }
    setLoading(true);
    try {
      await api.googleComplete({ completionToken: token, username: username.trim(), dateOfBirth });
      router.replace("/home");
    } catch (e: any) {
      setError(e.message || "Unable to complete Google registration. Username may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.page}>
      <Text style={s.brand}>AMORA</Text>
      <Text style={s.title}>Finish your account.</Text>
      <Text style={s.subtitle}>One last step: choose your username and confirm your age.</Text>

      {!!error && <Text style={s.error}>{error}</Text>}

      <TextInput
        placeholder="Choose a username"
        placeholderTextColor="#8d849b"
        style={s.input}
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Date of birth (YYYY-MM-DD)"
        placeholderTextColor="#8d849b"
        style={s.input}
        autoCapitalize="none"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />

      <Pressable style={s.primary} onPress={finish} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Finish registration</Text>}
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.bg, padding: 24, justifyContent: "center" },
  brand: { fontSize: 30, fontWeight: "900", letterSpacing: 6, color: theme.pink, textAlign: "center" },
  title: { fontSize: 24, fontWeight: "800", color: theme.text, textAlign: "center", marginTop: 10 },
  subtitle: { color: theme.muted, textAlign: "center", marginTop: 8, marginBottom: 22 },
  error: { color: "#ff6b6b", textAlign: "center", marginBottom: 12, fontWeight: "600" },
  input: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 15, padding: 16, color: theme.text, marginBottom: 12 },
  primary: { backgroundColor: theme.pink, borderRadius: 15, padding: 16, alignItems: "center", marginTop: 6 },
  primaryText: { color: "#fff", fontWeight: "800" }
});
