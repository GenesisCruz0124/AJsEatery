import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { CartEntry } from '../types';
import { formatCurrency } from '../utils/currency';
import { COLORS } from '../constants/colors';

interface Props {
  item: CartEntry;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function CartItem({ item, onIncrement, onDecrement }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <View style={styles.controls}>
        <IconButton
          icon="minus"
          size={16}
          mode="contained"
          containerColor={COLORS.border}
          onPress={onDecrement}
          style={styles.iconBtn}
        />
        <Text style={styles.qty}>{item.quantity}</Text>
        <IconButton
          icon="plus"
          size={16}
          mode="contained"
          containerColor={COLORS.primary}
          iconColor="#fff"
          onPress={onIncrement}
          style={styles.iconBtn}
        />
      </View>
      <Text style={styles.subtotal}>{formatCurrency(item.unit_price * item.quantity)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  name: { flex: 1, fontSize: 14, color: COLORS.text },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  iconBtn: { margin: 0, width: 28, height: 28 },
  qty: { minWidth: 24, textAlign: 'center', fontWeight: '700', fontSize: 15 },
  subtotal: { minWidth: 60, textAlign: 'right', fontWeight: '600', color: COLORS.text, fontSize: 14 },
});
