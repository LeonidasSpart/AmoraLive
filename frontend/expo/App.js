import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens (import these)
import LiveDiscovery from './screens/LiveDiscovery';
import Matches from './screens/Matches';
import Store from './screens/Store';
import Profile from './screens/Profile';
import VideoMatch from './screens/VideoMatch';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Live') iconName = focused ? 'tv' : 'tv-outline';
            else if (route.name === 'Matches') iconName = focused ? 'heart' : 'heart-outline';
            else if (route.name === 'Store') iconName = focused ? 'cart' : 'cart-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF6B9D',
          tabBarInactiveTintColor: '#888',
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
        })}
      >
        <Tab.Screen name="Live" component={LiveDiscovery} />
        <Tab.Screen name="Matches" component={Matches} />
        <Tab.Screen name="Store" component={Store} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
