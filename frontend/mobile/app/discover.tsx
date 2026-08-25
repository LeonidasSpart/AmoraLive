import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import AppShell from "../src/AppShell";
import { theme } from "../src/theme";
import { phase1Request } from "../src/phase1Api";

const TABS = ["recommended", "trending", "new", "following", "creators", "categories"];
const CATEGORIES = ["Chat", "Music", "Entertainment", "Gaming", "Lifestyle", "Travel", "Q&A", "Dating"];

export default function Discover() {
  const [tab, setTab] = useState("recommended");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      if (tab === "creators") {
        setCreators(await phase1Request("/discover/creators?type=popular&limit=30"));
        setRooms([]);
        return;
      }
      if (tab === "recommended") {
        setRooms(await phase1Request("/discover/recommended?limit=30"));
        setCreators([]);
        return;
      }
      let url = "/live?limit=30";
      if (tab === "trending") url += "&sort=trending";
      if (tab === "new") url += "&sort=newest";
      if (tab === "following") url += "&following=true";
      if (tab === "categories" && category) url += `&category=${encodeURIComponent(category)}`;
      const data = await phase1Request(url);
      setRooms(Array.isArray(data) ? data : data.rooms || []);
      setCreators([]);
    } catch (e: any) {
      setError(e.message || "Unable to load Discover.");
    } finally { setLoading(false); }
  }, [tab, category]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      try { setSearchResults(await phase1Request(`/discover/search?q=${encodeURIComponent(q)}`)); }
      catch { setSearchResults({ rooms: [], creators: [] }); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const follow = async (id: string, following: boolean) => {
    try {
      await phase1Request(`/users/${id}/${following ? "unfollow" : "follow"}`, { method: "POST" });
      setCreators(x => x.map(c => c.id === id ? { ...c, isFollowing: !following } : c));
    } catch {}
  };

  const roomList = searchResults ? (searchResults.rooms || []) : rooms;
  const creatorList = searchResults ? (searchResults.creators || []) : creators;

  return <AppShell>
    <ScrollView style={s.page} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.kicker}>AMORA DISCOVER</Text>
      <Text style={s.title}>Find your people.</Text>
      <TextInput value={query} onChangeText={setQuery} placeholder="Search creators and live streams…" placeholderTextColor={theme.dim} style={s.search}/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
        {TABS.map(t => <Pressable key={t} onPress={() => setTab(t)} style={[s.tab, tab === t && s.tabActive]}><Text style={s.tabText}>{t[0].toUpperCase()+t.slice(1)}</Text></Pressable>)}
      </ScrollView>
      {tab === "categories" && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
        {CATEGORIES.map(c => <Pressable key={c} onPress={() => setCategory(c)} style={[s.chip, category === c && s.chipActive]}><Text style={s.chipText}>{c}</Text></Pressable>)}
      </ScrollView>}
      {!!error && <Text style={s.error}>{error}</Text>}
      {loading ? <ActivityIndicator color={theme.pink} style={{ marginTop: 40 }}/> :
        <View style={s.grid}>
          {creatorList.map(c => <View key={c.id} style={s.card}>
            <Pressable onPress={() => router.push({ pathname: "/creator/[userId]", params: { userId: c.id } })}>
              {c.profile_photo ? <Image source={{ uri: c.profile_photo }} style={s.avatar}/> : <View style={s.avatar}><Text style={s.avatarLetter}>{(c.display_name||c.username||"?")[0].toUpperCase()}</Text></View>}
            </Pressable>
            <Text style={s.name}>{c.display_name || c.username}</Text>
            <Text style={s.meta}>{c.followerCount ?? 0} followers</Text>
            <View style={s.row}>
              <Pressable style={s.smallBtn} onPress={() => follow(c.id, !!c.isFollowing)}><Text style={s.btnText}>{c.isFollowing ? "Following" : "Follow"}</Text></Pressable>
              <Pressable style={s.smallBtn} onPress={() => router.push({ pathname: "/chat/[userId]", params: { userId: c.id } })}><Text style={s.btnText}>Message</Text></Pressable>
            </View>
          </View>)}
          {roomList.map(r => <Pressable key={r.id} style={s.room} onPress={() => router.push({ pathname: "/live/[id]", params: { id: r.id } })}>
            {r.thumbnail_url ? <Image source={{ uri: r.thumbnail_url }} style={s.thumb}/> : <View style={s.thumb}><Text style={{fontSize:30}}>📺</Text></View>}
            <View style={s.roomBody}><Text style={s.live}>LIVE · {r.viewer_count || 0} viewers</Text><Text style={s.roomTitle}>{r.title || "Untitled"}</Text><Text style={s.meta}>#{r.category || "General"}</Text></View>
          </Pressable>)}
          {!creatorList.length && !roomList.length && <Text style={s.empty}>Nothing to show yet.</Text>}
        </View>}
    </ScrollView>
  </AppShell>;
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:theme.bg,padding:18},kicker:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2.3},title:{color:"#fff",fontSize:30,fontWeight:"900",marginTop:5},search:{marginTop:16,backgroundColor:theme.surface,borderRadius:14,padding:13,color:"#fff",borderWidth:1,borderColor:"rgba(255,255,255,.08)"},tabs:{gap:7,paddingVertical:12},tab:{paddingVertical:8,paddingHorizontal:13,borderRadius:18,borderWidth:1,borderColor:"rgba(255,255,255,.08)"},tabActive:{backgroundColor:theme.pink,borderColor:theme.pink},tabText:{color:"#fff",fontSize:10,fontWeight:"800"},chip:{paddingVertical:7,paddingHorizontal:11,borderRadius:15,backgroundColor:theme.surface},chipActive:{backgroundColor:theme.purple},chipText:{color:"#fff",fontSize:10},error:{color:"#ff8bad",textAlign:"center",marginTop:10},grid:{flexDirection:"row",flexWrap:"wrap",gap:10},card:{width:"48%",padding:13,borderRadius:18,backgroundColor:theme.surface,borderWidth:1,borderColor:"rgba(255,255,255,.08)",alignItems:"center"},avatar:{width:70,height:70,borderRadius:35,backgroundColor:theme.purple,alignItems:"center",justifyContent:"center"},avatarLetter:{fontSize:26,color:"#fff",fontWeight:"900"},name:{color:"#fff",fontWeight:"900",fontSize:12,marginTop:8},meta:{color:theme.dim,fontSize:9,marginTop:3},row:{flexDirection:"row",gap:6,marginTop:9,width:"100%"},smallBtn:{flex:1,paddingVertical:7,borderRadius:9,backgroundColor:theme.pink,alignItems:"center"},btnText:{color:"#fff",fontSize:9,fontWeight:"900"},room:{width:"100%",backgroundColor:theme.surface,borderRadius:18,overflow:"hidden",borderWidth:1,borderColor:"rgba(255,255,255,.08)"},thumb:{width:"100%",height:145,backgroundColor:"#171325",alignItems:"center",justifyContent:"center"},roomBody:{padding:12},live:{color:"#ff6b6b",fontSize:8,fontWeight:"900"},roomTitle:{color:"#fff",fontSize:14,fontWeight:"900",marginTop:4},empty:{color:theme.muted,width:"100%",textAlign:"center",paddingVertical:40}
});
