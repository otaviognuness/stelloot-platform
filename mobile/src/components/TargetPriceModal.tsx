import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useStelLootTheme } from '@/src/contexts/ThemeContext';
import { Deal } from '@/src/types/api';
import { formatBRL } from '@/src/utils/deals';

type TargetPriceModalProps = {
  game: Deal | null;
  onClose: () => void;
  onSave: (price: number) => void;
  visible: boolean;
};

export function TargetPriceModal({ game, onClose, onSave, visible }: TargetPriceModalProps) {
  const { colors } = useStelLootTheme();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setValue(game?.targetPrice ? String(game.targetPrice) : '');
    setError('');
  }, [game]);

  function handleSave() {
    const price = Number(value.replace(',', '.'));
    if (!Number.isFinite(price) || price <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    onSave(price);
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={[styles.modal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>ALERTA DE PREÇO</Text>
          <Text style={[styles.title, { color: colors.text }]}>{game?.title}</Text>
          <Text style={[styles.current, { color: colors.muted }]}>
            Preço atual estimado: {formatBRL(game?.salePrice)}
          </Text>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={setValue}
            placeholder="Preço desejado em R$"
            placeholderTextColor={colors.muted}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={value}
          />
          {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={[styles.button, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={[styles.button, { backgroundColor: colors.accent }]}>
              <Text style={{ color: colors.accentText, fontWeight: '800' }}>Salvar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  button: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  current: {
    fontSize: 13,
    marginBottom: 18,
    marginTop: 8,
  },
  error: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  modal: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    marginTop: 8,
  },
});
