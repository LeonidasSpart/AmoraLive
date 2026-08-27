import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../src/api/client";
import { registerForPushNotifications } from "../src/push";
import { theme } from "../src/theme";

export default function SocialComplete() {
  const { code, provider } = useLocalSearchParams<{ code?: string; provider?: string }>();
  const [completionToken, setCompletionToken] = useState("");
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [needsEmail, setNeedsEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const providerName = provider === "facebook" ? "Facebook" : provider === "apple" ? "Apple" : "Google";

  useEffect(() => {
    if (!code) {
      setError("This sign-in session is missing or invalid.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const result = await api.socialExchange(String(code));
        if (result.accessToken) {
          registerForPushNotifications();
          router.replace("/home");
          return;
        }
        if (!result.completionToken) throw new Error("Unable to continue social registration.");
        setCompletionToken(String(result.completionToken));
        setNeedsEmail(Boolean(result.needsEmail));
        if (result.email) setEmail(String(result.email));
      } catch (e: any) {
        setError(e.message || "Unable to continue social registration.");
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  const complete = async () => {
    setError("");
    if (needsEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!/^[A-Za-z0-9_.-]{3,20}$/.test(username.trim())) {
      setError("Choose a username with 3–20 letters, numbers, dots, dashes or underscores.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      setError("Enter your date of birth as YYYY-MM-DD.");
      return;
    }
    setSaving(true);
    try {
      await api.socialComplete({
        completionToken,
        username: username.trim(),
        dateOfBirth,
        email: email.trim()
      });
      registerForPushNotifications();
      router.replace("/home");
    } catch (e: any) {
      setError(e.message || `Unable to finish ${providerName} registration.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={theme.pink} size="large" />
        <Text style={s.text}>Securely connecting to {providerName}…</Text>
      </View>
    );
  }

  return (
    <View style={s.page}>
      <Text style={s.brand}>AMORA</Text>
      <Text style={s.title}>Finish your account.</Text>
      <Text style={s.subtitle}>One last step — choose your Amora username and confirm that you are 18+.</Text>

      {!!error && <Text style={s.error}>{error}</Text>}

      {needsEmail && (
        <TextInput
          placeholder="Email address"
          placeholderTextColor="#8d849b"
          style={s.input}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      )}
      <TextInput
        placeholder="Username (3-20 characters)"
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

      <Pressable style={s.primary} onPress={complete} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Continue to Amora</Text>}
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.bg, padding: 24, justifyContent: "center" },
  center: { flex: 1, backgroundColor: theme.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  brand: { fontSize: 30, fontWeight: "900", letterSpacing: 6, color: theme.pink, textAlign: "center" },
  title: { color: theme.text, fontSize: 28, fontWeight: "900", textAlign: "center", marginTop: 14 },
  subtitle: { color: theme.muted, textAlign: "center", lineHeight: 22, marginTop: 10, marginBottom: 24 },
  text: { color: theme.muted, marginTop: 14 },
  error: { color: "#ff6b6b", textAlign: "center", marginBottom: 14, fontWeight: "600" },
  input: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 15, padding: 16, color: theme.text, marginBottom: 12 },
  primary: { backgroundColor: theme.pink, borderRadius: 15, padding: 16, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800" }
});
