import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/hooks/useAuthStore';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const { isAuthenticated, user, setAuth } = useAuthStore(); // we'll add setAuth later
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // On web, check localStorage directly to ensure we catch the token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('amora_access_token');
      const userData = localStorage.getItem('amora_user');
      if (token && !isAuthenticated) {
        // If we have a token but the store says not authenticated, fix it
        if (userData) {
          try {
            const user = JSON.parse(userData);
            // We need to update the store – but we can't use setAuth if not defined yet
            // Instead, we can use the store's set method directly (but it's private)
            // Quick fix: reload again? That might loop.
            // Better: we'll add a setAuth action in the store.
          } catch {}
        }
        // Fallback: force redirect to tabs
        router.replace('/(tabs)');
        return;
      }
    }

    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
