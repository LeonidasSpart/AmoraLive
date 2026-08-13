import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // On web, also check localStorage directly
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('amora_access_token');
      if (token && !isAuthenticated) {
        // Force a full page reload to trigger the app to re‑initialize
        window.location.href = '/(tabs)';
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
