import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/src/contexts/AuthContext';
import { StelLootThemeProvider, useStelLootTheme } from '@/src/contexts/ThemeContext';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StelLootThemeProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </StelLootThemeProvider>
    </QueryClientProvider>
  );
}

function Navigation() {
  const { colors, mode } = useStelLootTheme();

  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/login" options={{ presentation: 'modal' }} />
        <Stack.Screen name="jogo/[id]" />
      </Stack>
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
    </>
  );
}
