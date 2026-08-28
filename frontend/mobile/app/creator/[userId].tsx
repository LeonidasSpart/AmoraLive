import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AppShell from "../../src/AppShell";
import { theme } from "../../src/theme";
import { api } from "../../src/api/client";
import { useTranslation } from "../../src/i18n";

export default function CreatorProfile(){
 const {t}=useTranslation();
 const {userId}=useLocalSearchParams<{userId:string}>(); const [user,setUser]=useState<any>(null),[following,setFollowing]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=useCallback(async()=>{if(!userId)return;try{const [u,f]=await Promise.all([api.user(String(userId)),api.followStatus(String(userId))]);setUser(u);setFollowing(!!(f?.following??f?.isFollowing));}catch(e:any){setError(e.message||t("creatorProfileScreen.errorLoad"));}finally{setLoading(false);}},[userId]);
 useEffect(()=>{load();},[load]);
 const toggle=async()=>{try{if(following)await api.unfollowUser(String(userId));else await api.followUser(String(userId));setFollowing(!following);}catch(e:any){setError(e.message||t("creatorProfileScreen.errorUpdateFollow"));}};
 if(loading)return <AppShell><View style={s.center}><ActivityIndicator color={theme.pink}/></View></AppShell>;
 if(!user)return <AppShell><Text style={s.error}>{error||t("creatorProfileScreen.notFound")}</Text></AppShell>;
 return <AppShell><ScrollView style={s.page} contentContainerStyle={{paddingBottom:40}}><Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable>
  <View style={s.hero}>{user.profile_photo?<Image source={{uri:user.profile_photo}} style={s.avatar}/>:<View style={[s.avatar,s.placeholder]}><Text style={{fontSize:48}}>👤</Text></View>}<Text style={s.name}>{user.display_name||user.username}</Text><Text style={s.handle}>@{user.username}</Text>{user.bio&&<Text style={s.bio}>{user.bio}</Text>}<View style={s.stats}><Text style={s.stat}>{user.follower_count??user.followerCount??0}{"\n"}{t("creatorProfileScreen.followersSuffix")}</Text><Text style={s.stat}>{user.level??0}{"\n"}{t("creatorProfileScreen.levelWord")}</Text></View><View style={s.actions}><Pressable style={s.primary} onPress={toggle}><Text style={s.btn}>{following?t("creatorProfileScreen.following"):t("creatorProfileScreen.follow")}</Text></Pressable><Pressable style={s.secondary} onPress={()=>router.push({pathname:"/chat/[userId]",params:{userId:String(userId)}})}><Text style={s.btn}>{t("creatorProfileScreen.message")}</Text></Pressable></View></View>
  {!!error&&<Text style={s.error}>{error}</Text>}
 </ScrollView></AppShell>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:18},back:{color:"#fff",fontSize:40},hero:{backgroundColor:theme.surface,borderRadius:26,padding:22,alignItems:"center",borderWidth:1,borderColor:"rgba(255,255,255,.08)"},avatar:{width:120,height:120,borderRadius:60},placeholder:{backgroundColor:theme.purple,alignItems:"center",justifyContent:"center"},name:{color:"#fff",fontSize:25,fontWeight:"900",marginTop:14},handle:{color:theme.dim,fontSize:10,marginTop:3},bio:{color:theme.muted,textAlign:"center",lineHeight:18,marginTop:12},stats:{flexDirection:"row",gap:35,marginTop:18},stat:{color:"#fff",textAlign:"center",fontSize:11,fontWeight:"800",lineHeight:18},actions:{flexDirection:"row",gap:8,width:"100%",marginTop:20},primary:{flex:1,backgroundColor:theme.pink,borderRadius:13,paddingVertical:13,alignItems:"center"},secondary:{flex:1,backgroundColor:theme.purple,borderRadius:13,paddingVertical:13,alignItems:"center"},btn:{color:"#fff",fontWeight:"900"},error:{color:"#ff8bad",textAlign:"center",marginTop:12},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:theme.bg}
});
