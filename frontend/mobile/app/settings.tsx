import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import AppShell from "../src/AppShell";
import { theme } from "../src/theme";
import { api } from "../src/api/client";
import { unregisterPushNotifications } from "../src/push";

export default function Settings(){
 const [user,setUser]=useState<any>(null),[privacy,setPrivacy]=useState<any>({}),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState("");
 const [displayName,setDisplayName]=useState(""),[bio,setBio]=useState(""),[emailNotifications,setEmailNotifications]=useState(true);
 const load=useCallback(async()=>{try{const [u,p]=await Promise.all([api.me(),api.privacy()]);setUser(u);setDisplayName(u.display_name||"");setBio(u.bio||"");setPrivacy(p||{});setEmailNotifications(p?.emailNotifications!==false);}catch(e:any){setError(e.message||"Unable to load settings.");}finally{setLoading(false);}},[]);
 useEffect(()=>{load();},[load]);
 const save=async()=>{setSaving(true);setError("");try{await api.updateProfile({display_name:displayName.trim(),bio:bio.trim()});await api.updatePrivacy({emailNotifications});Alert.alert("Saved","Your settings have been updated.");}catch(e:any){setError(e.message||"Unable to save settings.");}finally{setSaving(false);}};
 const logout=async()=>{await unregisterPushNotifications();await api.logout();router.replace("/auth");};
 const deleteAccount=()=>Alert.alert("Delete your Amora account?","This permanently removes your account and cannot be undone.",[{text:"Cancel",style:"cancel"},{text:"Delete",style:"destructive",onPress:async()=>{try{await unregisterPushNotifications();await api.deleteAccount();await api.logout();router.replace("/auth");}catch(e:any){setError(e.message||"Unable to delete account.");}}}]);
 if(loading)return <AppShell><View style={s.center}><ActivityIndicator color={theme.pink}/></View></AppShell>;
 return <AppShell><ScrollView style={s.page} contentContainerStyle={{paddingBottom:40}}>
  <Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.kicker}>AMORA ACCOUNT</Text><Text style={s.title}>Settings</Text>
  {!!error&&<Text style={s.error}>{error}</Text>}
  <View style={s.card}><Text style={s.section}>Profile</Text><Text style={s.label}>Display name</Text><TextInput value={displayName} onChangeText={setDisplayName} style={s.input} placeholderTextColor={theme.dim}/><Text style={s.label}>Bio</Text><TextInput value={bio} onChangeText={setBio} multiline style={[s.input,s.bio]} placeholderTextColor={theme.dim}/></View>
  <View style={s.card}><Text style={s.section}>Privacy</Text><View style={s.switchRow}><Text style={s.rowText}>Email notifications</Text><Switch value={emailNotifications} onValueChange={setEmailNotifications}/></View><Pressable style={s.row} onPress={()=>router.push("/security")}><Text style={s.rowText}>🛡️ Safety & Security</Text><Text style={s.arrow}>›</Text></Pressable></View>
  <Pressable disabled={saving} onPress={save} style={s.save}><Text style={s.saveText}>{saving?"Saving…":"Save changes"}</Text></Pressable>
  <View style={s.card}><Pressable style={s.row} onPress={()=>router.push("/membership")}><Text style={s.rowText}>Membership & VIP</Text><Text style={s.arrow}>›</Text></Pressable><Pressable style={s.row} onPress={()=>router.push("/wallet")}><Text style={s.rowText}>Wallet & Coins</Text><Text style={s.arrow}>›</Text></Pressable><Pressable style={s.row} onPress={()=>router.push("/notifications")}><Text style={s.rowText}>Notifications</Text><Text style={s.arrow}>›</Text></Pressable></View>
  <Pressable style={s.logout} onPress={logout}><Text style={s.danger}>Log out</Text></Pressable><Pressable style={s.delete} onPress={deleteAccount}><Text style={s.danger}>Delete my account</Text></Pressable>
 </ScrollView></AppShell>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},back:{color:"#fff",fontSize:40},kicker:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2.2},title:{color:"#fff",fontSize:30,fontWeight:"900",marginTop:5},error:{color:"#ff8bad",textAlign:"center",marginVertical:10},card:{backgroundColor:theme.surface,borderRadius:20,padding:16,marginTop:14,borderWidth:1,borderColor:"rgba(255,255,255,.08)"},section:{color:"#fff",fontSize:16,fontWeight:"900",marginBottom:12},label:{color:theme.dim,fontSize:9,marginTop:8,marginBottom:5},input:{backgroundColor:"#11101b",color:"#fff",borderRadius:11,padding:12,borderWidth:1,borderColor:"rgba(255,255,255,.08)"},bio:{minHeight:90,textAlignVertical:"top"},switchRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingVertical:8},row:{flexDirection:"row",alignItems:"center",paddingVertical:13,borderTopWidth:1,borderTopColor:"rgba(255,255,255,.06)"},rowText:{color:"#fff",fontSize:12,fontWeight:"700"},arrow:{color:theme.dim,fontSize:24,marginLeft:"auto"},save:{marginTop:14,backgroundColor:theme.pink,borderRadius:14,paddingVertical:14,alignItems:"center"},saveText:{color:"#fff",fontWeight:"900"},logout:{marginTop:18,borderRadius:14,padding:14,alignItems:"center",backgroundColor:"rgba(255,255,255,.05)"},delete:{marginTop:8,padding:14,alignItems:"center"},danger:{color:"#ff6b6b",fontWeight:"800"},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:theme.bg}
});
