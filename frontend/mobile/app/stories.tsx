import {useCallback,useEffect,useState} from "react";
import {ActivityIndicator,Image,Pressable,ScrollView,StyleSheet,Text,View} from "react-native";
import {router} from "expo-router";
import AppShell from "../src/AppShell";
import {theme} from "../src/theme";
import {phase3Api} from "../src/phase3Api";

export default function Stories(){
 const [stories,setStories]=useState<any[]>([]),[loading,setLoading]=useState(true),[selected,setSelected]=useState<any>(null),[error,setError]=useState("");
 const load=useCallback(async()=>{try{const r=await phase3Api.stories();setStories(r?.stories||r||[])}catch(e:any){setError(e.message||"Unable to load stories.")}finally{setLoading(false)}},[]);
 useEffect(()=>{load()},[load]);
 const open=async(st:any)=>{setSelected(st);try{await phase3Api.viewStory(String(st.id))}catch{}};
 return <AppShell><ScrollView style={s.page} contentContainerStyle={{paddingBottom:30}}>
  <View style={s.header}><Pressable onPress={()=>router.back()}><Text style={s.back}>‹</Text></Pressable><View><Text style={s.kicker}>AMORA</Text><Text style={s.title}>Stories</Text></View><Pressable style={s.add} onPress={()=>router.push("/stories/create")}><Text style={s.addText}>＋</Text></Pressable></View>
  {loading?<ActivityIndicator color={theme.pink}/>:error?<Text style={s.error}>{error}</Text>:<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:10,paddingVertical:18}}>
   {stories.map((x,i)=><Pressable key={x.id||i} onPress={()=>open(x)} style={s.story}><View style={s.ring}><Image source={{uri:x.profile_photo||x.user?.profile_photo||x.thumbnail_url}} style={s.avatar}/></View><Text numberOfLines={1} style={s.user}>{x.display_name||x.username||x.user?.display_name||"Amora"}</Text></Pressable>)}
  </ScrollView>}
  {!stories.length&&!loading&&<Text style={s.empty}>No stories yet. Be the first to share a moment.</Text>}
  {selected&&<View style={s.viewer}><Image source={{uri:selected.media_url||selected.image_url||selected.video_url}} style={s.media}/><View style={s.viewerBar}><Text style={s.viewerName}>{selected.display_name||selected.username||selected.user?.display_name}</Text><Pressable onPress={()=>setSelected(null)}><Text style={s.close}>×</Text></Pressable></View><Text style={s.caption}>{selected.caption||""}</Text><View style={s.reactions}>{["❤️","🔥","😍","👏"].map(r=><Pressable key={r} onPress={()=>phase3Api.reactStory(String(selected.id),r)}><Text style={s.react}>{r}</Text></Pressable>)}</View></View>}
 </ScrollView></AppShell>
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:16},header:{flexDirection:"row",alignItems:"center",gap:10},back:{color:"#fff",fontSize:40},kicker:{color:theme.pinkSoft,fontSize:7,fontWeight:"900",letterSpacing:2},title:{color:"#fff",fontSize:25,fontWeight:"900"},add:{marginLeft:"auto",width:37,height:37,borderRadius:19,backgroundColor:theme.pink,alignItems:"center",justifyContent:"center"},addText:{color:"#fff",fontSize:23},story:{width:74,alignItems:"center"},ring:{width:66,height:66,borderRadius:33,padding:2,borderWidth:2,borderColor:theme.pink},avatar:{width:"100%",height:"100%",borderRadius:31,backgroundColor:theme.surface},user:{color:"#fff",fontSize:8,fontWeight:"800",marginTop:5},empty:{color:theme.muted,textAlign:"center",marginTop:40},error:{color:"#ff8bad",textAlign:"center",marginTop:30},viewer:{position:"absolute",left:0,right:0,top:0,bottom:0,backgroundColor:"#05050a",borderRadius:20,overflow:"hidden",minHeight:600},media:{width:"100%",height:"100%",resizeMode:"cover"},viewerBar:{position:"absolute",top:14,left:14,right:14,flexDirection:"row",alignItems:"center"},viewerName:{color:"#fff",fontWeight:"900",fontSize:12,flex:1},close:{color:"#fff",fontSize:32},caption:{position:"absolute",left:18,right:18,bottom:75,color:"#fff",fontSize:12},reactions:{position:"absolute",bottom:15,left:18,right:18,flexDirection:"row",justifyContent:"space-around"},react:{fontSize:26}
});
