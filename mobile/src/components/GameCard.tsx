import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { useStelLootTheme } from '@/src/contexts/ThemeContext';
import { Deal } from '@/src/types/api';
import { formatBRL, formatBRLValue, formatUSD, getArtwork, getDealUrl, getGameKey } from '@/src/utils/deals';

type GameCardProps = {
  game: Deal;
  isSaved?: boolean;
  onTarget?: (game: Deal) => void;
  onToggleSave?: (game: Deal) => void;
};

export function GameCard({ game, isSaved = false, onTarget, onToggleSave }: GameCardProps) {
  const { colors } = useStelLootTheme();
  const discount = Math.round(Number(game.savings || 0));
  const title = game.displayTitle || game.title;

  function openDetails() {
    router.push({
      params: { id: getGameKey(game), payload: JSON.stringify(game) },
      pathname: '/jogo/[id]',
    });
  }

  return (
    <Pressable
      onPress={openDetails}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View>
        <Image contentFit="cover" source={{ uri: getArtwork(game) }} style={styles.artwork} transition={180} />
        <View style={[styles.discount, { backgroundColor: colors.accent }]}>
          <Text style={[styles.discountText, { color: colors.accentText }]}>
            {discount > 0 ? `-${discount}%` : 'PC'}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={[styles.store, { color: colors.accent }]}>{game.storeName || 'Loja PC'} - PC</Text>
        <Text numberOfLines={2} style={[styles.title, { color: colors.text }]}>{title}</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.text }]}>{formatBRL(game.salePrice)}</Text>
          {Number(game.normalPrice) > Number(game.salePrice) && (
            <Text style={[styles.oldPrice, { color: colors.muted }]}>{formatBRL(game.normalPrice)}</Text>
          )}
        </View>
        <Text style={[styles.note, { color: colors.muted }]}>{formatUSD(game.salePrice)} na origem</Text>
        {game.targetPrice && (
          <Text style={[styles.target, { color: colors.accent }]}>
            Alvo: {formatBRLValue(game.targetPrice)}
          </Text>
        )}
        <View style={styles.actions}>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onToggleSave?.(game);
            }}
            style={[styles.secondaryAction, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Ionicons color={colors.text} name={isSaved ? 'heart' : 'heart-outline'} size={17} />
            <Text style={[styles.actionText, { color: colors.text }]}>{isSaved ? 'Salvo' : 'Salvar'}</Text>
          </Pressable>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onTarget?.(game);
            }}
            style={[styles.secondaryAction, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Ionicons color={colors.text} name="notifications-outline" size={17} />
          </Pressable>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              void Linking.openURL(getDealUrl(game.dealID));
            }}
            style={[styles.buyAction, { backgroundColor: colors.accent }]}>
            <Ionicons color={colors.accentText} name="arrow-forward" size={18} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  artwork: {
    aspectRatio: 460 / 215,
    width: '100%',
  },
  body: {
    padding: 14,
  },
  buyAction: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  discount: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  discountText: {
    fontSize: 13,
    fontWeight: '800',
  },
  note: {
    fontSize: 12,
    marginTop: 5,
  },
  oldPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  secondaryAction: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  store: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
  },
  target: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 7,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
  },
});
