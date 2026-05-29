import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { GameCard } from '@/src/components/GameCard';
import { Header } from '@/src/components/Header';
import { Screen } from '@/src/components/Screen';
import { TargetPriceModal } from '@/src/components/TargetPriceModal';
import { useAuth } from '@/src/contexts/AuthContext';
import { useStelLootTheme } from '@/src/contexts/ThemeContext';
import { useGameActions } from '@/src/hooks/useWishlist';
import { Deal } from '@/src/types/api';
import { getGameKey } from '@/src/utils/deals';

export default function WishlistScreen() {
  const { session } = useAuth();
  const { colors } = useStelLootTheme();
  const actions = useGameActions();

  if (!session) {
    return (
      <Screen>
        <Header subtitle="Seus alertas de preço" title="Wishlist" />
        <View style={styles.guest}>
          <Ionicons color={colors.accent} name="heart-outline" size={44} />
          <Text style={[styles.guestTitle, { color: colors.text }]}>Entre para salvar seus jogos</Text>
          <Text style={[styles.guestText, { color: colors.muted }]}>
            A wishlist fica sincronizada entre o site e o aplicativo.
          </Text>
          <Pressable onPress={() => router.push('/(auth)/login')} style={[styles.loginButton, { backgroundColor: colors.accent }]}>
            <Text style={{ color: colors.accentText, fontWeight: '800' }}>Entrar ou cadastrar</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  function renderGame({ item }: { item: Deal }) {
    return (
      <GameCard
        game={item}
        isSaved
        onTarget={actions.openTarget}
        onToggleSave={actions.toggle}
      />
    );
  }

  return (
    <Screen>
      <Header subtitle={`${actions.wishlist.length} jogos acompanhados`} title="Wishlist" />
      <FlatList
        contentContainerStyle={styles.list}
        data={actions.wishlist}
        keyExtractor={(item) => getGameKey(item)}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.guestTitle, { color: colors.text }]}>Nenhum jogo salvo</Text>
            <Text style={[styles.guestText, { color: colors.muted }]}>
              Salve uma oferta e defina um preço alvo para receber destaque aqui.
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/ofertas')}>
              <Text style={[styles.explore, { color: colors.accent }]}>Explorar ofertas</Text>
            </Pressable>
          </View>
        }
        ListHeaderComponent={
          actions.error ? <Text style={[styles.error, { color: colors.danger }]}>{actions.error}</Text> : null
        }
        renderItem={renderGame}
        showsVerticalScrollIndicator={false}
      />
      <TargetPriceModal
        game={actions.targetGame}
        onClose={actions.closeTarget}
        onSave={actions.saveTarget}
        visible={Boolean(actions.targetGame)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 70,
  },
  error: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 14,
  },
  explore: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 9,
  },
  guest: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  guestText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 9,
    marginTop: 18,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  loginButton: {
    borderRadius: 13,
    marginTop: 25,
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
});
