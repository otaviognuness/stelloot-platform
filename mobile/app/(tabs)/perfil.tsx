import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/src/components/Header';
import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/contexts/AuthContext';
import { useStelLootTheme } from '@/src/contexts/ThemeContext';
import { ThemeMode } from '@/src/theme/colors';

const themes: { id: ThemeMode; label: string }[] = [
  { id: 'default', label: 'StelLoot' },
  { id: 'black', label: 'Preto' },
  { id: 'light', label: 'Claro' },
];

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { colors, mode, setMode } = useStelLootTheme();

  return (
    <Screen>
      <Header subtitle="Conta e preferências" title="Perfil" />
      <View style={styles.content}>
        <View style={[styles.account, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons color={colors.accent} name="person-outline" size={30} />
          </View>
          {session ? (
            <>
              <Text style={[styles.name, { color: colors.text }]}>{session.user.username}</Text>
              <Text style={[styles.email, { color: colors.muted }]}>{session.user.email}</Text>
            </>
          ) : (
            <>
              <Text style={[styles.name, { color: colors.text }]}>Sua conta StelLoot</Text>
              <Text style={[styles.email, { color: colors.muted }]}>Entre para sincronizar wishlist e alertas.</Text>
            </>
          )}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>TEMA</Text>
        <View style={styles.themeRow}>
          {themes.map((theme) => (
            <Pressable
              key={theme.id}
              onPress={() => setMode(theme.id)}
              style={[
                styles.themeButton,
                {
                  backgroundColor: mode === theme.id ? colors.accent : colors.surface,
                  borderColor: mode === theme.id ? colors.accent : colors.border,
                },
              ]}>
              <Text style={{ color: mode === theme.id ? colors.accentText : colors.text, fontWeight: '700' }}>
                {theme.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.info, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Sobre os preços</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>
            As ofertas vêm da CheapShark em dólar e são exibidas com estimativa em real.
          </Text>
        </View>

        {session ? (
          <Pressable onPress={() => signOut()} style={[styles.action, { borderColor: colors.border }]}>
            <Text style={[styles.actionText, { color: colors.text }]}>Sair da conta</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={[styles.primaryAction, { backgroundColor: colors.accent }]}>
            <Text style={[styles.actionText, { color: colors.accentText }]}>Entrar ou cadastrar</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  account: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 28,
    padding: 26,
  },
  action: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 28,
    padding: 16,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '800',
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 15,
    width: 64,
  },
  content: {
    padding: 20,
  },
  email: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  info: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 28,
    padding: 18,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
  primaryAction: {
    alignItems: 'center',
    borderRadius: 14,
    marginTop: 28,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
  },
  themeButton: {
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 13,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
