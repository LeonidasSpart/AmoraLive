import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { theme } from "../src/theme";
import { api } from "../src/api/client";

type Session = { id: string; device_info?: string | null; ip_address?: string | null; created_at: string; expires_at: string };
type SecurityOverview = { score: number; recommendations: string[]; emailVerified: boolean; ageVerified: boolean; privacyConfigured: boolean; activeSessions: number };

function scoreLabel(score: number) {
  if (score >= 90) return "Excellent protection";
  if (score >= 75) return "Strong protection";
  if (score >= 60) return "Good protection";
  return "Protection needs attention";
}

export default function Security() {
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [privacy, setPrivacy] = useState<any>({ online_status_visible: true, profile_visible: true, show_age: true, show_location: true });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const load = useCallback(async () => {
    try {
      const [security, deviceList, privacySettings] = await Promise.all([
        api.securityOverview(),
        api.sessions(),
        api.privacy().catch(() => ({}))
      ]);
      setOverview(security);
      setSessions(Array.isArray(deviceList) ? deviceList : []);
      setPrivacy({ ...privacy, ...(privacySettings || {}) });
    } catch (e: any) {
      Alert.alert("Security Center", e.message || "Unable to load your security settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const updatePrivacy = async (key: string, value: boolean) => {
    const next = { ...privacy, [key]: value };
    setPrivacy(next);
    try {
      await api.updatePrivacy(next);
    } catch (e: any) {
      setPrivacy(privacy);
      Alert.alert("Privacy", e.message || "Unable to update privacy.");
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 10) return Alert.alert("Password", "Use at least 10 characters.");
    if (newPassword !== confirmPassword) return Alert.alert("Password", "The new passwords do not match.");
    setBusy("password");
    try {
      await api.changePassword(currentPassword, newPassword);
      await api.logout();
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      Alert.alert("Password changed", "For your protection, all existing sessions were revoked. Please sign in again.", [{ text: "Sign in", onPress: () => router.replace("/auth") }]);
    } catch (e: any) {
      Alert.alert("Password", e.message || "Unable to change password.");
    } finally { setBusy(null); }
  };

  const revoke = async (sessionId: string) => {
    setBusy(sessionId);
    try {
      await api.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e: any) {
      Alert.alert("Device", e.message || "Unable to revoke this session.");
    } finally { setBusy(null); }
  };

  const revokeOthers = async () => {
    setBusy("others");
    try {
      const result = await api.revokeOtherSessions();
      Alert.alert("Devices secured", `${result.revokedCount || 0} other session${result.revokedCount === 1 ? "" : "s"} revoked.`);
      await load();
    } catch (e: any) {
      Alert.alert("Devices", e.message || "Unable to revoke other sessions.");
    } finally { setBusy(null); }
  };

  if (loading) return <View style={[s.page, s.center]}><ActivityIndicator color={theme.pink} /></View>;

  return <ScrollView style={s.page} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <Pressable onPress={() => router.back()}><Text style={s.back}>‹</Text></Pressable>
    <Text style={s.kicker}>AMORA SECURITY</Text>
    <Text style={s.title}>Security Center</Text>
    <Text style={s.subtitle}>Protect your identity, devices and private moments.</Text>

    <View style={s.scoreCard}>
      <View style={s.scoreGlow} />
      <View style={s.scoreCircle}><Text style={s.score}>{overview?.score ?? 0}</Text><Text style={s.scoreOf}>/100</Text></View>
      <View style={{ flex: 1 }}><Text style={s.scoreTitle}>{scoreLabel(overview?.score ?? 0)}</Text><Text style={s.scoreText}>{overview?.recommendations?.[0] || "Your Amora account is being protected."}</Text></View>
    </View>

    <View style={s.statusGrid}>
      {[
        [overview?.emailVerified, "Email verified", "✉️"],
        [overview?.ageVerified, "Age verified", "🛡️"],
        [overview?.privacyConfigured, "Privacy configured", "🔒"],
        [Boolean(overview?.activeSessions && overview.activeSessions <= 5), "Devices monitored", "📱"]
      ].map(([ok, label, icon]) => <View key={String(label)} style={s.status}><Text style={s.statusIcon}>{icon}</Text><Text style={s.statusLabel}>{label}</Text><Text style={[s.statusState, { color: ok ? theme.success : theme.gold }]}>{ok ? "Protected" : "Review"}</Text></View>)}
    </View>

    <Text style={s.section}>Privacy shield</Text>
    <View style={s.panel}>
      {[
        ["online_status_visible", "Show online status", "Let people see when you're online."],
        ["profile_visible", "Discoverable profile", "Allow your profile to appear in discovery."],
        ["show_age", "Show age", "Display your age on your public profile."],
        ["show_location", "Show location", "Display your selected city/country."],
      ].map(([key, label, hint]) => <View key={key} style={s.settingRow}><View style={{ flex: 1 }}><Text style={s.settingTitle}>{label}</Text><Text style={s.settingHint}>{hint}</Text></View><Switch value={Boolean(privacy[key])} onValueChange={(v) => updatePrivacy(key, v)} trackColor={{ false: "#332743", true: theme.purple }} thumbColor="#fff" /></View>)}
    </View>

    <Text style={s.section}>Your devices</Text>
    <View style={s.panel}>
      {sessions.map((session, index) => <View key={session.id} style={s.deviceRow}><View style={s.deviceIcon}><Text>📱</Text></View><View style={{ flex: 1 }}><Text style={s.settingTitle} numberOfLines={1}>{session.device_info || "Unknown device"}</Text><Text style={s.settingHint}>{session.ip_address || "Protected connection"} · {index === 0 ? "Most recent" : new Date(session.created_at).toLocaleDateString()}</Text></View><Pressable disabled={busy === session.id} onPress={() => revoke(session.id)} style={s.revoke}><Text style={s.revokeText}>{busy === session.id ? "…" : "Revoke"}</Text></Pressable></View>)}
      {sessions.length > 1 && <Pressable disabled={busy === "others"} onPress={revokeOthers} style={s.revokeAll}><Text style={s.revokeAllText}>{busy === "others" ? "Securing…" : "Log out all other devices"}</Text></Pressable>}
    </View>

    <Text style={s.section}>Change password</Text>
    <View style={s.panel}>
      <TextInput value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="Current password" placeholderTextColor="#756b85" style={s.input} />
      <TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="New password (10+ characters)" placeholderTextColor="#756b85" style={s.input} />
      <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Confirm new password" placeholderTextColor="#756b85" style={s.input} />
      <Pressable disabled={busy === "password"} onPress={changePassword} style={s.primary}><Text style={s.primaryText}>{busy === "password" ? "Securing…" : "Change password securely"}</Text></Pressable>
      <Text style={s.securityNote}>Amora never displays or stores your plaintext password. A successful password change revokes existing sessions.</Text>
    </View>

    <View style={s.footer}><Text style={s.footerIcon}>✦</Text><Text style={s.footerTitle}>AMORA TRUST</Text><Text style={s.footerText}>Report, block and mute tools remain available throughout the app. Suspicious activity is rate-limited and security events are recorded for protection and support.</Text></View>
  </ScrollView>;
}

const s = StyleSheet.create({
  page:{flex:1,backgroundColor:theme.bg},content:{padding:20,paddingBottom:50},center:{alignItems:"center",justifyContent:"center"},back:{fontSize:42,color:"#fff",lineHeight:42},kicker:{color:theme.gold,fontSize:9,fontWeight:"900",letterSpacing:2.5,marginTop:4},title:{color:"#fff",fontSize:32,fontWeight:"900",marginTop:5},subtitle:{color:theme.muted,fontSize:12,lineHeight:18,marginTop:5,marginBottom:18},scoreCard:{position:"relative",overflow:"hidden",flexDirection:"row",alignItems:"center",gap:16,padding:18,borderRadius:26,borderWidth:1,borderColor:"rgba(255,216,107,.22)",backgroundColor:"#151024",shadowColor:theme.pink,shadowOpacity:.16,shadowRadius:30,shadowOffset:{width:0,height:14}},scoreGlow:{position:"absolute",width:220,height:220,borderRadius:110,right:-100,top:-100,backgroundColor:"rgba(155,53,255,.18)"},scoreCircle:{width:82,height:82,borderRadius:41,borderWidth:2,borderColor:theme.gold,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255,216,107,.07)"},score:{color:theme.gold,fontSize:28,fontWeight:"900"},scoreOf:{color:theme.muted,fontSize:9,marginTop:-4},scoreTitle:{color:"#fff",fontSize:16,fontWeight:"900"},scoreText:{color:theme.muted,fontSize:10,lineHeight:15,marginTop:4},statusGrid:{flexDirection:"row",flexWrap:"wrap",gap:9,marginTop:12},status:{width:"48%",padding:13,borderRadius:18,backgroundColor:theme.surface,borderWidth:1,borderColor:"rgba(255,255,255,.07)"},statusIcon:{fontSize:18},statusLabel:{color:"#fff",fontSize:11,fontWeight:"800",marginTop:7},statusState:{fontSize:9,fontWeight:"900",marginTop:3},section:{color:"#fff",fontSize:18,fontWeight:"900",marginTop:24,marginBottom:10},panel:{padding:14,borderRadius:22,borderWidth:1,borderColor:"rgba(255,255,255,.08)",backgroundColor:theme.surface},settingRow:{flexDirection:"row",alignItems:"center",gap:12,paddingVertical:12,borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,.05)"},settingTitle:{color:"#fff",fontSize:13,fontWeight:"800"},settingHint:{color:theme.dim,fontSize:9,lineHeight:14,marginTop:3},deviceRow:{flexDirection:"row",alignItems:"center",gap:10,paddingVertical:11,borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,.05)"},deviceIcon:{width:38,height:38,borderRadius:12,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(139,77,255,.12)"},revoke:{paddingHorizontal:9,paddingVertical:7,borderRadius:9,borderWidth:1,borderColor:"rgba(255,255,255,.09)"},revokeText:{color:"#ff9abf",fontSize:9,fontWeight:"900"},revokeAll:{marginTop:12,paddingVertical:12,borderRadius:13,alignItems:"center",borderWidth:1,borderColor:"rgba(255,92,120,.25)",backgroundColor:"rgba(255,92,120,.06)"},revokeAllText:{color:"#ff9abf",fontSize:11,fontWeight:"900"},input:{backgroundColor:"#0e0a17",borderRadius:14,borderWidth:1,borderColor:"rgba(255,255,255,.08)",paddingHorizontal:14,paddingVertical:13,color:"#fff",marginBottom:9},primary:{backgroundColor:theme.pink,borderRadius:14,paddingVertical:14,alignItems:"center",marginTop:3},primaryText:{color:"#fff",fontWeight:"900"},securityNote:{color:theme.dim,fontSize:9,lineHeight:14,marginTop:10},footer:{marginTop:20,padding:18,borderRadius:22,borderWidth:1,borderColor:"rgba(255,216,107,.14)",backgroundColor:"rgba(255,216,107,.035)"},footerIcon:{color:theme.gold,fontSize:22},footerTitle:{color:theme.gold,fontSize:10,fontWeight:"900",letterSpacing:2,marginTop:5},footerText:{color:theme.muted,fontSize:10,lineHeight:16,marginTop:6}
});
