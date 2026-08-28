import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import AppShell from "../src/AppShell";
import { theme } from "../src/theme";
import { api } from "../src/api/client";
import { unregisterPushNotifications } from "../src/push";
import { useTranslation } from "../src/i18n";

export default function Settings(){
 const { lang, setLang, languages, t } = useTranslation();
 const [user,setUser]=useState<any>(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState("");
 const [displayName,setDisplayName]=useState(""),[bio,setBio]=useState("");
 const load=useCallback(async()=>{try{const u=await api.me();setUser(u);setDisplayName(u.display_name||"");setBio(u.bio||"");}catch(e:any){setError(e.message||t("settingsScreen.errorLoad"));}finally{setLoading(false);}},[]);
 useEffect(()=>{load();},[load]);
 const save=async()=>{setSaving(true);setError("");try{await api.updateProfile({display_name:displayName.trim(),bio:bio.trim()});Alert.alert(t("settingsScreen.savedTitle"),t("settingsScreen.savedBody"));}catch(e:any){setError(e.message||t("settingsScreen.errorSave"));}finally{setSaving(false);}};
 const logout=async()=>{await unregisterPushNotifications();await api.logout();router.replace("/auth");};
 const deleteAccount=()=>Alert.alert(t("settingsScreen.deleteAccountTitle"),t("settingsScreen.deleteAccountBody"),[{text:t("common.cancel"),style:"cancel"},{text:t("settingsScreen.deleteWord"),style:"destructive",onPress:async()=>{try{await unregisterPushNotifications();await api.deleteAccount();await api.logout();router.replace("/auth");}catch(e:any){setError(e.message||t("settingsScreen.errorDeleteAccount"));}}}]);
 if(loading)return <AppShell><View style={s.center}><ActivityIndicator color={theme.pink}/></View></AppShell>;
 return <AppShell><ScrollView style={s.page} contentContainerStyle={{paddingBottom:40}}>
  <Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.kicker}>{t("settingsScreen.kicker")}</Text><Text style={s.title}>{t("settingsScreen.title")}</Text>
  {!!error&&<Text style={s.error}>{error}</Text>}
  <View style={s.card}><Text style={s.section}>{t("settingsScreen.profileSection")}</Text><Text style={s.label}>{t("settingsScreen.displayNameLabel")}</Text><TextInput value={displayName} onChangeText={setDisplayName} style={s.input} placeholderTextColor={theme.dim}/><Text style={s.label}>{t("settingsScreen.bioLabel")}</Text><TextInput value={bio} onChangeText={setBio} multiline style={[s.input,s.bio]} placeholderTextColor={theme.dim}/></View>
  <View style={s.card}><Text style={s.section}>{t("settingsScreen.privacySection")}</Text><Pressable style={s.row} onPress={()=>router.push("/security")}><Text style={s.rowText}>{t("settingsScreen.safetySecurityRow")}</Text><Text style={s.arrow}>›</Text></Pressable></View>
  <View style={s.card}><Text style={s.section}>{t("common.language")}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}}>{languages.map(l=><Pressable key={l.code} onPress={()=>setLang(l.code)} style={[s.langChip,lang===l.code&&s.langChipActive]}><Text style={[s.langChipText,lang===l.code&&s.langChipTextActive]}>{l.label}</Text></Pressable>)}</ScrollView></View>
  <Pressable disabled={saving} onPress={save} style={s.save}><Text style={s.saveText}>{saving?t("settingsScreen.savingEllipsis"):t("settingsScreen.saveChanges")}</Text></Pressable>
  <View style={s.card}><Pressable style={s.row} onPress={()=>router.push("/membership")}><Text style={s.rowText}>{t("settingsScreen.membershipRow")}</Text><Text style={s.arrow}>›</Text></Pressable><Pressable style={s.row} onPress={()=>router.push("/wallet")}><Text style={s.rowText}>{t("settingsScreen.walletRow")}</Text><Text style={s.arrow}>›</Text></Pressable><Pressable style={s.row} onPress={()=>router.push("/notifications")}><Text style={s.rowText}>{t("settingsScreen.notificationsRow")}</Text><Text style={s.arrow}>›</Text></Pressable></View>
  <Pressable style={s.logout} onPress={logout}><Text style={s.danger}>{t("settingsScreen.logout")}</Text></Pressable><Pressable style={s.delete} onPress={deleteAccount}><Text style={s.danger}>{t("settingsScreen.deleteMyAccount")}</Text></Pressable>
 </ScrollView></AppShell>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},back:{color:"#fff",fontSize:40},kicker:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2.2},title:{color:"#fff",fontSize:30,fontWeight:"900",marginTop:5},error:{color:"#ff8bad",textAlign:"center",marginVertical:10},card:{backgroundColor:theme.surface,borderRadius:20,padding:16,marginTop:14,borderWidth:1,borderColor:"rgba(255,255,255,.08)"},section:{color:"#fff",fontSize:16,fontWeight:"900",marginBottom:12},label:{color:theme.dim,fontSize:9,marginTop:8,marginBottom:5},input:{backgroundColor:"#11101b",color:"#fff",borderRadius:11,padding:12,borderWidth:1,borderColor:"rgba(255,255,255,.08)"},bio:{minHeight:90,textAlignVertical:"top"},switchRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingVertical:8},row:{flexDirection:"row",alignItems:"center",paddingVertical:13,borderTopWidth:1,borderTopColor:"rgba(255,255,255,.06)"},rowText:{color:"#fff",fontSize:12,fontWeight:"700"},arrow:{color:theme.dim,fontSize:24,marginLeft:"auto"},save:{marginTop:14,backgroundColor:theme.pink,borderRadius:14,paddingVertical:14,alignItems:"center"},saveText:{color:"#fff",fontWeight:"900"},logout:{marginTop:18,borderRadius:14,padding:14,alignItems:"center",backgroundColor:"rgba(255,255,255,.05)"},delete:{marginTop:8,padding:14,alignItems:"center"},danger:{color:"#ff6b6b",fontWeight:"800"},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:theme.bg},
langChip:{paddingVertical:8,paddingHorizontal:14,borderRadius:16,backgroundColor:"#11101b",borderWidth:1,borderColor:"rgba(255,255,255,.08)"},langChipActive:{backgroundColor:theme.pink,borderColor:theme.pink},langChipText:{color:theme.dim,fontSize:11,fontWeight:"700"},langChipTextActive:{color:"#fff"}
});
