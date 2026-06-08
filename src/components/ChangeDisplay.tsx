import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { formatCurrency } from '../utils/currency';
import { COLORS } from '../constants/colors';

interface Props {
  total: number;
  cashTendered: number;
}

export function ChangeDisplay({ total, cashTendered }: Props) {
  const change = cashTendered - total;
  const isValid = cashTendered >= total && cashTendered > 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Order Total</Text>
        <Text style={styles.amount}>{formatCurrency(total)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Cash</Text>
        <Text style={[styles.amount, { color: cashTendered > 0 ? COLORS.text : COLORS.textSecondary }]}>
          {cashTendered > 0 ? formatCurrency(cashTendered) : '₱0.00'}
        </Text>
      </View>
      <View style={[styles.changeRow, { backgroundColor: isValid ? '#E8F5E9' : '#FFEBEE' }]}>
        <Text style={styles.changeLabel}>Change</Text>
        <Text style={[styles.changeAmount, { color: isValid ? '#2E7D32' : '#C62828' }]}>
          {isValid ? formatCurrency(change) : cashTendered > 0 ? 'Insufficient' : '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  label: { fontSize: 15, color: COLORS.textSecondary },
  amount: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 4,
  },
  changeLabel: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  changeAmount: { fontSize: 30, fontWeight: '800' },
});
