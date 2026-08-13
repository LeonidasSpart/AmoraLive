import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/hooks/useAuthStore';
import { getDiscoverUsers, likeUser, unlikeUser } from '@/services/api';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function DiscoverScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getDiscoverUsers({ page: 1, limit: 20 });
      setUsers(data.users || []);
    } catch (error) {
      console.error('Load users error:', error);
      Alert.alert('Error', 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleLike = async () => {
    if (currentIndex >= users.length) return;
    const target = users[currentIndex];
    try {
      const result = await likeUser(target.id);
      if (result.matched) {
        Alert.alert('It\'s a match!', `You and ${target.displayName} liked each other!`);
      }
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      Alert.alert('Error', 'Unable to like');
    }
  };

  const handlePass = async () => {
    if (currentIndex >= users.length) return;
    const target = users[currentIndex];
    try {
      await unlikeUser(target.id);
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      Alert.alert('Error', 'Unable to pass');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <Text style={styles.title}>No more users</Text>
        <TouchableOpacity onPress={loadUsers} style={styles.refreshButton}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentUser = users[currentIndex];
  const photo = currentUser.photos?.[0]?.url || currentUser.avatar || 'https://via.placeholder.com/400';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.card}>
        <Image source={{ uri: photo }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{currentUser.displayName}</Text>
          <Text style={styles.bio}>{currentUser.bio || 'No bio yet'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={handlePass} style={[styles.actionButton, styles.passButton]}>
          <Ionicons name="close-outline" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLike} style={[styles.actionButton, styles.likeButton]}>
          <Ionicons name="heart-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text,
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '70%',
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  bio: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 16,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: '#ff6b6b',
  },
  likeButton: {
    backgroundColor: '#51cf66',
  },
});
