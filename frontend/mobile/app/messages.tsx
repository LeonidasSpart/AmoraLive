import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Image } from "react-native";
import { theme } from "../src/theme";
import { api } from "../src/api/client";
import AppShell from "../src/AppShell";

type Conversation = {
  id: string;
  username: string;
  display_name: string;
  profile_photo: string | null;
  online_status: string;
  last_message: string;
  last_message_time: string;
  unread_count: number | string;
};

function timeAgo(value: string) {
  if (!value) return "";
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d` : new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.conversations();
      setConversations(Array.isArray(data) ? data : []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Unable to load your messages.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <AppShell>
      <View style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.kicker}>AMORA PRIVATE</Text>
            <Text style={s.title}>Messages</Text>
          </View>
          <Pressable style={s.sparkle}><Text style={s.sparkleText}>✦</Text></Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.pink} style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={s.empty}>
            <Text style={s.big}>!</Text>
            <Text style={s.emptyTitle}>Something went wrong</Text>
            <Text style={s.muted}>{error}</Text>
            <Pressable style={s.retry} onPress={load}><Text style={s.retryText}>Try again</Text></Pressable>
          </View>
        ) : conversations.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyOrb}><Text style={s.big}>♡</Text></View>
            <Text style={s.emptyTitle}>Your private space</Text>
            <Text style={s.muted}>Your matches and conversations will appear here.</Text>
            <Pressable style={s.primary} onPress={() => router.push("/video-match")}><Text style={s.primaryText}>Start matching →</Text></Pressable>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.pink} />}
            renderItem={({ item }) => {
              const unread = Number(item.unread_count) || 0;
              return (
                <Pressable style={s.card} onPress={() => router.push(`/chat/${item.id}`)}>
                  <View style={s.avatarWrap}>
                    {item.profile_photo
                      ? <Image source={{ uri: item.profile_photo }} style={s.avatarImage} />
                      : <View style={s.avatar}><Text style={s.avatarText}>{(item.display_name || item.username || "A")[0].toUpperCase()}</Text></View>}
                    {item.online_status === "online" && <View style={s.online} />}
                  </View>
                  <View style={s.info}>
                    <View style={s.nameRow}>
                      <Text style={s.name} numberOfLines={1}>{item.display_name || item.username}</Text>
                      <Text style={s.time}>{timeAgo(item.last_message_time)}</Text>
                    </View>
                    <Text style={[s.msg, unread > 0 && s.msgUnread]} numberOfLines={1}>
                      {item.last_message || "Start a conversation…"}
                    </Text>
                  </View>
                  {unread > 0 && <View style={s.badge}><Text style={s.badgeText}>{unread > 99 ? "99+" : unread}</Text></View>}
                  <Text style={s.arrow}>›</Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </AppShell>
  );
}

const s = StyleSheet.create({
  page:{flex:1,backgroundColor:theme.bg,padding:18},
  header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingTop:8,marginBottom:18},
  kicker:{color:theme.pinkSoft,fontSize:8,fontWeight:"900",letterSpacing:2.4},
  title:{fontSize:30,fontWeight:"900",color:"#fff",marginTop:3},
  sparkle:{width:42,height:42,borderRadius:15,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255,79,163,.08)",borderWidth:1,borderColor:"rgba(255,79,163,.2)"},
  sparkleText:{color:theme.gold,fontSize:20},
  card:{backgroundColor:theme.surface,borderRadius:20,padding:13,flexDirection:"row",alignItems:"center",gap:11,marginBottom:9,borderWidth:1,borderColor:"rgba(255,255,255,.08)",shadowColor:"#000",shadowOpacity:.2,shadowRadius:15,shadowOffset:{width:0,height:7}},
  avatarWrap:{width:48,height:48,position:"relative"},
  avatar:{width:48,height:48,borderRadius:24,backgroundColor:theme.purple,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:"rgba(255,255,255,.18)"},
  avatarImage:{width:48,height:48,borderRadius:24,borderWidth:1,borderColor:"rgba(255,255,255,.18)"},
  avatarText:{color:"#fff",fontWeight:"900",fontSize:18},
  online:{position:"absolute",right:0,bottom:0,width:12,height:12,borderRadius:6,backgroundColor:theme.success,borderWidth:2,borderColor:theme.surface},
  info:{flex:1,minWidth:0},
  nameRow:{flexDirection:"row",alignItems:"center",gap:7},
  name:{color:"#fff",fontWeight:"900",fontSize:14,flex:1},
  time:{color:theme.dim,fontSize:9},
  msg:{color:theme.muted,fontSize:11,marginTop:5},
  msgUnread:{color:"#fff",fontWeight:"800"},
  badge:{minWidth:23,height:23,borderRadius:12,backgroundColor:theme.pink,alignItems:"center",justifyContent:"center",paddingHorizontal:6},
  badgeText:{color:"#fff",fontSize:9,fontWeight:"900"},
  arrow:{color:theme.dim,fontSize:26},
  empty:{flex:1,alignItems:"center",justifyContent:"center",paddingHorizontal:25,paddingBottom:60},
  emptyOrb:{width:100,height:100,borderRadius:50,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255,79,163,.07)",borderWidth:1,borderColor:"rgba(255,79,163,.2)"},
  big:{fontSize:54,color:theme.pink},
  emptyTitle:{fontSize:21,fontWeight:"900",color:"#fff",marginTop:14},
  muted:{color:theme.muted,textAlign:"center",marginTop:7,fontSize:12,lineHeight:18},
  primary:{marginTop:18,backgroundColor:theme.pink,borderRadius:14,paddingHorizontal:22,paddingVertical:13,shadowColor:theme.pink,shadowOpacity:.3,shadowRadius:18,shadowOffset:{width:0,height:7}},
  primaryText:{color:"#fff",fontWeight:"900"},
  retry:{marginTop:15,borderWidth:1,borderColor:theme.border,borderRadius:12,paddingHorizontal:20,paddingVertical:10},
  retryText:{color:"#fff",fontWeight:"800"}
});
