import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Button, Text, Divider, ActivityIndicator, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useKitchenOrders } from '../../../src/hooks/useOrders';
import { KitchenOrder } from '../../../src/types';
import { formatRelativeTime } from '../../../src/utils/dateHelpers';
import { formatDiningLabel } from '../../../src/utils/orderHelpers';
import { COLORS } from '../../../src/constants/colors';
import * as orderRepository from '../../../src/repositories/orderRepository';

export default function KitchenScreen() {
  const { orders, loading, refresh } = useKitchenOrders();
  const [snack, setSnack] = useState('');
  const [busy, setBusy] = useState<number | null>(null);

  async function markServed(orderId: number) {
    setBusy(orderId);
    try {
      await orderRepository.updateStatus(orderId, 'served');
      await refresh();
    } catch {
      setSnack('Failed to update status.');
    }
    setBusy(null);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title="Kitchen Queue"
        right={
          <View style={styles.headerRight}>
            {loading && <ActivityIndicator color="#fff" size="small" />}
            <Text style={styles.count}>
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
      />

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id.toString()}
        renderItem={({ item }) => (
          <KitchenCard
            order={item}
            onServed={() => markServed(item.id)}
            isLoading={busy === item.id}
          />
        )}
        refreshing={loading}
        onRefresh={refresh}
        contentContainerStyle={orders.length === 0 ? styles.emptyContent : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders cooking</Text>
            <Text style={styles.emptyHint}>Orders will appear here automatically</Text>
          </View>
        }
      />

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')}>{snack}</Snackbar>
    </SafeAreaView>
  );
}

function KitchenCard({
  order,
  onServed,
  isLoading,
}: {
  order: KitchenOrder;
  onServed: () => void;
  isLoading: boolean;
}) {
  const itemLines = order.items_summary ? order.items_summary.split('\n') : [];

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardOrderNum}>{order.order_number}</Text>
          <Text style={styles.cardTable}>{formatDiningLabel(order)}</Text>
          <Text style={styles.cardTime}>{formatRelativeTime(order.created_at)}</Text>
        </View>
        <Divider style={styles.cardDivider} />
        {itemLines.map((line, i) => (
          <Text key={i} style={styles.itemLine}>{line}</Text>
        ))}
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          buttonColor={COLORS.status.served}
          textColor="#fff"
          onPress={onServed}
          loading={isLoading}
          disabled={isLoading}
          style={styles.servedBtn}
        >
          Mark as Served
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: { color: '#ffffff99', fontSize: 14 },
  listContent: { padding: 12, gap: 12 },
  emptyContent: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 80 },
  emptyText: { fontSize: 18, color: '#9E9E9E', fontWeight: '600' },
  emptyHint: { fontSize: 14, color: '#BDBDBD' },
  card: {},
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  cardOrderNum: { fontWeight: '800', fontSize: 18, color: COLORS.primary, flex: 1 },
  cardTable: { color: COLORS.textSecondary, fontSize: 13 },
  cardTime: { color: COLORS.textSecondary, fontSize: 12 },
  cardDivider: { marginBottom: 8 },
  itemLine: { fontSize: 15, color: COLORS.text, paddingVertical: 3 },
  servedBtn: { borderRadius: 8, flex: 1 },
});
