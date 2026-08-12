import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

interface Streamer {
  id: string;
  name: string;
  title: string;
  viewers: number;
  thumbnail: string;
  avatar: string;
  country: string;
  isLive: boolean;
}

const MOCK_STREAMERS: Streamer[] = [
  {
    id: '1',
    name: 'Sheila',
    title: 'Music & Chill vibes tonight',
    viewers: 104577,
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
    avatar: 'https://i.pravatar.cc/150?u=1',
    country: 'CO',
    isLive: true,
  },
  {
    id: '2',
    name: 'Maria',
    title: 'Gaming session - Join me!',
    viewers: 70181,
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
    avatar: 'https://i.pravatar.cc/150?u=2',
    country: 'VE',
    isLive: true,
  },
  {
    id: '3',
    name: 'Valora',
    title: 'Cooking stream - Italian food',
    viewers: 39133,
    thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
    avatar: 'https://i.pravatar.cc/150?u=3',
    country: 'US',
    isLive: true,
  },
  {
    id: '4',
    name: 'Kati',
    title: 'Art & Drawing - Requests open',
    viewers: 30618,
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
    avatar: 'https://i.pravatar.cc/150?u=4',
    country: 'TH',
    isLive: true,
  },
  {
    id: '5',
    name: 'Luna',
    title: 'Dance practice - K-pop covers',
    viewers: 27472,
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
    avatar: 'https://i.pravatar.cc/150?u=5',
    country: 'KR',
    isLive: true,
  },
  {
    id: '6',
    name: 'Sophie',
    title: 'Study with me - Focus session',
    viewers: 19903,
    thumbnail: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop',
    avatar: 'https://i.pravatar.cc/150?u=6',
    country: 'FR',
    isLive: true,
  },
];

function formatViewers(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

function LiveCard({ streamer }: { streamer: Streamer }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <Image source={{ uri: streamer.thumbnail }} style={styles.thumbnail} />
      <View style={styles.overlay}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <View style={styles.viewerBadge}>
          <Ionicons name="flame" size={12} color="#fff" />
          <Text style={styles.viewerText}>{formatViewers(streamer.viewers)}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.streamerName} numberOfLines={1}>
          {streamer.title}
        </Text>
        <View style={styles.streamerInfo}>
          <Image source={{ uri: streamer.avatar }} style={styles.avatar} />
          <Text style={styles.nameText}>{streamer.name}</Text>
          <Text style={styles.countryText}>{streamer.country}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function LiveScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Party Room</Text>
          <View style={styles.headerUnderline} />
        </View>
        <TouchableOpacity style={styles.freeBadge}>
          <Ionicons name="gift" size={16} color={Colors.accent} />
          <Text style={styles.freeText}>FREE</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_STREAMERS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <LiveCard streamer={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  headerUnderline: {
    width: 32,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginTop: 4,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.vipBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  freeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.accent,
  },
  list: {
    padding: 12,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
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
  thumbnail: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.25,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.live,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  viewerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    padding: 10,
  },
  streamerName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  streamerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  nameText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  countryText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
