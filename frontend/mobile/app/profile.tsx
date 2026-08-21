import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { View, Text, Pressable, Image, StyleSheet, ActivityIndicator, ScrollView, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../src/theme";
import { api } from "../src/api/client";

type User = {
  id: string;
  username: string;
  display_name: string;
  profile_photo: string | null;
  bio: string | null;
  level: number;
  membership_tier: string;
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.me();
      setUser(data);
      setError("");
    } catch (e: any) {
      setError(e.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const pickAndUploadPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Amora needs access to your photos to set a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1]
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      const filename = asset.uri.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1] === "jpg" ? "jpeg" : match[1]}` : "image/jpeg";
      // React Native's fetch accepts this file-object shape for FormData,
      // even though it doesn't match the DOM File type.
      formData.append("photo", { uri: asset.uri, name: filename, type } as any);

      const data = await api.uploadPhoto(formData);
      setUser((prev) => (prev ? { ...prev, profile_photo: data.url } : prev));
    } catch (e: any) {
      setError(e.message || "Photo upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    router.replace("/auth");
  };

  const rows = [
    { label: "Membership & VIP", onPress: () => router.push("/wallet") },
    { label: "My level & rewards", onPress: () => {} },
    { label: "My outfits & profile effects", onPress: () => {} },
    { label: "Privacy & safety", onPress: () => {} },
    { label: "Terms & policies", onPress: () => {} },
    { label: "Log out", onPress: logout, danger: true }
  ];

  if (loading) {
    return (
      <View style={[s.page, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={theme.pink} />
      </View>
    );
  }

  return (
    <ScrollView style={s.page} contentContainerStyle={{ paddingBottom: 40 }}>
      <Pressable onPress={() => router.back()}>
        <Text style={s.back}>‹</Text>
      </Pressable>

      <View style={s.hero}>
        <Pressable onPress={pickAndUploadPhoto} style={s.avatarWrap}>
          {user?.profile_photo ? (
            <Image source={{ uri: user.profile_photo }} style={s.avatarImage} />
          ) : (
            <View style={s.avatar}>
              <Text style={s.avatarText}>{(user?.display_name || user?.username || "A")[0].toUpperCase()}</Text>
            </View>
          )}
          <View style={s.cameraBadge}>
            {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontSize: 14 }}>📷</Text>}
          </View>
        </Pressable>
        <Text style={s.name}>{user?.display_name || user?.username || "Your Amora Profile"}</Text>
        <Text style={s.muted}>Level {user?.level ?? 0} · {user?.membership_tier === "free" ? "Free member" : user?.membership_tier}</Text>
      </View>

      {!!error && <Text style={s.error}>{error}</Text>}

      {rows.map((row) => (
        <Pressable key={row.label} style={s.row} onPress={row.onPress}>
          <Text style={[s.rowText, row.danger && { color: "#ff6b6b" }]}>{row.label}</Text>
          <Text style={s.arrow}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.bg, padding: 20 },
  back: { fontSize: 42, color: "#fff" },
  hero: { alignItems: "center", padding: 20 },
  avatarWrap: { position: "relative" },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: theme.purple, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarText: { fontSize: 42, color: "#fff", fontWeight: "900" },
  cameraBadge: { position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: theme.pink, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: theme.bg },
  name: { color: "#fff", fontSize: 24, fontWeight: "900", marginTop: 12 },
  muted: { color: theme.muted, marginTop: 5 },
  error: { color: "#ff6b6b", textAlign: "center", marginBottom: 12 },
  row: { backgroundColor: theme.surface, borderRadius: 15, padding: 18, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.border },
  rowText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  arrow: { color: theme.muted, fontSize: 28, marginLeft: "auto" }
});
