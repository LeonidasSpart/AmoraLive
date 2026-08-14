import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Home, Compass, PlusCircle, MessageCircle, User } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Live', tabBarIcon: ({ color }) => <Home size={24} color={color} /> }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: ({ color }) => <Compass size={24} color={color} /> }} />
      <Tabs.Screen name="create" options={{ title: 'Go Live', tabBarIcon: ({ color }) => <PlusCircle size={28} color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <User size={24} color={color} /> }} />
    </Tabs>
  );
}
