import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useStelLootTheme } from '@/src/contexts/ThemeContext';

type HeaderProps = {
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
  subtitle?: string;
  title?: string;
};

export function Header({ actionIcon, onAction, subtitle, title = 'StelLoot' }: HeaderProps) {
  const { colors } = useStelLootTheme();

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={[styles.logo, { borderColor: colors.accent }]}>
          <Ionicons color={colors.accent} name="game-controller-outline" size={22} />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>}
        </View>
      </View>
      {actionIcon && onAction && (
        <Pressable
          accessibilityLabel="Abrir ação"
          onPress={onAction}
          style={[styles.action, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons color={colors.text} name={actionIcon} size={20} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  logo: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
});
