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
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { theme } from "../src/theme";
import { api, API_URL, storeSession } from "../src/api/client";
import { registerForPushNotifications } from "../src/push";

WebBrowser.maybeCompleteAuthSession();

type Mode = "login" | "register";

export default function Auth() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
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
      registerForPushNotifications();
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
    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
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

  const finishBrowserSocial = async (provider: "google" | "apple" | "facebook", result: any) => {
    if (result.type !== "success" || !result.url) {
      if (result.type !== "cancel" && result.type !== "dismiss") {
        setError(`${provider === "facebook" ? "Facebook" : provider === "apple" ? "Apple" : "Google"} sign-in could not be completed. Please try again.`);
      }
      return;
    }

    const { queryParams } = Linking.parse(result.url);
    if (queryParams?.error) {
      setError(
        queryParams.error === "account_suspended"
          ? "This account is currently suspended."
          : `${provider === "facebook" ? "Facebook" : provider === "apple" ? "Apple" : "Google"} sign-in could not be completed. Please try again.`
      );
      return;
    }

    if (queryParams?.accessToken) {
      await storeSession({
        accessToken: String(queryParams.accessToken),
        refreshToken: queryParams.refreshToken ? String(queryParams.refreshToken) : undefined,
        user: { id: queryParams.userId ? String(queryParams.userId) : undefined }
      });
      registerForPushNotifications();
      router.replace("/home");
      return;
    }

    if (queryParams?.code) {
      router.push({
        pathname: "/auth-social-complete",
        params: {
          code: String(queryParams.code),
          provider
        }
      });
      return;
    }

    setError(`${provider === "facebook" ? "Facebook" : provider === "apple" ? "Apple" : "Google"} sign-in could not be completed. Please try again.`);
  };

  const continueWithGoogle = async () => {
    resetMessages();
    setGoogleLoading(true);
    try {
      const redirectUrl = Linking.createURL("auth-callback");
      const authUrl = `${API_URL}/auth/google/start?platform=mobile`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      await finishBrowserSocial("google", result);
    } catch (e: any) {
      setError(e.message || "Google sign-in could not be completed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const continueWithFacebook = async () => {
    resetMessages();
    setFacebookLoading(true);
    try {
      const redirectUrl = Linking.createURL("auth-callback");
      const authUrl = `${API_URL}/auth/facebook/start?platform=mobile`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      await finishBrowserSocial("facebook", result);
    } catch (e: any) {
      setError(e.message || "Facebook sign-in could not be completed. Please try again.");
    } finally {
      setFacebookLoading(false);
    }
  };

  const continueWithApple = async () => {
    resetMessages();
    setAppleLoading(true);
    try {
      if (Platform.OS === "ios") {
        const bytes = await Crypto.getRandomBytesAsync(32);
        const nonce = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL
          ],
          nonce
        });

        if (!credential.identityToken) throw new Error("Apple did not return a secure identity token.");

        const displayName = [
          credential.fullName?.givenName,
          credential.fullName?.middleName,
          credential.fullName?.familyName
        ].filter(Boolean).join(" ");

        const result = await api.appleNative({
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
          nonce,
          displayName
        });

        if (result.accessToken) {
          await storeSession(result);
          registerForPushNotifications();
          router.replace("/home");
          return;
        }

        if (result.needsProfile && result.handoffCode) {
          router.push({
            pathname: "/auth-social-complete",
            params: { code: String(result.handoffCode), provider: "apple" }
          });
          return;
        }

        throw new Error("Apple sign-in could not be completed.");
      }

      const redirectUrl = Linking.createURL("auth-callback");
      const authUrl = `${API_URL}/auth/apple/start?platform=mobile`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      await finishBrowserSocial("apple", result);
    } catch (e: any) {
      if (e?.code !== "ERR_REQUEST_CANCELED") {
        setError(e.message || "Apple sign-in could not be completed. Please try again.");
      }
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Text style={s.brand}>AMORA</Text>
      <Text style={s.title}>
        {mode === "login" ? "Welcome back." : "Find your meaningful connection."}
      </Text>

      <View style={s.tabs}>
        <Pressable style={[s.tab, mode === "login" && s.tabActive]} onPress={() => { setMode("login"); resetMessages(); }}>
          <Text style={[s.tabText, mode === "login" && s.tabTextActive]}>Sign in</Text>
        </Pressable>
        <Pressable style={[s.tab, mode === "register" && s.tabActive]} onPress={() => { setMode("register"); resetMessages(); }}>
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
        <TextInput placeholder="Username (3-20 characters)" placeholderTextColor="#8d849b" style={s.input} autoCapitalize="none" autoCorrect={false} value={username} onChangeText={setUsername} />
      )}

      <TextInput placeholder="Password" placeholderTextColor="#8d849b" style={s.input} secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} />

      {mode === "register" && (
        <TextInput placeholder="Date of birth (YYYY-MM-DD)" placeholderTextColor="#8d849b" style={s.input} autoCapitalize="none" value={dateOfBirth} onChangeText={setDateOfBirth} />
      )}

      <Pressable style={s.primary} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>{mode === "login" ? "Sign in" : "Create account"}</Text>}
      </Pressable>

      <Text style={s.or}>OR</Text>

      {Platform.OS === "ios" ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={15}
          style={s.appleNative}
          onPress={continueWithApple}
        />
      ) : (
        <Pressable style={s.apple} onPress={continueWithApple} disabled={appleLoading}>
          {appleLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.appleText}>  Continue with Apple</Text>}
        </Pressable>
      )}

      <Pressable style={s.facebook} onPress={continueWithFacebook} disabled={facebookLoading}>
        {facebookLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.facebookText}>f  Continue with Facebook</Text>}
      </Pressable>

      <Pressable style={s.google} onPress={continueWithGoogle} disabled={googleLoading}>
        {googleLoading ? <ActivityIndicator color="#17131f" /> : <Text style={s.googleText}>Continue with Google</Text>}
      </Pressable>

      <Pressable onPress={() => { setMode(mode === "login" ? "register" : "login"); resetMessages(); }}>
        <Text style={s.link}>{mode === "login" ? "New to Amora? Create an account" : "Already have an account? Sign in"}</Text>
      </Pressable>

      {mode === "login" && (
        <Pressable onPress={() => router.push("/delete-account")}>
          <Text style={s.deleteLink}>Want to delete your account instead?</Text>
        </Pressable>
      )}

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
  appleNative: { width: "100%", height: 52, marginBottom: 10 },
  apple: { backgroundColor: "#050505", borderRadius: 15, padding: 16, alignItems: "center", marginBottom: 10 },
  appleText: { color: "#fff", fontWeight: "800" },
  facebook: { backgroundColor: "#1877F2", borderRadius: 15, padding: 16, alignItems: "center", marginBottom: 10 },
  facebookText: { color: "#fff", fontWeight: "800" },
  google: { backgroundColor: "#fff", borderRadius: 15, padding: 16, alignItems: "center" },
  googleText: { color: "#17131f", fontWeight: "800" },
  or: { color: theme.muted, textAlign: "center", margin: 20 },
  link: { color: theme.pink, textAlign: "center", fontWeight: "700", marginTop: 12 },
  deleteLink: { color: theme.muted, textAlign: "center", fontSize: 12, marginTop: 16 },
  foot: { color: "#777080", fontSize: 11, textAlign: "center", marginTop: 28 }
});
