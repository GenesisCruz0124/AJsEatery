import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { OrderCard } from '../../../src/components/OrderCard';
import { TrialLockDialog } from '../../../src/components/TrialLockDialog';
import { useActiveOrders } from '../../../src/hooks/useOrders';
import { useActivation } from '../../../src/hooks/useActivation';
import { COLORS } from '../../../src/constants/colors';

export default function ActiveOrdersScreen() {
  const { orders, loading, refresh } = useActiveOrders();
  const { activated, daysRemaining } = useActivation();
  const [lockVisible, setLockVisible] = useState(false);
  const locked = !activated && daysRemaining <= 0;

  function handleNewOrder() {
    if (locked) {
      setLockVisible(true);
      return;
    }
    router.push('/orders/new');
  }

  if (loading && orders.length === 0) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id.toString()}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => router.push(`/orders/${item.id}`)} />
        )}
        refreshing={loading}
        onRefresh={refresh}
        contentContainerStyle={orders.length === 0 ? styles.emptyContent : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active orders</Text>
            <Text style={styles.emptyHint}>Tap + to start a new order</Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        label="New Order"
        style={styles.fab}
        color="#fff"
        onPress={handleNewOrder}
      />
      <TrialLockDialog
        visible={lockVisible}
        onDismiss={() => setLockVisible(false)}
        message="Your trial has ended. Activate the app to start new orders."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingTop: 8, paddingBottom: 88 },
  emptyContent: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 18, color: '#9E9E9E', fontWeight: '600' },
  emptyHint: { fontSize: 14, color: '#BDBDBD' },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: COLORS.primary },
});
