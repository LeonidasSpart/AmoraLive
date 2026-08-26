import {useCallback,useEffect,useState} from "react";
import {ActivityIndicator,Image,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from "react-native";
import {router} from "expo-router";
import AppShell from "../src/AppShell";
import {theme} from "../src/theme";
import {api} from "../src/api/client";
import {phase2Request} from "../src/phase2Api";

const cats=["For You","Live","Creators","Dating","New"];

// Normalizes results from four different real endpoints (rooms have one
// shape, creators have another, search returns both at once) into a
// single flat list the grid can render without caring which endpoint it
// came from.
function normalizeRooms(rooms:any[]){
  return (rooms||[]).map((r:any)=>({key:`room-${r.id}`,kind:"room",id:r.id,title:r.host?.display_name||r.host?.username||r.title,image:r.thumbnail_url||r.host?.profile_photo,isLive:true,meta:r.category||"Live"}));
}
function normalizeCreators(creators:any[]){
  return (creators||[]).map((c:any)=>({key:`creator-${c.id}`,kind:"creator",id:c.id,title:c.display_name||c.username,image:c.profile_photo,isLive:false,meta:c.is_verified?"Verified creator":"Creator"}));
}

export default function Discover(){
 const [items,setItems]=useState<any[]>([]),[category,setCategory]=useState("For You"),[q,setQ]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState("");

 const load=useCallback(async()=>{
  if(category==="Dating"){router.push("/dating");return;}
  setLoading(true);setError("");
  try{
   const query=q.trim();
   if(query){
    const r=await phase2Request(`/discover/search?q=${encodeURIComponent(query)}`);
    setItems([...normalizeRooms(r?.rooms),...normalizeCreators(r?.creators)]);
   }else if(category==="Live"){
    const rooms=await api.liveRooms();
    setItems(normalizeRooms(Array.isArray(rooms)?rooms:rooms?.rooms||[]));
   }else if(category==="Creators"){
    const creators=await phase2Request("/discover/creators?type=popular&limit=30");
    setItems(normalizeCreators(Array.isArray(creators)?creators:[]));
   }else if(category==="New"){
    const creators=await phase2Request("/discover/creators?type=new&limit=30");
    setItems(normalizeCreators(Array.isArray(creators)?creators:[]));
   }else{
    // "For You" — a real personalized ranking, not a placeholder: biased
    // toward categories this account already watches/gifts in, with a
    // trending fallback so it's never empty for a new account.
    const rooms=await phase2Request("/discover/recommended?limit=30");
    setItems(normalizeRooms(Array.isArray(rooms)?rooms:[]));
   }
  }catch(e:any){setError(e.message||"Unable to load Discover.");}
  finally{setLoading(false);}
 },[category,q]);

 useEffect(()=>{load()},[category]);

 return <AppShell><ScrollView style={s.page} contentContainerStyle={{paddingBottom:30}}>
  <Text style={s.kicker}>AMORA</Text><Text style={s.title}>Discover</Text><Text style={s.sub}>Find people, creators and live rooms worth your time.</Text>
  <View style={s.search}><TextInput value={q} onChangeText={setQ} onSubmitEditing={()=>load()} placeholder="Search creators, rooms…" placeholderTextColor={theme.dim} style={s.input}/><Pressable onPress={load} style={s.searchBtn}><Text>⌕</Text></Pressable></View>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical:12}}>{cats.map(c=><Pressable key={c} onPress={()=>setCategory(c)} style={[s.chip,category===c&&s.active]}><Text style={s.chipText}>{c}</Text></Pressable>)}</ScrollView>
  {loading?<ActivityIndicator color={theme.pink} style={{marginTop:30}}/>:error?<Text style={s.error}>{error}</Text>:<View style={s.grid}>{items.map((x,i)=><Pressable key={x.key||i} style={s.card} onPress={()=>x.kind==="room"?router.push({pathname:"/live/[id]",params:{id:String(x.id)}}):router.push({pathname:"/creator/[userId]",params:{userId:String(x.id)}})}>
    {x.image?<Image source={{uri:x.image}} style={s.image}/>:<View style={[s.image,s.placeholder]}><Text style={{fontSize:27}}>💗</Text></View>}
    <Text numberOfLines={1} style={s.name}>{x.title||"Amora member"}</Text>
    <Text numberOfLines={1} style={s.meta}>{x.isLive?"🔴 LIVE":x.meta}</Text>
  </Pressable>)}</View>}
  {!loading&&!items.length&&<Text style={s.empty}>Nothing here yet. Try another category.</Text>}
 </ScrollView></AppShell>
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:theme.bg,padding:16},kicker:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2},title:{color:"#fff",fontSize:31,fontWeight:"900",marginTop:4},sub:{color:theme.muted,fontSize:10,lineHeight:15,marginTop:3},search:{flexDirection:"row",gap:7,marginTop:14},input:{flex:1,height:43,backgroundColor:theme.surface,borderRadius:13,color:"#fff",paddingHorizontal:13,fontSize:10},searchBtn:{width:43,height:43,borderRadius:13,backgroundColor:theme.pink,alignItems:"center",justifyContent:"center"},chip:{paddingVertical:8,paddingHorizontal:12,borderRadius:17,backgroundColor:theme.surface,marginRight:6},active:{backgroundColor:theme.pink},chipText:{color:"#fff",fontSize:9,fontWeight:"800"},grid:{flexDirection:"row",flexWrap:"wrap",gap:9},card:{width:"48%",backgroundColor:theme.surface,borderRadius:16,paddingBottom:10,overflow:"hidden"},image:{width:"100%",height:145,resizeMode:"cover"},placeholder:{alignItems:"center",justifyContent:"center",backgroundColor:"#171522"},name:{color:"#fff",fontSize:11,fontWeight:"900",paddingHorizontal:10,marginTop:8},meta:{color:theme.muted,fontSize:8,paddingHorizontal:10,marginTop:3},error:{color:"#ff8bad",textAlign:"center",marginTop:25},empty:{color:theme.muted,textAlign:"center",marginTop:35}
});
