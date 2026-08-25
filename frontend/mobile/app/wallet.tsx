import { useCallback, useEffect, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { theme } from "../src/theme";
import { api } from "../src/api/client";
import AppShell from "../src/AppShell";

type CoinPackage = {
  id: string;
  name: string;
  coins_amount: number;
  bonus_coins: number;
  price_cents: number;
  apple_product_id: string | null;
  google_product_id: string | null;
};
type Transaction = { id: string; type: string; amount: number; description: string; created_at: string };

// react-native-iap requires native modules and will not load in Expo Go —
// only in a dev client / standalone build. Importing it defensively means
// this screen still works (via the Stripe web-checkout fallback below)
// everywhere else instead of crashing.
let RNIap: typeof import("react-native-iap") | null = null;
try {
  RNIap = require("react-native-iap");
} catch {
  RNIap = null;
}

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [nativeAvailable, setNativeAvailable] = useState(false);

  const purchaseUpdateSub = useRef<any>(null);
  const purchaseErrorSub = useRef<any>(null);
  const pendingPackageRef = useRef<CoinPackage | null>(null);

  const nativeProductId = (pkg: CoinPackage) =>
    Platform.OS === "ios" ? pkg.apple_product_id : Platform.OS === "android" ? pkg.google_product_id : null;

  const loadWalletData = useCallback(async () => {
    try {
      const [wallet, pkgs, txs] = await Promise.all([
        api.wallet(),
        api.coinPackages(Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "web"),
        api.walletTransactions()
      ]);
      setBalance(wallet.balance || 0);
      setPackages(Array.isArray(pkgs) ? pkgs : []);
      setTransactions(Array.isArray(txs) ? txs.slice(0, 10) : []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Unable to load your wallet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWalletData();
    }, [loadWalletData])
  );

  // Set up the native store connection once, and tear it down when this
  // screen unmounts.
  useEffect(() => {
    let active = true;
    if (!RNIap || (Platform.OS !== "ios" && Platform.OS !== "android")) {
      setNativeAvailable(false);
      return;
    }

    (async () => {
      try {
        await RNIap!.initConnection();
        if (!active) return;
        setNativeAvailable(true);
      } catch (e) {
        console.warn("react-native-iap unavailable, falling back to web checkout:", e);
        if (active) setNativeAvailable(false);
      }
    })();

    purchaseUpdateSub.current = RNIap.purchaseUpdatedListener(async (purchase: any) => {
      const pkg = pendingPackageRef.current;
      if (!pkg) return;
      try {
        let result;
        if (Platform.OS === "ios") {
          const receiptData = purchase.transactionReceipt;
          if (!receiptData) throw new Error("Missing receipt from the App Store.");
          result = await api.verifyApplePurchase(pkg.id, receiptData);
        } else {
          const purchaseToken = purchase.purchaseToken;
          if (!purchaseToken) throw new Error("Missing purchase token from Google Play.");
          result = await api.verifyGooglePurchase(pkg.id, purchaseToken);
        }
        // Coins are consumable — finishing/consuming lets the same product
        // be bought again, and completes Apple/Google's own acknowledgement
        // flow (we also acknowledge server-side for Google as a backstop).
        await RNIap!.finishTransaction({ purchase, isConsumable: true });
        setBalance(result.balance ?? balance);
        await loadWalletData();
      } catch (e: any) {
        setError(e.message || "We received your purchase but could not verify it. Contact support if coins don't appear.");
      } finally {
        setBuyingId(null);
        pendingPackageRef.current = null;
      }
    });

    purchaseErrorSub.current = RNIap.purchaseErrorListener((err: any) => {
      if (err?.code !== "E_USER_CANCELLED") {
        setError(err?.message || "Purchase failed.");
      }
      setBuyingId(null);
      pendingPackageRef.current = null;
    });

    return () => {
      active = false;
      purchaseUpdateSub.current?.remove();
      purchaseErrorSub.current?.remove();
      RNIap?.endConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buyNative = async (pkg: CoinPackage) => {
    const productId = nativeProductId(pkg);
    if (!RNIap || !productId) {
      setError("This package isn't available for native purchase yet.");
      return;
    }
    setBuyingId(pkg.id);
    setError("");
    pendingPackageRef.current = pkg;
    try {
      await RNIap.requestPurchase({ sku: productId } as any);
      // Result is delivered asynchronously to purchaseUpdatedListener above.
    } catch (e: any) {
      if (e?.code !== "E_USER_CANCELLED") {
        setError(e.message || "Unable to start the purchase.");
      }
      setBuyingId(null);
      pendingPackageRef.current = null;
    }
  };

  // Fallback used in Expo Go / dev clients where native IAP isn't linked,
  // and as a general safety net. Opens the same Stripe Checkout flow the
  // web app uses; the backend only ever credits coins once its webhook
  // confirms payment, never from the client.
  const buyViaWebCheckout = async (pkg: CoinPackage) => {
    setBuyingId(pkg.id);
    setError("");
    try {
      const { checkoutUrl } = await api.checkout(pkg.id);
      if (!checkoutUrl) throw new Error("Checkout is not available right now.");
      await WebBrowser.openBrowserAsync(checkoutUrl);
      await loadWalletData();
    } catch (e: any) {
      setError(e.message || "Unable to start checkout.");
    } finally {
      setBuyingId(null);
    }
  };

  const buy = (pkg: CoinPackage) => {
    if (nativeAvailable && nativeProductId(pkg)) return buyNative(pkg);
    // Stripe is intentionally kept as a development fallback only.
    // Production iOS/Android builds must use the platform store for digital
    // coins and gifts; the web client keeps its own Stripe flow.
    if (__DEV__) return buyViaWebCheckout(pkg);
    setError(Platform.OS === "ios"
      ? "This coin package is not configured for the App Store yet."
      : "This coin package is not configured for Google Play yet.");
  };

  if (loading) {
    return (
      <View style={[s.page, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={theme.pink} />
      </View>
    );
  }

  return (
    <AppShell>
    <FlatList
      style={s.page}
      data={transactions}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <Pressable onPress={() => router.back()}>
            <Text style={s.back}>‹</Text>
          </Pressable>
          <Text style={s.title}>Coins & Gifts</Text>

          <View style={s.balance}>
            <Text style={s.muted}>My coins</Text>
            <Text style={s.amount}>🪙 {balance}</Text>
          </View>

          {!!error && <Text style={s.error}>{error}</Text>}

          <Text style={s.section}>Buy coins</Text>
          {packages.length === 0 ? (
            <Text style={s.muted}>No packages available right now.</Text>
          ) : (
            <View style={s.grid}>
              {packages.map((p) => (
                <Pressable key={p.id} style={s.pack} onPress={() => buy(p)} disabled={buyingId === p.id}>
                  {buyingId === p.id ? (
                    <ActivityIndicator color={theme.pink} />
                  ) : (
                    <>
                      <Text style={s.coin}>🪙</Text>
                      <Text style={s.qty}>{p.coins_amount}{p.bonus_coins > 0 ? `+${p.bonus_coins}` : ""}</Text>
                      <Text style={s.price}>${(p.price_cents / 100).toFixed(2)}</Text>
                    </>
                  )}
                </Pressable>
              ))}
            </View>
          )}
          {!nativeAvailable && (Platform.OS === "ios" || Platform.OS === "android") && (
            <Text style={s.hint}>{__DEV__ ? "Development build: web checkout fallback is enabled." : "Store purchases will be available once the platform product IDs are configured."}</Text>
          )}

          <Text style={s.section}>Recent activity</Text>
        </View>
      }
      ListEmptyComponent={<Text style={s.muted}>No transactions yet.</Text>}
      renderItem={({ item }) => (
        <View style={s.txRow}>
          <Text style={s.txDesc}>{item.description}</Text>
          <Text style={[s.txAmount, item.amount < 0 ? { color: "#ff6b6b" } : { color: theme.success }]}>
            {item.amount > 0 ? "+" : ""}{item.amount}
          </Text>
        </View>
      )}
    />
    </AppShell>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.bg, padding: 20 },
  back: { fontSize: 42, color: "#fff" },
  title: { fontSize: 30, fontWeight: "900", color: "#fff", marginBottom: 18 },
  balance: { backgroundColor: "#1a1029", borderRadius: 24, padding: 22, borderWidth: 1, borderColor: "rgba(255,216,107,.22)", shadowColor: theme.pink, shadowOpacity: .13, shadowRadius: 30, shadowOffset: { width: 0, height: 14 } },
  muted: { color: theme.muted },
  amount: { fontSize: 30, fontWeight: "900", color: theme.gold, marginTop: 5 },
  error: { color: "#ff6b6b", marginTop: 10 },
  hint: { color: theme.muted, fontSize: 11, marginTop: 8, fontStyle: "italic" },
  section: { fontSize: 20, fontWeight: "900", color: "#fff", marginVertical: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pack: { width: "31%", backgroundColor: theme.surface, borderRadius: 18, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,.08)", minHeight: 100, justifyContent: "center", shadowColor: "#000", shadowOpacity: .24, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  coin: { fontSize: 24 },
  qty: { color: "#fff", fontWeight: "900", fontSize: 16, marginVertical: 5 },
  price: { color: theme.orange, fontWeight: "800" },
  txRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: theme.surface, borderRadius: 15, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,.07)" },
  txDesc: { color: "#eee", flex: 1, fontSize: 13 },
  txAmount: { fontWeight: "900" }
});
