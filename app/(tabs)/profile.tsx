import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface MenuItemProps {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function MenuItem({ icon, iconColor, title, subtitle, value, onPress, danger }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: (iconColor || Colors.primary) + '15' }]}>
        <Ionicons name={icon as any} size={20} color={danger ? Colors.danger : (iconColor || Colors.primary)} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, danger && { color: Colors.danger }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {value && <Text style={styles.menuValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.vipButton} onPress={() => router.push('/settings')}>
            <Ionicons name="diamond" size={14} color={Colors.vip} />
            <Text style={styles.vipText}>VIP Privileges</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <View style={styles.genderBadge}>
              <Ionicons name="male" size={12} color="#fff" />
              <Text style={styles.genderText}>01</Text>
            </View>
            {user.vip && (
              <View style={styles.vipBadge}>
                <Ionicons name="diamond" size={10} color={Colors.vip} />
                <Text style={styles.vipBadgeText}>VIP</Text>
              </View>
            )}
          </View>

          <View style={styles.idRow}>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>ID</Text>
            </View>
            <Text style={styles.idText}>{user.id}</Text>
            <Ionicons name="copy-outline" size={16} color={Colors.primary} />
          </View>
        </View>

        {/* Coins Bar */}
        <View style={styles.coinsBar}>
          <View style={styles.coinsLeft}>
            <Ionicons name="diamond" size={28} color={Colors.accent} />
            <Text style={styles.coinsText}>{user.coins}</Text>
          </View>
          <TouchableOpacity style={styles.rechargeButton}>
            <Text style={styles.rechargeText}>Recharge</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#A7F3D0' }]}>
              <Ionicons name="bag" size={24} color={Colors.success} />
            </View>
            <Text style={styles.actionTitle}>My Package</Text>
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>0</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#FDE68A' }]}>
              <Ionicons name="calendar" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.actionTitle}>Daily Rewards</Text>
            <View style={styles.actionBadge}>
              <Ionicons name="help-circle" size={14} color={Colors.accent} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Menu List */}
        <View style={styles.menuSection}>
          <MenuItem
            icon="sad-outline"
            iconColor={Colors.accent}
            title="Coin Store"
            value="0 >"
          />
          <MenuItem
            icon="gift"
            iconColor={Colors.danger}
            title="Claim Your Reward"
            subtitle="Complete tasks to earn coins"
          />
          <MenuItem
            icon="images"
            iconColor="#EC4899"
            title="Unlocked Photos"
          />
          <MenuItem
            icon="people"
            iconColor="#8B5CF6"
            title="Invite Friends"
          />
          <MenuItem
            icon="trophy"
            iconColor={Colors.accent}
            title="My Level"
            value={`Lv.${user.level} >`}
          />
          <MenuItem
            icon="headset"
            iconColor="#3B82F6"
            title="Customer Service"
          />
          <MenuItem
            icon="receipt"
            iconColor="#F97316"
            title="Billing Details"
          />
          <MenuItem
            icon="settings"
            iconColor="#6B7280"
            title="System Settings"
            onPress={() => router.push('/settings')}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  vipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  vipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  genderText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.vipBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  vipBadgeText: {
    color: Colors.vip,
    fontSize: 10,
    fontWeight: '700',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  idBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  idText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  coinsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  coinsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinsText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  rechargeButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rechargeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  actionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  actionBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 2,
  },
  menuValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.danger,
  },
});
