import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

interface Streamer {
  id: string;
  userId: string;
  title: string;
  viewerCount: number;
  thumbnail?: string;
  user: {
    id: string;
    displayName: string;
    avatar: string;
    country?: string;
  };
  startedAt: string;
  isLive: boolean;
}

function formatViewers(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function LiveCard({ streamer }: { streamer: Streamer }) {
  const router = useRouter();
  const defaultThumbnail = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop';
  const thumbnail = streamer.thumbnail || defaultThumbnail;
  const avatar = streamer.user?.avatar || 'https://i.pravatar.cc/150?u=' + streamer.userId;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/live/${streamer.id}`)}
    >
      <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
      <View style={styles.overlay}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <View style={styles.viewerBadge}>
          <Ionicons name="flame" size={12} color="#fff" />
          <Text style={styles.viewerText}>{formatViewers(streamer.viewerCount || 0)}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.streamerName} numberOfLines={1}>{streamer.title}</Text>
        <View style={styles.streamerInfo}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <Text style={styles.nameText}>{streamer.user?.displayName || 'Unknown'}</Text>
          <Text style={styles.countryText}>{streamer.user?.country || ''}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [streams, setStreams] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadStreams = useCallback(async () => {
    try {
      const response = await api.get('/live/active');
      setStreams(response.data || []);
    } catch {
      setStreams([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadStreams(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStreams();
  };

  const goToCreate = () => {
    router.push('/live/create');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Party Room</Text>
          <View style={styles.headerUnderline} />
        </View>
        <TouchableOpacity style={styles.goLiveButton} onPress={goToCreate}>
          <Ionicons name="radio" size={16} color="#fff" />
          <Text style={styles.goLiveText}>GO LIVE</Text>
        </TouchableOpacity>
      </View>

      {streams.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="radio-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No live streams</Text>
          <Text style={styles.emptySubtitle}>Be the first to start streaming!</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={goToCreate}>
            <Text style={styles.emptyButtonText}>Start a Stream</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={streams}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          renderItem={({ item }) => <LiveCard streamer={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  headerUnderline: { width: 32, height: 4, backgroundColor: Colors.primary, borderRadius: 2, marginTop: 4 },
  goLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  goLiveText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  list: { padding: 12, paddingBottom: 24 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: { width: CARD_WIDTH, height: CARD_WIDTH * 1.25, resizeMode: 'cover' },
  overlay: { position: 'absolute', top: 8, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  viewerText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardFooter: { padding: 10 },
  streamerName: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  streamerInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar: { width: 20, height: 20, borderRadius: 10 },
  nameText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  countryText: { fontSize: 11, color: Colors.textMuted },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginTop: 16 },
  emptySubtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' },
  emptyButton: { marginTop: 24, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  emptyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
