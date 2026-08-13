import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { PhotoUploader } from '@/components/PhotoUploader';
import { updateProfile } from '@/services/api';

interface MenuItemProps {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function MenuItem({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  onPress,
  danger,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor:
              (iconColor || Colors.primary) + '15',
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={
            danger
              ? Colors.danger
              : iconColor || Colors.primary
          }
        />
      </View>

      <View style={styles.menuTextContainer}>
        <Text
          style={[
            styles.menuTitle,
            danger && { color: Colors.danger },
          ]}
        >
          {title}
        </Text>

        {subtitle && (
          <Text style={styles.menuSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      {value && (
        <Text style={styles.menuValue}>
          {value}
        </Text>
      )}

      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.textMuted}
      />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const router = useRouter();

  const [editVisible, setEditVisible] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  const openEditProfile = () => {
    if (!user) return;
    setEditDisplayName(user.displayName || '');
    setEditBio(user.bio || '');
    setEditAvatar(user.avatar || '');
    setEditVisible(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    if (!editDisplayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      // Call API to update profile
      const updated = await updateProfile({
        displayName: editDisplayName.trim(),
        bio: editBio.trim(),
        avatar: editAvatar.trim() || user.avatar,
      });

      // Update local store
      updateUser({
        displayName: updated.displayName,
        bio: updated.bio,
        avatar: updated.avatar,
      });

      setEditVisible(false);
      Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Unable to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handlePhotoUploaded = (photo: any) => {
    // Update avatar to the new photo URL
    setEditAvatar(photo.url);
    // Optionally update the user store immediately
    if (user) {
      updateUser({ avatar: photo.url });
    }
    Alert.alert('Success', 'Photo uploaded!');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-circle-outline" size={72} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Not signed in</Text>
          <Text style={styles.emptySubtitle}>Please sign in to view your profile.</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.vipButton}
            onPress={() => router.push('/subscriptions')}
          >
            <Ionicons name="diamond" size={14} color={Colors.vip} />
            <Text style={styles.vipText}>VIP Privileges</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={34} color={Colors.textMuted} />
              </View>
            )}
            <TouchableOpacity style={styles.editButton} onPress={openEditProfile}>
              <Ionicons name="create-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <View style={styles.genderBadge}>
              <Ionicons name="person" size={12} color="#fff" />
              <Text style={styles.genderText}>AMORA</Text>
            </View>
            {user.vip && (
              <View style={styles.vipBadge}>
                <Ionicons name="diamond" size={10} color={Colors.vip} />
                <Text style={styles.vipBadgeText}>VIP</Text>
              </View>
            )}
          </View>

          <Text style={styles.bioText}>{user.bio || 'No bio added yet.'}</Text>

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
          <TouchableOpacity style={styles.rechargeButton} onPress={() => router.push('/coins')}>
            <Text style={styles.rechargeText}>Recharge</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/subscriptions')}>
            <View style={[styles.actionIcon, { backgroundColor: '#A7F3D0' }]}>
              <Ionicons name="bag" size={24} color={Colors.success} />
            </View>
            <Text style={styles.actionTitle}>My Package</Text>
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>0</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/rewards')}>
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
            onPress={() => router.push('/coins')}
          />

          <MenuItem
            icon="gift"
            iconColor={Colors.danger}
            title="Claim Your Reward"
            subtitle="Complete tasks to earn coins"
            onPress={() => router.push('/rewards')}
          />

          <MenuItem
            icon="images"
            iconColor="#EC4899"
            title="Unlocked Photos"
            onPress={() => router.push('/profile/photos')}
          />

          <MenuItem
            icon="people"
            iconColor="#8B5CF6"
            title="Invite Friends"
            onPress={() => router.push('/invite')}
          />

          <MenuItem
            icon="trophy"
            iconColor={Colors.accent}
            title="My Level"
            value={`Lv.${user.level}`}
            onPress={() => router.push('/profile/level')}
          />

          <MenuItem
            icon="headset"
            iconColor="#3B82F6"
            title="Customer Service"
            onPress={() => router.push('/support')}
          />

          <MenuItem
            icon="receipt"
            iconColor="#F97316"
            title="Billing Details"
            onPress={() => router.push('/billing')}
          />

          <MenuItem
            icon="settings"
            iconColor="#6B7280"
            title="System Settings"
            onPress={() => router.push('/settings')}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Display Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editDisplayName}
              onChangeText={setEditDisplayName}
              placeholder="Display name"
              placeholderTextColor={Colors.textMuted}
              maxLength={50}
            />

            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.modalInput, styles.bioInput]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Tell people about yourself"
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={160}
            />

            <Text style={styles.fieldLabel}>Avatar URL</Text>
            <TextInput
              style={styles.modalInput}
              value={editAvatar}
              onChangeText={setEditAvatar}
              placeholder="https://..."
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              keyboardType="url"
            />

            {/* Photo Upload */}
            <View style={styles.uploadContainer}>
              <Text style={styles.fieldLabel}>Upload Photo</Text>
              <PhotoUploader onUploadSuccess={handlePhotoUploaded} />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={saveProfile}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 24,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexWrap: 'wrap',
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
    fontSize: 9,
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
  bioText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  bioInput: {
    height: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  uploadContainer: {
    marginTop: 12,
  },
  saveButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
