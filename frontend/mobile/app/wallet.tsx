import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import AppShell from "../src/AppShell";
import { theme } from "../src/theme";
import { phase4Api } from "../src/phase4Api";
import { api } from "../src/api/client";

// react-native-iap needs native modules and won't load in Expo Go — loaded
// defensively so the screen still works (via the Stripe web-checkout
// fallback below) in that environment. This mirrors Apple's App Store
// Review Guidelines section 3.1.1: digital goods (coins) must go through
// native IAP when it's available, with web checkout only as a fallback
// for environments where native IAP can't run at all.
let RNIap: typeof import("react-native-iap") | null = null;
try {
  RNIap = require("react-native-iap");
} catch (e) {
  console.warn("react-native-iap unavailable, falling back to web checkout:", e);
}

export default function Wallet() {
  const [w, setW] = useState<any>(), [tx, setTx] = useState<any[]>([]), [pk, setPk] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchasingId, setPurchasingId] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([phase4Api.wallet(), phase4Api.transactions(), phase4Api.coinPackages()])
      .then(([a, b, c]) => { setW(a?.wallet || a); setTx(b?.transactions || b || []); setPk(c?.packages || c || []); })
      .catch((e: any) => setError(e.message || "Unable to load wallet."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const buyViaWebCheckout = async (pkg: any) => {
    try {
      const { checkoutUrl } = await api.checkout(pkg.id);
      if (!checkoutUrl) throw new Error("Checkout is not available right now.");
      await WebBrowser.openBrowserAsync(checkoutUrl);
      // The purchase completes on Stripe's side and the wallet is credited
      // via webhook — refresh once the browser closes so the new balance
      // shows without the person needing to manually pull-to-refresh.
      load();
    } catch (e: any) {
      setError(e.message || "Unable to start checkout.");
    }
  };

  const buy = async (pkg: any) => {
    if (purchasingId) return;
    setPurchasingId(pkg.id);
    setError("");
    try {
      const sku = Platform.OS === "ios" ? pkg.apple_product_id : Platform.OS === "android" ? pkg.google_product_id : null;
      if (!RNIap || !sku) {
        await buyViaWebCheckout(pkg);
        return;
      }

      await RNIap.initConnection();
      try {
        const purchase: any = await RNIap.requestPurchase({ sku } as any);
        const result = Array.isArray(purchase) ? purchase[0] : purchase;

        if (Platform.OS === "ios") {
          const receiptData = result?.transactionReceipt;
          if (!receiptData) throw new Error("No receipt returned from the App Store.");
          const verified = await api.verifyApplePurchase(pkg.id, receiptData);
          await RNIap.finishTransaction({ purchase: result, isConsumable: true });
          setW((prev: any) => ({ ...prev, balance: verified.balance ?? prev?.balance }));
        } else {
          const purchaseToken = result?.purchaseToken;
          if (!purchaseToken) throw new Error("No purchase token returned from Google Play.");
          const verified = await api.verifyGooglePurchase(pkg.id, purchaseToken);
          await RNIap.finishTransaction({ purchase: result, isConsumable: true });
          setW((prev: any) => ({ ...prev, balance: verified.balance ?? prev?.balance }));
        }
        load();
      } finally {
        await RNIap.endConnection();
      }
    } catch (e: any) {
      if (e?.code === "E_USER_CANCELLED") {
        // Not an error — they just backed out of the purchase sheet.
      } else {
        setError(e.message || "Unable to complete purchase.");
      }
    } finally {
      setPurchasingId("");
    }
  };

  const confirmBuy = (pkg: any) => {
    Alert.alert(
      "Buy coins",
      `Purchase ${pkg.coins_amount ?? pkg.coins ?? 0}${pkg.bonus_coins ? ` + ${pkg.bonus_coins} bonus` : ""} coins?`,
      [{ text: "Cancel", style: "cancel" }, { text: "Buy", onPress: () => buy(pkg) }]
    );
  };

  return <AppShell><ScrollView style={s.p}>
    <Pressable onPress={() => router.back()}><Text style={s.back}>‹</Text></Pressable>
    <Text style={s.k}>AMORA ECONOMY</Text>
    <Text style={s.t}>My Wallet</Text>
    {loading ? <ActivityIndicator color={theme.pink} /> : error ? <Text style={s.err}>{error}</Text> : <>
      <View style={s.balance}><Text style={s.lab}>COIN BALANCE</Text><Text style={s.amount}>{w?.balance ?? w?.coins ?? 0}</Text><Text style={s.coin}>AMORA COINS</Text></View>
      <Pressable onPress={() => router.push("/withdraw")} style={s.withdrawBtn}><Text style={s.withdrawText}>Withdraw earnings →</Text></Pressable>
      {!RNIap && <Text style={s.hint}>Native store purchases aren't available in this build — using secure web checkout instead.</Text>}
      <Text style={s.sec}>Coin Packages</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {pk.map((x, i) => (
          <Pressable key={x.id || i} style={s.pkg} disabled={!!purchasingId} onPress={() => confirmBuy(x)}>
            <Text style={s.pc}>{x.coins_amount ?? x.coins ?? x.amount ?? 0}</Text>
            <Text style={s.small}>coins{x.bonus_coins ? ` +${x.bonus_coins}` : ""}</Text>
            <Text style={s.price}>{purchasingId === x.id ? "…" : x.price_display || x.price || "—"}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={s.sec}>Recent Transactions</Text>
      {tx.slice(0, 12).map((x, i) => (
        <View style={s.row} key={x.id || i}>
          <View style={{ flex: 1 }}><Text style={s.rt}>{x.description || x.type || "Transaction"}</Text><Text style={s.small}>{x.created_at ? new Date(x.created_at).toLocaleString() : ""}</Text></View>
          <Text style={s.ra}>{x.amount ?? 0}</Text>
        </View>
      ))}
    </>}
  </ScrollView></AppShell>;
}

const s = StyleSheet.create({
  p: { flex: 1, backgroundColor: theme.bg, padding: 18 }, back: { color: "#fff", fontSize: 40 },
  k: { color: theme.gold, fontSize: 8, fontWeight: "900", letterSpacing: 2 }, t: { color: "#fff", fontSize: 30, fontWeight: "900" },
  balance: { backgroundColor: "#171321", borderRadius: 22, padding: 22, marginTop: 15 }, lab: { color: theme.dim, fontSize: 7 },
  amount: { color: "#fff", fontSize: 42, fontWeight: "900" }, coin: { color: theme.gold, fontSize: 8 },
  withdrawBtn: { marginTop: 10, alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, backgroundColor: "rgba(255,255,255,.06)", borderWidth: 1, borderColor: theme.border },
  withdrawText: { color: theme.pinkSoft, fontSize: 11, fontWeight: "800" },
  hint: { color: theme.dim, fontSize: 9, marginTop: 10, lineHeight: 14 },
  sec: { color: "#fff", fontSize: 13, fontWeight: "900", marginTop: 22, marginBottom: 10 },
  pkg: { width: 110, backgroundColor: theme.surface, borderRadius: 17, padding: 14, marginRight: 8 },
  pc: { color: theme.gold, fontSize: 19, fontWeight: "900" }, small: { color: theme.muted, fontSize: 8 }, price: { color: "#fff", fontSize: 10, marginTop: 6 },
  row: { flexDirection: "row", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#201c29" },
  rt: { color: "#fff", fontSize: 9, fontWeight: "800" }, ra: { color: "#fff", fontWeight: "900" }, err: { color: "#ff8bad", textAlign: "center", marginTop: 20 }
});
