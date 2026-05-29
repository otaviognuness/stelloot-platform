import { Ionicons } from '@expo/vector-icons';
import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GameCard } from '@/src/components/GameCard';
import { Header } from '@/src/components/Header';
import { Screen } from '@/src/components/Screen';
import { TargetPriceModal } from '@/src/components/TargetPriceModal';
import { useStelLootTheme } from '@/src/contexts/ThemeContext';
import { useGameActions } from '@/src/hooks/useWishlist';
import { getDeals, PAGE_SIZE, searchCatalog } from '@/src/services/api';
import { Deal } from '@/src/types/api';
import { deduplicateDeals, getGameKey } from '@/src/utils/deals';
import { useMemo, useState } from 'react';

const storeFilters = [
  { id: 'all', label: 'Todas' },
  { id: '1', label: 'Steam' },
  { id: '25', label: 'Epic' },
];

export default function OffersScreen() {
  const { colors } = useStelLootTheme();
  const actions = useGameActions();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');

  const offersQuery = useInfiniteQuery<Deal[], Error, InfiniteData<Deal[]>, readonly string[], number>({
    getNextPageParam: (lastPage, pages) => lastPage.length >= PAGE_SIZE ? pages.length : undefined,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getDeals(pageParam),
    queryKey: ['deals', 'mobile-feed'] as const,
  });

  const catalogQuery = useQuery({
    enabled: submittedQuery.length >= 2,
    queryFn: () => searchCatalog(submittedQuery),
    queryKey: ['catalog-search', submittedQuery],
  });

  const games = useMemo(() => {
    const base = submittedQuery ? catalogQuery.data || [] : deduplicateDeals(offersQuery.data?.pages.flat() || []);
    return storeFilter === 'all' || submittedQuery
      ? base
      : base.filter((game) => game.storeID === storeFilter);
  }, [catalogQuery.data, offersQuery.data, storeFilter, submittedQuery]);

  function submitSearch() {
    setSubmittedQuery(query.trim());
  }

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

  const isLoading = submittedQuery ? catalogQuery.isLoading : offersQuery.isLoading;

  return (
    <Screen>
      <Header subtitle="Catálogo e promoções" title="Ofertas" />
      <FlatList
        contentContainerStyle={styles.list}
        data={games}
        keyExtractor={(item) => getGameKey(item)}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.accent} size="large" style={styles.loading} />
          ) : (
            <Text style={[styles.empty, { color: colors.muted }]}>
              {submittedQuery ? 'Nenhum jogo encontrado no catálogo.' : 'Nenhuma oferta encontrada.'}
            </Text>
          )
        }
        ListFooterComponent={
          !submittedQuery && offersQuery.hasNextPage ? (
            <Pressable
              disabled={offersQuery.isFetchingNextPage}
              onPress={() => offersQuery.fetchNextPage()}
              style={[styles.more, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              {offersQuery.isFetchingNextPage ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <Text style={[styles.moreText, { color: colors.text }]}>Carregar mais ofertas</Text>
              )}
            </Pressable>
          ) : null
        }
        ListHeaderComponent={
          <>
            <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons color={colors.muted} name="search-outline" size={20} />
              <TextInput
                onChangeText={setQuery}
                onSubmitEditing={submitSearch}
                placeholder="Buscar jogo no catálogo..."
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                style={[styles.input, { color: colors.text }]}
                value={query}
              />
              <Pressable onPress={submitSearch} style={[styles.searchButton, { backgroundColor: colors.accent }]}>
                <Ionicons color={colors.accentText} name="arrow-forward" size={18} />
              </Pressable>
            </View>
            {!submittedQuery && (
              <View style={styles.filterRow}>
                {storeFilters.map((store) => (
                  <Pressable
                    key={store.id}
                    onPress={() => setStoreFilter(store.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: storeFilter === store.id ? colors.accent : colors.surface,
                        borderColor: storeFilter === store.id ? colors.accent : colors.border,
                      },
                    ]}>
                    <Text style={{ color: storeFilter === store.id ? colors.accentText : colors.text, fontWeight: '700' }}>
                      {store.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            {submittedQuery && (
              <Pressable onPress={() => { setQuery(''); setSubmittedQuery(''); }} style={styles.clear}>
                <Ionicons color={colors.accent} name="close-circle-outline" size={18} />
                <Text style={[styles.clearText, { color: colors.accent }]}>Voltar às ofertas</Text>
              </Pressable>
            )}
            <View style={styles.headingRow}>
              <Text style={[styles.heading, { color: colors.text }]}>
                {submittedQuery ? `Resultados para "${submittedQuery}"` : 'Promoções disponíveis'}
              </Text>
            </View>
            {actions.error && <Text style={[styles.error, { color: colors.danger }]}>{actions.error}</Text>}
          </>
        }
        onEndReached={() => {
          if (!submittedQuery && offersQuery.hasNextPage && !offersQuery.isFetchingNextPage) {
            void offersQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
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
  chip: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  clear: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 22,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
  },
  empty: {
    fontSize: 14,
    paddingVertical: 36,
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 25,
  },
  heading: {
    fontSize: 21,
    fontWeight: '800',
  },
  headingRow: {
    marginBottom: 17,
  },
  input: {
    flex: 1,
    fontSize: 15,
    minHeight: 50,
  },
  list: {
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  loading: {
    paddingVertical: 36,
  },
  more: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 52,
  },
  moreText: {
    fontSize: 14,
    fontWeight: '800',
  },
  search: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 14,
  },
  searchButton: {
    alignItems: 'center',
    borderRadius: 11,
    height: 38,
    justifyContent: 'center',
    width: 40,
  },
});
