import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useStelLootTheme } from '@/src/contexts/ThemeContext';

export default function TabLayout() {
  const { colors } = useStelLootTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 66,
          paddingBottom: 9,
          paddingTop: 7,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="compass-outline" size={size} />,
          title: 'Explorar',
        }}
      />
      <Tabs.Screen
        name="ofertas"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="pricetag-outline" size={size} />,
          title: 'Ofertas',
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="heart-outline" size={size} />,
          title: 'Wishlist',
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="person-outline" size={size} />,
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}
