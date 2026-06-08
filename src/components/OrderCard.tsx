import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Order } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatCurrency } from '../utils/currency';
import { formatRelativeTime } from '../utils/dateHelpers';
import { formatDiningLabel } from '../utils/orderHelpers';
import { COLORS } from '../constants/colors';
import { OrderStatus } from '../constants/orderStatuses';

interface Props {
  order: Order;
  onPress: () => void;
}

export function OrderCard({ order, onPress }: Props) {
  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <Card.Content style={styles.content}>
        <View style={styles.topRow}>
          <Text variant="titleMedium" style={styles.orderNum}>{order.order_number}</Text>
          <StatusBadge status={order.status as OrderStatus} />
        </View>
        <Text style={styles.table}>{formatDiningLabel(order)}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.time}>{formatRelativeTime(order.created_at)}</Text>
          <Text style={styles.total}>{formatCurrency(order.total_amount)}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 12, marginVertical: 6 },
  content: { gap: 6 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum: { fontWeight: '700', color: COLORS.primary, fontSize: 16 },
  table: { color: COLORS.textSecondary, fontSize: 13 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  time: { color: COLORS.textSecondary, fontSize: 12 },
  total: { fontWeight: '700', fontSize: 15, color: COLORS.text },
});
