import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const cleanDisplayName = displayName.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanUsername || !cleanDisplayName || !cleanPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!cleanEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (cleanUsername.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }
    if (cleanPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (cleanPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const success = await register({
      email: cleanEmail,
      username: cleanUsername,
      displayName: cleanDisplayName,
      password: cleanPassword,
    });

    if (success) {
      Alert.alert('Welcome!', 'Account created successfully.');
      // ✅ Direct navigation – no reload
      router.replace('/(tabs)');
    }
  };

  // ... rest of the component (JSX unchanged)
}
