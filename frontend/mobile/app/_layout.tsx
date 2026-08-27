import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { registerGlobals } from "@livekit/react-native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { isLoggedIn } from "../src/api/client";
import { registerForPushNotifications, pushDataToRoute } from "../src/push";
import { LanguageProvider } from "../src/i18n";

// Must run once at app startup, before any LiveKit Room is created, so the
// native WebRTC globals (RTCPeerConnection, mediaDevices, etc.) exist.
registerGlobals();

export default function Layout() {
  useEffect(() => {
    // Covers reopening the app while already logged in. The other half —
    // right after a fresh login — is called explicitly from
    // app/auth.tsx and the OAuth completion screens, since this effect
    // only runs once at cold start and won't re-fire just because
    // someone logs in during this same app session.
    isLoggedIn().then((loggedIn) => { if (loggedIn) registerForPushNotifications(); });

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = pushDataToRoute(response.notification.request.content.data);
      if (route) router.push(route as any);
    });
    return () => sub.remove();
  }, []);

  return <LanguageProvider>
    <StatusBar style="light" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#080611" } }} />
  </LanguageProvider>;
}
