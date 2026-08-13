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
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@/constants/api';

const showAlert = (title: string, message?: string) => {
  if (typeof window !== 'undefined') {
    window.alert(title + (message ? '\n' + message : ''));
  } else {
    Alert.alert(title, message);
  }
};

export default function LoginScreen() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanAccount = account.trim();
    const cleanPassword = password.trim();

    if (!cleanAccount || !cleanPassword) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: cleanAccount, password: cleanPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        // Save tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem('amora_access_token', data.accessToken);
          localStorage.setItem('amora_refresh_token', data.refreshToken);
          localStorage.setItem('amora_user', JSON.stringify(data.user));
        }
        showAlert('Success', 'Logged in!');

        // ✅ DIRECT REDIRECT to the tabs (with full reload)
        if (typeof window !== 'undefined') {
          window.location.href = '/tabs'; // or '/tabs' if your tab route is like that
        }
      } else {
        showAlert('Login Failed', data?.message || 'Invalid credentials');
      }
    } catch (error: any) {
      showAlert('Network Error', error.message || 'Could not reach the server');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component (same as before)
}
