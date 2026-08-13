import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for token (works on web)
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('amora_access_token');
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      // Not logged in, but trying to access protected screens
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      // Logged in, but on auth screens – redirect to tabs
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
