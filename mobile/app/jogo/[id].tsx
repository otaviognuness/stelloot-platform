import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/src/components/Screen';
import { TargetPriceModal } from '@/src/components/TargetPriceModal';
import { useStelLootTheme } from '@/src/contexts/ThemeContext';
import { useGameActions } from '@/src/hooks/useWishlist';
import { Deal } from '@/src/types/api';
import { formatBRL, formatBRLValue, formatUSD, getArtwork, getDealUrl } from '@/src/utils/deals';

function readGamePayload(payload?: string) {
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload) as Deal;
  } catch {
    return null;
  }
}

export default function GameDetailsScreen() {
  const { payload } = useLocalSearchParams<{ payload?: string }>();
  const { colors } = useStelLootTheme();
  const actions = useGameActions();
  const parsedGame = readGamePayload(payload);
  const game = parsedGame ? actions.findSaved(parsedGame) || parsedGame : null;

  if (!game) {
    return (
      <Screen>
        <Text style={[styles.unavailable, { color: colors.muted }]}>Jogo não disponível.</Text>
      </Screen>
    );
  }

  const discount = Math.round(Number(game.savings || 0));
  const saved = Boolean(actions.findSaved(game));

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.surface }]}>
          <Ionicons color={colors.text} name="arrow-back" size={20} />
          <Text style={[styles.backText, { color: colors.text }]}>Voltar</Text>
        </Pressable>

        <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Image contentFit="cover" source={{ uri: getArtwork(game) }} style={styles.image} transition={180} />
          <View style={styles.body}>
            <Text style={[styles.store, { color: colors.accent }]}>{game.storeName || 'PC'} - PC</Text>
            <Text style={[styles.title, { color: colors.text }]}>{game.displayTitle || game.title}</Text>
            <View style={styles.prices}>
              <Text style={[styles.price, { color: colors.text }]}>{formatBRL(game.salePrice)}</Text>
              {Number(game.normalPrice) > Number(game.salePrice) && (
                <Text style={[styles.oldPrice, { color: colors.muted }]}>{formatBRL(game.normalPrice)}</Text>
              )}
              {discount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                  <Text style={{ color: colors.accentText, fontWeight: '800' }}>-{discount}%</Text>
                </View>
              )}
            </View>
            <Text style={[styles.note, { color: colors.muted }]}>{formatUSD(game.salePrice)} na origem - R$ estimado</Text>
            {game.targetPrice && (
              <Text style={[styles.target, { color: colors.accent }]}>
                Preço alvo: {formatBRLValue(game.targetPrice)}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => void Linking.openURL(getDealUrl(game.dealID))}
          style={[styles.offer, { backgroundColor: colors.accent }]}>
          <Text style={[styles.offerText, { color: colors.accentText }]}>Abrir oferta</Text>
          <Ionicons color={colors.accentText} name="open-outline" size={18} />
        </Pressable>
        <View style={styles.actions}>
          <Pressable
            onPress={() => actions.toggle(game)}
            style={[styles.secondary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons color={colors.text} name={saved ? 'heart' : 'heart-outline'} size={19} />
            <Text style={[styles.secondaryText, { color: colors.text }]}>
              {saved ? 'Remover' : 'Wishlist'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => actions.openTarget(game)}
            style={[styles.secondary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons color={colors.text} name="notifications-outline" size={19} />
            <Text style={[styles.secondaryText, { color: colors.text }]}>Preço alvo</Text>
          </Pressable>
        </View>
        {actions.error && <Text style={[styles.error, { color: colors.danger }]}>{actions.error}</Text>}
      </ScrollView>
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
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 11,
  },
  back: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 7,
    marginBottom: 18,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  body: {
    padding: 17,
  },
  container: {
    padding: 20,
  },
  error: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 18,
  },
  hero: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    aspectRatio: 460 / 215,
    width: '100%',
  },
  note: {
    fontSize: 12,
    marginTop: 7,
  },
  offer: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 54,
  },
  offerText: {
    fontSize: 15,
    fontWeight: '800',
  },
  oldPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
  },
  prices: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 17,
  },
  secondary: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  store: {
    fontSize: 12,
    fontWeight: '800',
  },
  target: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 32,
    marginTop: 8,
  },
  unavailable: {
    fontSize: 15,
    marginTop: 40,
    textAlign: 'center',
  },
});
