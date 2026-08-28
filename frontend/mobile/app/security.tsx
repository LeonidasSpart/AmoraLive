import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { theme } from "../src/theme";
import { api } from "../src/api/client";
import { unregisterPushNotifications } from "../src/push";
import { useTranslation } from "../src/i18n";

type Session = { id: string; device_info?: string | null; ip_address?: string | null; created_at: string; expires_at: string };
type SecurityOverview = { score: number; recommendations: string[]; emailVerified: boolean; ageVerified: boolean; privacyConfigured: boolean; activeSessions: number };

function scoreLabel(score: number, t: (k: string) => string) {
  if (score >= 90) return t("securityScreen.excellentProtection");
  if (score >= 75) return t("securityScreen.strongProtection");
  if (score >= 60) return t("securityScreen.goodProtection");
  return t("securityScreen.protectionNeedsAttention");
}

export default function Security() {
  const { t } = useTranslation();
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
      Alert.alert(t("securityScreen.alertTitle"), e.message || t("securityScreen.errorLoad"));
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
      Alert.alert(t("securityScreen.privacyAlertTitle"), e.message || t("securityScreen.errorUpdatePrivacy"));
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 10) return Alert.alert(t("securityScreen.passwordAlertTitle"), t("securityScreen.useAtLeast10"));
    if (newPassword !== confirmPassword) return Alert.alert(t("securityScreen.passwordAlertTitle"), t("securityScreen.passwordsDontMatch"));
    setBusy("password");
    try {
      await api.changePassword(currentPassword, newPassword);
      await unregisterPushNotifications();
      await api.logout();
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      Alert.alert(t("securityScreen.passwordChangedTitle"), t("securityScreen.passwordChangedBody"), [{ text: t("securityScreen.signIn"), onPress: () => router.replace("/auth") }]);
    } catch (e: any) {
      Alert.alert(t("securityScreen.passwordAlertTitle"), e.message || t("securityScreen.errorChangePassword"));
    } finally { setBusy(null); }
  };

  const revoke = async (sessionId: string) => {
    setBusy(sessionId);
    try {
      await api.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e: any) {
      Alert.alert(t("securityScreen.deviceAlertTitle"), e.message || t("securityScreen.errorRevokeSession"));
    } finally { setBusy(null); }
  };

  const revokeOthers = async () => {
    setBusy("others");
    try {
      const result = await api.revokeOtherSessions();
      Alert.alert(t("securityScreen.devicesSecuredTitle"), `${result.revokedCount || 0} ${result.revokedCount === 1 ? t("securityScreen.otherSessionRevoked") : t("securityScreen.otherSessionsRevoked")}`);
      await load();
    } catch (e: any) {
      Alert.alert(t("securityScreen.devicesAlertTitle"), e.message || t("securityScreen.errorRevokeOthers"));
    } finally { setBusy(null); }
  };

  if (loading) return <View style={[s.page, s.center]}><ActivityIndicator color={theme.pink} /></View>;

  return <ScrollView style={s.page} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <Pressable onPress={() => router.back()}><Text style={s.back}>‹</Text></Pressable>
    <Text style={s.kicker}>{t("securityScreen.kicker")}</Text>
    <Text style={s.title}>{t("securityScreen.title")}</Text>
    <Text style={s.subtitle}>{t("securityScreen.subtitle")}</Text>

    <View style={s.scoreCard}>
      <View style={s.scoreGlow} />
      <View style={s.scoreCircle}><Text style={s.score}>{overview?.score ?? 0}</Text><Text style={s.scoreOf}>/100</Text></View>
      <View style={{ flex: 1 }}><Text style={s.scoreTitle}>{scoreLabel(overview?.score ?? 0, t)}</Text><Text style={s.scoreText}>{overview?.recommendations?.[0] || t("securityScreen.defaultRecommendation")}</Text></View>
    </View>

    <View style={s.statusGrid}>
      {[
        [overview?.emailVerified, t("securityScreen.emailVerified"), "✉️"],
        [overview?.ageVerified, t("securityScreen.ageVerified"), "🛡️"],
        [overview?.privacyConfigured, t("securityScreen.privacyConfigured"), "🔒"],
        [Boolean(overview?.activeSessions && overview.activeSessions <= 5), t("securityScreen.devicesMonitored"), "📱"]
      ].map(([ok, label, icon]) => <View key={String(label)} style={s.status}><Text style={s.statusIcon}>{icon}</Text><Text style={s.statusLabel}>{label}</Text><Text style={[s.statusState, { color: ok ? theme.success : theme.gold }]}>{ok ? t("securityScreen.protectedWord") : t("securityScreen.review")}</Text></View>)}
    </View>

    <Text style={s.section}>{t("securityScreen.privacyShield")}</Text>
    <View style={s.panel}>
      {[
        ["online_status_visible", t("securityScreen.showOnlineStatus"), t("securityScreen.showOnlineStatusHint")],
        ["profile_visible", t("securityScreen.discoverableProfile"), t("securityScreen.discoverableProfileHint")],
        ["show_age", t("securityScreen.showAge"), t("securityScreen.showAgeHint")],
        ["show_location", t("securityScreen.showLocation"), t("securityScreen.showLocationHint")],
      ].map(([key, label, hint]) => <View key={key} style={s.settingRow}><View style={{ flex: 1 }}><Text style={s.settingTitle}>{label}</Text><Text style={s.settingHint}>{hint}</Text></View><Switch value={Boolean(privacy[key])} onValueChange={(v) => updatePrivacy(key, v)} trackColor={{ false: "#332743", true: theme.purple }} thumbColor="#fff" /></View>)}
    </View>

    <Text style={s.section}>{t("securityScreen.yourDevices")}</Text>
    <View style={s.panel}>
      {sessions.map((session, index) => <View key={session.id} style={s.deviceRow}><View style={s.deviceIcon}><Text>📱</Text></View><View style={{ flex: 1 }}><Text style={s.settingTitle} numberOfLines={1}>{session.device_info || t("securityScreen.unknownDevice")}</Text><Text style={s.settingHint}>{session.ip_address || t("securityScreen.protectedConnection")} · {index === 0 ? t("securityScreen.mostRecent") : new Date(session.created_at).toLocaleDateString()}</Text></View><Pressable disabled={busy === session.id} onPress={() => revoke(session.id)} style={s.revoke}><Text style={s.revokeText}>{busy === session.id ? "…" : t("securityScreen.revoke")}</Text></Pressable></View>)}
      {sessions.length > 1 && <Pressable disabled={busy === "others"} onPress={revokeOthers} style={s.revokeAll}><Text style={s.revokeAllText}>{busy === "others" ? t("securityScreen.securingEllipsis") : t("securityScreen.logOutAllOtherDevices")}</Text></Pressable>}
    </View>

    <Text style={s.section}>{t("securityScreen.changePasswordSection")}</Text>
    <View style={s.panel}>
      <TextInput value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder={t("securityScreen.currentPasswordPlaceholder")} placeholderTextColor="#756b85" style={s.input} />
      <TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder={t("securityScreen.newPasswordPlaceholder")} placeholderTextColor="#756b85" style={s.input} />
      <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder={t("securityScreen.confirmPasswordPlaceholder")} placeholderTextColor="#756b85" style={s.input} />
      <Pressable disabled={busy === "password"} onPress={changePassword} style={s.primary}><Text style={s.primaryText}>{busy === "password" ? t("securityScreen.securingEllipsis") : t("securityScreen.changePasswordSecurely")}</Text></Pressable>
      <Text style={s.securityNote}>{t("securityScreen.securityNote")}</Text>
    </View>

    <View style={s.footer}><Text style={s.footerIcon}>✦</Text><Text style={s.footerTitle}>{t("securityScreen.footerTitle")}</Text><Text style={s.footerText}>{t("securityScreen.footerText")}</Text></View>
  </ScrollView>;
}

const s = StyleSheet.create({
  page:{flex:1,backgroundColor:theme.bg},content:{padding:20,paddingBottom:50},center:{alignItems:"center",justifyContent:"center"},back:{fontSize:42,color:"#fff",lineHeight:42},kicker:{color:theme.gold,fontSize:9,fontWeight:"900",letterSpacing:2.5,marginTop:4},title:{color:"#fff",fontSize:32,fontWeight:"900",marginTop:5},subtitle:{color:theme.muted,fontSize:12,lineHeight:18,marginTop:5,marginBottom:18},scoreCard:{position:"relative",overflow:"hidden",flexDirection:"row",alignItems:"center",gap:16,padding:18,borderRadius:26,borderWidth:1,borderColor:"rgba(255,216,107,.22)",backgroundColor:"#151024",shadowColor:theme.pink,shadowOpacity:.16,shadowRadius:30,shadowOffset:{width:0,height:14}},scoreGlow:{position:"absolute",width:220,height:220,borderRadius:110,right:-100,top:-100,backgroundColor:"rgba(155,53,255,.18)"},scoreCircle:{width:82,height:82,borderRadius:41,borderWidth:2,borderColor:theme.gold,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255,216,107,.07)"},score:{color:theme.gold,fontSize:28,fontWeight:"900"},scoreOf:{color:theme.muted,fontSize:9,marginTop:-4},scoreTitle:{color:"#fff",fontSize:16,fontWeight:"900"},scoreText:{color:theme.muted,fontSize:10,lineHeight:15,marginTop:4},statusGrid:{flexDirection:"row",flexWrap:"wrap",gap:9,marginTop:12},status:{width:"48%",padding:13,borderRadius:18,backgroundColor:theme.surface,borderWidth:1,borderColor:"rgba(255,255,255,.07)"},statusIcon:{fontSize:18},statusLabel:{color:"#fff",fontSize:11,fontWeight:"800",marginTop:7},statusState:{fontSize:9,fontWeight:"900",marginTop:3},section:{color:"#fff",fontSize:18,fontWeight:"900",marginTop:24,marginBottom:10},panel:{padding:14,borderRadius:22,borderWidth:1,borderColor:"rgba(255,255,255,.08)",backgroundColor:theme.surface},settingRow:{flexDirection:"row",alignItems:"center",gap:12,paddingVertical:12,borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,.05)"},settingTitle:{color:"#fff",fontSize:13,fontWeight:"800"},settingHint:{color:theme.dim,fontSize:9,lineHeight:14,marginTop:3},deviceRow:{flexDirection:"row",alignItems:"center",gap:10,paddingVertical:11,borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,.05)"},deviceIcon:{width:38,height:38,borderRadius:12,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(139,77,255,.12)"},revoke:{paddingHorizontal:9,paddingVertical:7,borderRadius:9,borderWidth:1,borderColor:"rgba(255,255,255,.09)"},revokeText:{color:"#ff9abf",fontSize:9,fontWeight:"900"},revokeAll:{marginTop:12,paddingVertical:12,borderRadius:13,alignItems:"center",borderWidth:1,borderColor:"rgba(255,92,120,.25)",backgroundColor:"rgba(255,92,120,.06)"},revokeAllText:{color:"#ff9abf",fontSize:11,fontWeight:"900"},input:{backgroundColor:"#0e0a17",borderRadius:14,borderWidth:1,borderColor:"rgba(255,255,255,.08)",paddingHorizontal:14,paddingVertical:13,color:"#fff",marginBottom:9},primary:{backgroundColor:theme.pink,borderRadius:14,paddingVertical:14,alignItems:"center",marginTop:3},primaryText:{color:"#fff",fontWeight:"900"},securityNote:{color:theme.dim,fontSize:9,lineHeight:14,marginTop:10},footer:{marginTop:20,padding:18,borderRadius:22,borderWidth:1,borderColor:"rgba(255,216,107,.14)",backgroundColor:"rgba(255,216,107,.035)"},footerIcon:{color:theme.gold,fontSize:22},footerTitle:{color:theme.gold,fontSize:10,fontWeight:"900",letterSpacing:2,marginTop:5},footerText:{color:theme.muted,fontSize:10,lineHeight:16,marginTop:6}
});
