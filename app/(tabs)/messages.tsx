import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/hooks/useAuthStore';
import { getMatches, getMessages } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

interface Match {
  id: string;
  userAId: string;
  userBId: string;
  userA: { id: string; displayName: string; avatar: string };
  userB: { id: string; displayName: string; avatar: string };
  updatedAt: string;
}

interface MessagePreview {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
}

export default function MessagesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagePreviews, setMessagePreviews] = useState<Record<string, MessagePreview>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const { user } = useAuthStore();
  const router = useRouter();

  const loadMatches = async () => {
    setLoading(true);
    try {
      const data = await getMatches();
      setMatches(data || []);
      // Load last message for each match
      const previews: Record<string, MessagePreview> = {};
      const unreads: Record<string, number> = {};
      for (const match of data) {
        try {
          const msgs = await getMessages(match.id, { limit: 1 });
          if (msgs.messages && msgs.messages.length > 0) {
            previews[match.id] = msgs.messages[0];
            // Count unread messages where receiver is current user
            const unread = msgs.messages.filter(
              (m: any) => m.senderId !== user?.id && !m.readAt
            ).length;
            unreads[match.id] = unread;
          }
        } catch {
          // Skip if no messages
        }
      }
      setMessagePreviews(previews);
      setUnreadCounts(unreads);
    } catch (error) {
      console.error('Load matches error:', error);
      Alert.alert('Error', 'Unable to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const getOtherUser = (match: Match) => {
    return match.userAId === user?.id ? match.userB : match.userA;
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
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
      <Text style={styles.title}>Messages</Text>
      {matches.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>Start swiping to find your match</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const other = getOtherUser(item);
            const preview = messagePreviews[item.id];
            const unread = unreadCounts[item.id] || 0;
            return (
              <TouchableOpacity
                style={styles.messageRow}
                onPress={() => router.push(`/chat/${item.id}`)}
              >
                <Image
                  source={{ uri: other.avatar || 'https://via.placeholder.com/48' }}
                  style={styles.avatar}
                />
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.name}>{other.displayName}</Text>
                    <Text style={styles.time}>
                      {preview ? getTimeAgo(preview.createdAt) : ''}
                    </Text>
                  </View>
                  <Text style={styles.messageText} numberOfLines={1}>
                    {preview ? preview.content : 'No messages yet'}
                  </Text>
                </View>
                {unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  time: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  messageText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.danger || '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
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
