import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { GameCard } from '@/src/components/GameCard';
import { Header } from '@/src/components/Header';
import { Screen } from '@/src/components/Screen';
import { TargetPriceModal } from '@/src/components/TargetPriceModal';
import { useStelLootTheme } from '@/src/contexts/ThemeContext';
import { useGameActions } from '@/src/hooks/useWishlist';
import { getDeals } from '@/src/services/api';
import { Deal } from '@/src/types/api';
import { getGameKey } from '@/src/utils/deals';

export default function ExploreScreen() {
  const { colors } = useStelLootTheme();
  const actions = useGameActions();
  const dealsQuery = useQuery({ queryFn: () => getDeals(0), queryKey: ['deals', 0] });
  const deals = dealsQuery.data?.slice(0, 8) || [];

  function renderGame({ item }: { item: Deal }) {
    const saved = actions.findSaved(item);
    return (
      <GameCard
        game={saved || item}
        isSaved={Boolean(saved)}
        onTarget={actions.openTarget}
        onToggleSave={actions.toggle}
      />
    );
  }

  return (
    <Screen>
      <Header
        actionIcon="search-outline"
        onAction={() => router.push('/(tabs)/ofertas')}
        subtitle="Ofertas PC em tempo real"
      />
      <FlatList
        contentContainerStyle={styles.list}
        data={deals}
        keyExtractor={(item) => getGameKey(item)}
        ListEmptyComponent={
          dealsQuery.isLoading ? (
            <ActivityIndicator color={colors.accent} size="large" style={styles.loading} />
          ) : (
            <Text style={[styles.feedback, { color: colors.muted }]}>Não foi possível carregar promoções agora.</Text>
          )
        }
        ListHeaderComponent={
          <>
            <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.tag, { color: colors.accent }]}>DESTAQUES PC</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Encontre o menor preço para jogar hoje</Text>
              <Text style={[styles.heroText, { color: colors.muted }]}>
                Compare ofertas, salve jogos e defina o valor que deseja pagar.
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/ofertas')}
                style={[styles.heroAction, { backgroundColor: colors.accent }]}>
                <Text style={[styles.heroActionText, { color: colors.accentText }]}>Ver todas as ofertas</Text>
              </Pressable>
            </View>
            <View style={styles.sectionTitle}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Populares em promoção</Text>
              <Pressable onPress={() => router.push('/(tabs)/ofertas')}>
                <Text style={[styles.link, { color: colors.accent }]}>Ver mais</Text>
              </Pressable>
            </View>
            {actions.error && <Text style={[styles.error, { color: colors.danger }]}>{actions.error}</Text>}
          </>
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
  error: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 14,
  },
  feedback: {
    fontSize: 14,
    paddingVertical: 30,
    textAlign: 'center',
  },
  hero: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 28,
    padding: 22,
  },
  heroAction: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 13,
    marginTop: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  heroActionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  heroText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  heroTitle: {
    fontSize: 29,
    fontWeight: '800',
    lineHeight: 34,
    marginTop: 10,
  },
  link: {
    fontSize: 14,
    fontWeight: '800',
  },
  list: {
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  loading: {
    paddingVertical: 34,
  },
  sectionHeading: {
    fontSize: 21,
    fontWeight: '800',
  },
  sectionTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tag: {
    fontSize: 12,
    fontWeight: '800',
  },
});
