import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { api } from "./api/client";

// Foreground display behavior — without this, iOS/Android silently
// suppress a notification's banner while the app is open in the
// foreground, which reads as "notifications don't work" even though
// they're actually arriving.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  } as any)
});

let lastRegisteredToken = "";

/**
 * Requests notification permission and registers the device's Expo push
 * token with the backend. Safe to call every time the app opens while
 * logged in — re-registering the same token is a harmless upsert on the
 * backend, and this skips the network call entirely if nothing changed
 * since the last call in this session.
 *
 * Deliberately quiet on failure: a person should never see an error
 * screen just because push setup didn't work (simulator, permission
 * denied, EAS project not yet linked — see note below).
 */
export async function registerForPushNotifications(): Promise<void> {
  try {
    // Push tokens don't exist on simulators/emulators — nothing to do.
    if (!Device.isDevice) return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250]
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== "granted") return;

    // getExpoPushTokenAsync needs the EAS project id (set once `eas init`
    // has been run and app.json has extra.eas.projectId populated). Until
    // then this throws — caught below so the rest of the app is
    // unaffected, since push setup being incomplete shouldn't block
    // anything else from working.
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    const token = tokenResponse.data;
    if (!token || token === lastRegisteredToken) return;

    await api.registerPushToken(token, Platform.OS === "ios" ? "ios" : "android");
    lastRegisteredToken = token;
  } catch (e) {
    console.warn("Push notification registration skipped:", (e as Error).message);
  }
}

/**
 * Unregisters the current device's token — call on logout so a signed-out
 * device stops receiving another account's notifications.
 */
export async function unregisterPushNotifications(): Promise<void> {
  try {
    if (!lastRegisteredToken) return;
    await api.unregisterPushToken(lastRegisteredToken);
    lastRegisteredToken = "";
  } catch (e) {
    console.warn("Push notification unregister skipped:", (e as Error).message);
  }
}

/**
 * Routes a tapped notification to the relevant screen, based on the
 * `data.type` set when each push is sent server-side (see
 * backend/src/lib/push.js call sites: new_message, new_match,
 * super_liked, gift_received).
 */
export function pushDataToRoute(data: any): string | null {
  switch (data?.type) {
    case "new_message":
      return data.senderId ? `/chat/${data.senderId}` : "/messages";
    case "new_match":
      return "/matches";
    case "super_liked":
      return "/dating";
    case "gift_received":
      return "/wallet";
    default:
      return null;
  }
}
