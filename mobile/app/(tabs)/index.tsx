import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../utils/api';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../hooks/useAuthStore';
import { Eye } from 'lucide-react-native';

interface Stream {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  viewerCount: number;
  streamer: { username: string; displayName: string; avatar: string; isVerified: boolean };
}

export default function LiveScreen() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  const fetchStreams = async () => {
    const res = await api.get('/api/streams/live', token || undefined);
    const data = await res.json();
    setStreams(data.streams || []);
  };

  useEffect(() => { fetchStreams(); }, []);

  const renderStream = ({ item }: { item: Stream }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/stream/${item.id}`)}>
      <Image source={{ uri: item.thumbnail || 'https://via.placeholder.com/300x200' }} style={styles.thumbnail} />
      <View style={styles.overlay}>
        <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE</Text></View>
        <View style={styles.viewerBadge}><Eye size={14} color="#fff" /><Text style={styles.viewerText}>{item.viewerCount}</Text></View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.streamer}>{item.streamer.displayName || item.streamer.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Party Room</Text>
      <FlatList
        data={streams}
        renderItem={renderStream}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStreams} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { fontSize: 28, fontWeight: 'bold', color: Colors.dark.text, padding: 16, paddingTop: 60 },
  list: { padding: 8 },
  card: { flex: 1, margin: 8, backgroundColor: Colors.dark.card, borderRadius: 16, overflow: 'hidden' },
  thumbnail: { width: '100%', height: 180, borderRadius: 16 },
  overlay: { position: 'absolute', top: 8, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between' },
  liveBadge: { backgroundColor: '#e63946', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  liveText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  viewerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  viewerText: { color: '#fff', fontSize: 12, marginLeft: 4 },
  info: { padding: 12 },
  title: { color: Colors.dark.text, fontSize: 14, fontWeight: '600' },
  streamer: { color: Colors.dark.tabIconDefault, fontSize: 12, marginTop: 4 },
});
