import React, { useState } from 'react';
import { FlatList, StyleSheet, View, Image, Pressable } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useTransactions } from '../../../src/hooks/useOrders';
import { Order } from '../../../src/types';
import { formatCurrency } from '../../../src/utils/currency';
import { formatRelativeTime } from '../../../src/utils/dateHelpers';
import { formatDiningLabel } from '../../../src/utils/orderHelpers';
import { COLORS } from '../../../src/constants/colors';

function PaymentTypeBadge({ type }: { type: Order['payment_type'] }) {
  const isGcash = type === 'gcash';
  return (
    <Chip
      style={{ backgroundColor: isGcash ? '#1565C0' : '#2E7D32', alignSelf: 'flex-start' }}
      textStyle={{ color: '#fff', fontSize: 11, fontWeight: '700' }}
    >
      {isGcash ? 'GCash' : 'Cash'}
    </Chip>
  );
}

export default function TransactionsScreen() {
  const { orders, loading, refresh } = useTransactions();
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Transactions" />

      {loading && orders.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card} mode="elevated" onPress={() => router.push(`/transactions/${item.id}`)}>
              <Card.Content style={styles.content}>
                <View style={styles.topRow}>
                  <Text variant="titleMedium" style={styles.orderNum}>{item.order_number}</Text>
                  {item.payment_type && <PaymentTypeBadge type={item.payment_type} />}
                </View>
                <Text style={styles.meta}>
                  {item.customer_name ? item.customer_name : formatDiningLabel(item)}
                </Text>
                <View style={styles.bottomRow}>
                  <Text style={styles.time}>{item.paid_at ? formatRelativeTime(item.paid_at) : ''}</Text>
                  <Text style={styles.total}>{formatCurrency(item.total_amount)}</Text>
                </View>

                {item.payment_proof_uri && (
                  <Pressable onPress={() => setViewerUri(item.payment_proof_uri)}>
                    <Image source={{ uri: item.payment_proof_uri }} style={styles.proofThumb} resizeMode="cover" />
                  </Pressable>
                )}
              </Card.Content>
            </Card>
          )}
          refreshing={loading}
          onRefresh={refresh}
          contentContainerStyle={orders.length === 0 ? styles.emptyContent : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptyHint}>Paid orders will show up here</Text>
            </View>
          }
        />
      )}

      <Portal>
        <Modal
          visible={!!viewerUri}
          onDismiss={() => setViewerUri(null)}
          contentContainerStyle={styles.viewerContainer}
        >
          <Pressable style={styles.viewerClose} onPress={() => setViewerUri(null)}>
            <Ionicons name="close" size={26} color="#fff" />
          </Pressable>
          {viewerUri && (
            <Image source={{ uri: viewerUri }} style={styles.viewerImage} resizeMode="contain" />
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginHorizontal: 12, marginVertical: 6 },
  content: { gap: 6 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum: { fontWeight: '700', color: COLORS.primary, fontSize: 16 },
  meta: { color: COLORS.textSecondary, fontSize: 13 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  time: { color: COLORS.textSecondary, fontSize: 12 },
  total: { fontWeight: '700', fontSize: 15, color: COLORS.text },
  proofThumb: { width: '100%', height: 140, borderRadius: 8, marginTop: 4 },
  listContent: { paddingTop: 8, paddingBottom: 24 },
  emptyContent: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 18, color: '#9E9E9E', fontWeight: '600' },
  emptyHint: { fontSize: 14, color: '#BDBDBD' },
  viewerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center' },
  viewerImage: { width: '100%', height: '80%' },
  viewerClose: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 8,
  },
});
