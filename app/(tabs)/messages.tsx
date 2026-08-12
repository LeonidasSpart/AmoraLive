import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

const MOCK_MESSAGES = [
  { id: '1', name: 'Alice', message: 'Hey! When is your next stream?', time: '2m', unread: 2 },
  { id: '2', name: 'Bob', message: 'Thanks for the follow!', time: '1h', unread: 0 },
  { id: '3', name: 'Charlie', message: 'Can we collaborate?', time: '3h', unread: 1 },
];

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={MOCK_MESSAGES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.messageRow}>
            <Image
              source={{ uri: `https://i.pravatar.cc/150?u=${item.id}` }}
              style={styles.avatar}
            />
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.messageText} numberOfLines={1}>
                {item.message}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
