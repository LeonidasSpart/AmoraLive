import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { registerGlobals } from "@livekit/react-native";

// Must run once at app startup, before any LiveKit Room is created, so the
// native WebRTC globals (RTCPeerConnection, mediaDevices, etc.) exist.
registerGlobals();

export default function Layout() {
  return <>
    <StatusBar style="light" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#080611" } }} />
  </>;
}
