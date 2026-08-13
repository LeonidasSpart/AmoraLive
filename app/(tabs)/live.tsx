import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { useAuthStore } from '@/hooks/useAuthStore';

interface Stream {
  id: string;
  userId: string;
  title: string;
  viewerCount: number;
  user: {
    id: string;
    displayName: string;
    avatar: string;
  };
  startedAt: string;
}

export default function LiveScreen() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  const loadStreams = async () => {
    try {
      const response = await api.get('/live/active');
      setStreams(response.data || []);
    } catch (error) {
      console.error('Load streams error:', error);
      // If endpoint not implemented, just set empty array
      setStreams([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStreams();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStreams();
  };

  const goToCreate = () => {
    router.push('/live/create');
  };

  const goToStream = (streamId: string) => {
    router.push(`/live/${streamId}`);
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
        <Text style={styles.headerTitle}>Live Streams</Text>
        <TouchableOpacity onPress={goToCreate} style={styles.goLiveButton}>
          <Ionicons name="radio" size={20} color="#fff" />
          <Text style={styles.goLiveText}>Go Live</Text>
        </TouchableOpacity>
      </View>

      {streams.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="radio-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No live streams</Text>
          <Text style={styles.emptySubtitle}>Be the first to start streaming!</Text>
        </View>
      ) : (
        <FlatList
          data={streams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.streamCard} onPress={() => goToStream(item.id)}>
              <View style={styles.streamHeader}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
                <Text style={styles.viewerCount}>
                  <Ionicons name="eye-outline" size={14} /> {item.viewerCount || 0}
                </Text>
              </View>
              <Text style={styles.streamTitle} numberOfLines={1}>{item.title}</Text>
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>{item.user?.displayName || 'Unknown'}</Text>
                <Text style={styles.streamTime}>
                  {new Date(item.startedAt).toLocaleTimeString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  goLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  goLiveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  streamCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    marginRight: 4,
  },
  liveText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 12,
  },
  viewerCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  hostInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  streamTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
