import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import AppShell from "../src/AppShell";
import { theme } from "../src/theme";
import { phase4Api } from "../src/phase4Api";
import { api } from "../src/api/client";

// Same defensive load as app/wallet.tsx — react-native-iap needs native
// modules and won't load in Expo Go.
let RNIap: typeof import("react-native-iap") | null = null;
try {
  RNIap = require("react-native-iap");
} catch (e) {
  console.warn("react-native-iap unavailable, falling back to web checkout:", e);
}

export default function Membership() {
  const [plans, setPlans] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyTier, setBusyTier] = useState("");

  const load = async () => {
    try {
      const [p, m] = await Promise.all([phase4Api.plans(), phase4Api.membership()]);
      setPlans(p?.plans || p || []);
      setCurrent(m?.membership || m);
    } catch (e: any) {
      setError(e.message || "Unable to load membership.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const subscribeViaWebCheckout = async (tier: string) => {
    const { checkoutUrl } = await api.membershipCheckout(tier);
    if (!checkoutUrl) throw new Error("Checkout is not available right now.");
    await WebBrowser.openBrowserAsync(checkoutUrl);
    await load();
  };

  const subscribe = async (plan: any) => {
    if (busyTier) return;
    const tier = String(plan.tier || plan.id);
    setBusyTier(tier);
    setError("");
    try {
      const sku = Platform.OS === "ios" ? plan.apple_product_id : Platform.OS === "android" ? plan.google_product_id : null;
      if (!RNIap || !sku) {
        await subscribeViaWebCheckout(tier);
        return;
      }

      await RNIap.initConnection();
      try {
        const purchase: any = await RNIap.requestSubscription({ sku } as any);
        const result = Array.isArray(purchase) ? purchase[0] : purchase;

        if (Platform.OS === "ios") {
          const receiptData = result?.transactionReceipt;
          if (!receiptData) throw new Error("No receipt returned from the App Store.");
          const verified = await api.verifyAppleSubscription(receiptData);
          await RNIap.finishTransaction({ purchase: result, isConsumable: false });
          setCurrent(verified.membership);
        } else {
          const purchaseToken = result?.purchaseToken;
          if (!purchaseToken) throw new Error("No purchase token returned from Google Play.");
          const verified = await api.verifyGoogleSubscription(tier, purchaseToken);
          await RNIap.finishTransaction({ purchase: result, isConsumable: false });
          setCurrent(verified.membership);
        }
        await load();
      } finally {
        await RNIap.endConnection();
      }
    } catch (e: any) {
      if (e?.code !== "E_USER_CANCELLED") setError(e.message || "Unable to start membership.");
    } finally {
      setBusyTier("");
    }
  };

  const confirmSubscribe = (plan: any) => {
    Alert.alert("Choose VIP", `Subscribe to ${plan.name || plan.label || "this plan"}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Subscribe", onPress: () => subscribe(plan) }
    ]);
  };

  return <AppShell>
    <ScrollView style={s.page}>
      <Pressable onPress={() => router.back()}><Text style={s.back}>‹</Text></Pressable>
      <Text style={s.kicker}>AMORA PRIVILEGE</Text>
      <Text style={s.title}>VIP Membership</Text>
      <Text style={s.sub}>A more beautiful way to enjoy AmoraLive.</Text>
      {loading ? <ActivityIndicator color={theme.pink} /> : error ? <Text style={s.error}>{error}</Text> : <>
        <View style={s.current}><Text style={s.label}>YOUR MEMBERSHIP</Text><Text style={s.vip}>{current?.name || current?.plan?.name || current?.tier || "Free"}</Text></View>
        {!RNIap && <Text style={s.hint}>Native store purchases aren't available in this build — using secure web checkout instead.</Text>}
        {plans.map((p, i) => {
          const tier = String(p.tier || p.id);
          return <View style={s.card} key={p.id || p.tier || i}>
            <Text style={s.plan}>{p.name || p.title || p.label || "VIP"}</Text>
            <Text style={s.price}>{p.price_display || p.price || "Premium"}</Text>
            {(p.benefits || p.perks || ["VIP badge & profile frame", "Exclusive gifts", "VIP rooms", "Monthly perks"]).slice(0, 5).map((x: any, j: number) => (
              <Text style={s.perk} key={j}>✓ {typeof x === "string" ? x : x.name}</Text>
            ))}
            <Pressable style={s.button} disabled={busyTier === tier} onPress={() => confirmSubscribe(p)}>
              <Text style={s.bt}>{busyTier === tier ? "…" : "Choose VIP"}</Text>
            </Pressable>
          </View>;
        })}
      </>}
    </ScrollView>
  </AppShell>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.bg, padding: 18 }, back: { color: "#fff", fontSize: 40 },
  kicker: { color: theme.gold, fontSize: 8, fontWeight: "900", letterSpacing: 2 }, title: { color: "#fff", fontSize: 30, fontWeight: "900" },
  sub: { color: theme.muted, fontSize: 10, marginBottom: 15 },
  current: { backgroundColor: "#171321", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#6f4f8c", marginBottom: 12 },
  label: { color: theme.dim, fontSize: 7, fontWeight: "900" }, vip: { color: theme.gold, fontSize: 23, fontWeight: "900", marginTop: 6 },
  hint: { color: theme.dim, fontSize: 9, marginBottom: 12, lineHeight: 14 },
  card: { backgroundColor: theme.surface, borderRadius: 20, padding: 17, marginBottom: 10 },
  plan: { color: "#fff", fontSize: 17, fontWeight: "900" }, price: { color: theme.pinkSoft, fontSize: 10, marginBottom: 10 },
  perk: { color: "#ddd7e8", fontSize: 9, marginVertical: 3 },
  button: { marginTop: 12, backgroundColor: theme.pink, borderRadius: 13, paddingVertical: 13, alignItems: "center" },
  bt: { color: "#fff", fontWeight: "900", fontSize: 10 }, error: { color: "#ff8bad", textAlign: "center", marginTop: 20 }
});
