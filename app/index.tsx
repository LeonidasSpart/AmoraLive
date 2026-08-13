import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('amora_access_token');
    }

    if (token) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, []);

  return null;
}
