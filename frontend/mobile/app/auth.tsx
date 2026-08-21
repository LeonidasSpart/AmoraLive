import { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { theme } from "../src/theme";
import { api, API_URL } from "../src/api/client";

WebBrowser.maybeCompleteAuthSession();

type Mode = "login" | "register";

export default function Auth() {
  const [mode, setMode] = useState<Mode>("login");

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register-only fields
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(""); // YYYY-MM-DD

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const resetMessages = () => {
    setError("");
    setInfo("");
  };

  const validDob = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

  const submitLogin = async () => {
    resetMessages();
    if (!email.trim() || !password) {
      setError("Enter your email/username and password.");
      return;
    }
    setLoading(true);
    try {
      await api.login({ identifier: email.trim(), password });
      router.replace("/home");
    } catch (e: any) {
      setError(e.message || "We could not sign you in. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async () => {
    resetMessages();
    if (!email.trim() || !username.trim() || !password || !dateOfBirth) {
      setError("Fill in every field to create your account.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!validDob(dateOfBirth)) {
      setError("Enter your date of birth as YYYY-MM-DD.");
      return;
    }
    setLoading(true);
    try {
      await api.register({
        email: email.trim(),
        username: username.trim(),
        password,
        dateOfBirth
      });
      setInfo("Account created. Check your email for a verification link, then sign in.");
      setMode("login");
      setPassword("");
    } catch (e: any) {
      setError(e.message || "Unable to create your Amora account.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => (mode === "login" ? submitLogin() : submitRegister());

  const continueWithGoogle = async () => {
    resetMessages();
    setGoogleLoading(true);
    try {
      const redirectUrl = Linking.createURL("auth-callback"); // amora://auth-callback
      const authUrl = `${API_URL}/auth/google/start?platform=mobile`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type !== "success" || !result.url) {
        if (result.type !== "cancel" && result.type !== "dismiss") {
          setError("Google sign-in could not be completed. Please try again.");
        }
        return;
      }

      const { queryParams } = Linking.parse(result.url);

      if (queryParams?.error) {
        setError(
          queryParams.error === "account_suspended"
            ? "This account is currently suspended."
            : "Google sign-in could not be completed. Please try again."
        );
        return;
      }

      // Existing user: backend already issued a session.
      if (queryParams?.accessToken) {
        const { storeSession } = await import("../src/api/client");
        await storeSession({
          accessToken: String(queryParams.accessToken),
          refreshToken: queryParams.refreshToken ? String(queryParams.refreshToken) : undefined,
          user: { id: queryParams.userId ? String(queryParams.userId) : undefined }
        });
        router.replace("/home");
        return;
      }

      // New user: backend returned a short-lived completion token. Hand off
      // to the finish-signup screen to collect username + date of birth.
      if (queryParams?.google) {
        router.push({
          pathname: "/auth-google-complete",
          params: { token: String(queryParams.google) }
        });
        return;
      }

      setError("Google sign-in could not be completed. Please try again.");
    } catch (e: any) {
      setError(e.message || "Google sign-in could not be completed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Text style={s.brand}>AMORA</Text>
      <Text style={s.title}>
        {mode === "login" ? "Welcome back." : "Find your meaningful connection."}
      </Text>

      <View style={s.tabs}>
        <Pressable
          style={[s.tab, mode === "login" && s.tabActive]}
          onPress={() => {
            setMode("login");
            resetMessages();
          }}
        >
          <Text style={[s.tabText, mode === "login" && s.tabTextActive]}>Sign in</Text>
        </Pressable>
        <Pressable
          style={[s.tab, mode === "register" && s.tabActive]}
          onPress={() => {
            setMode("register");
            resetMessages();
          }}
        >
          <Text style={[s.tabText, mode === "register" && s.tabTextActive]}>Create account</Text>
        </Pressable>
      </View>

      {!!error && <Text style={s.error}>{error}</Text>}
      {!!info && <Text style={s.info}>{info}</Text>}

      <TextInput
        placeholder={mode === "login" ? "Email or username" : "Email"}
        placeholderTextColor="#8d849b"
        style={s.input}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={mode === "register" ? "email-address" : "default"}
        value={email}
        onChangeText={setEmail}
      />

      {mode === "register" && (
        <TextInput
          placeholder="Username (3-20 characters)"
          placeholderTextColor="#8d849b"
          style={s.input}
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
        />
      )}

      <TextInput
        placeholder="Password"
        placeholderTextColor="#8d849b"
        style={s.input}
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />

      {mode === "register" && (
        <TextInput
          placeholder="Date of birth (YYYY-MM-DD)"
          placeholderTextColor="#8d849b"
          style={s.input}
          autoCapitalize="none"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
        />
      )}

      <Pressable style={s.primary} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.primaryText}>
            {mode === "login" ? "Sign in" : "Create account"}
          </Text>
        )}
      </Pressable>

      <Text style={s.or}>OR</Text>

      <Pressable style={s.google} onPress={continueWithGoogle} disabled={googleLoading}>
        {googleLoading ? (
          <ActivityIndicator color="#17131f" />
        ) : (
          <Text style={s.googleText}>Continue with Google</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => {
          setMode(mode === "login" ? "register" : "login");
          resetMessages();
        }}
      >
        <Text style={s.link}>
          {mode === "login" ? "New to Amora? Create an account" : "Already have an account? Sign in"}
        </Text>
      </Pressable>

      <Text style={s.foot}>By continuing you accept the Terms and Privacy Policy.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flexGrow: 1, backgroundColor: theme.bg, padding: 24, justifyContent: "center" },
  brand: { fontSize: 30, fontWeight: "900", letterSpacing: 6, color: theme.pink, textAlign: "center" },
  title: { fontSize: 24, fontWeight: "800", color: theme.text, textAlign: "center", marginTop: 10, marginBottom: 22 },
  tabs: { flexDirection: "row", backgroundColor: theme.surface, borderRadius: 15, padding: 4, marginBottom: 18, borderWidth: 1, borderColor: theme.border },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  tabActive: { backgroundColor: theme.pink },
  tabText: { color: theme.muted, fontWeight: "700" },
  tabTextActive: { color: "#fff" },
  error: { color: "#ff6b6b", textAlign: "center", marginBottom: 12, fontWeight: "600" },
  info: { color: theme.success, textAlign: "center", marginBottom: 12, fontWeight: "600" },
  input: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 15, padding: 16, color: theme.text, marginBottom: 12 },
  primary: { backgroundColor: theme.pink, borderRadius: 15, padding: 16, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800" },
  google: { backgroundColor: "#fff", borderRadius: 15, padding: 16, alignItems: "center", marginTop: 10 },
  googleText: { color: "#17131f", fontWeight: "800" },
  or: { color: theme.muted, textAlign: "center", margin: 20 },
  link: { color: theme.pink, textAlign: "center", fontWeight: "700", marginTop: 4 },
  foot: { color: "#777080", fontSize: 11, textAlign: "center", marginTop: 28 }
});
