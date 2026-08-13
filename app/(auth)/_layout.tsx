import { useEffect } from 'react';
import { useRouter, Slot } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('amora_access_token');
      if (token) {
        // Already logged in – redirect to tabs
        router.replace('/(tabs)');
      }
    }
  }, []);

  return <Slot />;
}
