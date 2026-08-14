import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../../hooks/useAuthStore';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { Settings, LogOut, Coins, Diamond, Crown } from 'lucide-react-native';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
        <Text style={styles.name}>{user.displayName || user.username}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        
        <View style={styles.stats}>
          <View style={styles.stat}><Coins size={20} color={Colors.dark.vip} /><Text style={styles.statText}>{user.coins}</Text></View>
          <View style={styles.stat}><Diamond size={20} color={Colors.dark.secondary} /><Text style={styles.statText}>{user.diamonds}</Text></View>
          <View style={styles.stat}><Crown size={20} color={Colors.dark.vip} /><Text style={styles.statText}>VIP {user.vipLevel}</Text></View>
        </View>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
          <Settings size={24} color={Colors.dark.text} />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={logout}>
          <LogOut size={24} color={Colors.dark.danger} />
          <Text style={[styles.menuText, { color: Colors.dark.danger }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: Colors.dark.primary },
  name: { fontSize: 24, fontWeight: 'bold', color: Colors.dark.text, marginTop: 12 },
  username: { fontSize: 14, color: Colors.dark.tabIconDefault, marginTop: 4 },
  stats: { flexDirection: 'row', marginTop: 20, gap: 24 },
  stat: { alignItems: 'center', gap: 4 },
  statText: { color: Colors.dark.text, fontSize: 14, fontWeight: '600' },
  menu: { padding: 16, gap: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: Colors.dark.card, padding: 16, borderRadius: 12 },
  menuText: { color: Colors.dark.text, fontSize: 16, fontWeight: '500' },
});
