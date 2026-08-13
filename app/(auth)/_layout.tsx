import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Read token directly from localStorage (web only)
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('amora_access_token');
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      // Not logged in → go to login
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      // Logged in → go to tabs
      router.replace('/(tabs)');
    }
  }, [segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
