import { useEffect } from 'react';
import { useRouter, Slot } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the web and have a token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('amora_access_token');
      if (token) {
        // Already logged in – go to the main tabs
        router.replace('/(tabs)');
      }
    }
  }, []);

  return <Slot />;
}
