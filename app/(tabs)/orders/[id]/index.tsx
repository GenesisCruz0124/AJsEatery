import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, IconButton, Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { cacheDirectory, copyAsync, deleteAsync } from 'expo-file-system/legacy';
import { useOrder } from '../../../../src/hooks/useOrder';
import { StatusBadge } from '../../../../src/components/StatusBadge';
import { formatCurrency } from '../../../../src/utils/currency';
import { formatRelativeTime } from '../../../../src/utils/dateHelpers';
import { formatDiningLabel } from '../../../../src/utils/orderHelpers';
import { COLORS } from '../../../../src/constants/colors';
import { OrderStatus } from '../../../../src/constants/orderStatuses';
import * as orderRepository from '../../../../src/repositories/orderRepository';
import * as settingsRepository from '../../../../src/repositories/settingsRepository';
import { connectAndPrint } from '../../../../src/services/bluetoothPrinter';
import { Order, OrderItem } from '../../../../src/types';

function pdfFileName(order: Order): string {
  const orderPart = order.order_number.replace(/[^a-zA-Z0-9-]/g, '');
  const stamp = new Date(order.created_at)
    .toLocaleString('sv-SE', { hour12: false })
    .replace(' ', '_')
    .replace(/:/g, '-');
  return `Order-${orderPart}_${stamp}.pdf`;
}

function buildOrderHtml(order: Order, items: OrderItem[]): string {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td colspan="2">${item.name}</td>
        </tr>
        <tr>
          <td>${item.quantity} x ${formatCurrency(item.unit_price)}</td>
          <td class="right">${formatCurrency(item.subtotal)}</td>
        </tr>`
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: 80mm auto; margin: 6mm; }
          body { font-family: 'Courier New', Courier, monospace; color: #000; width: 72mm; margin: 0 auto; font-size: 12px; }
          h1 { text-align: center; font-size: 16px; margin: 0 0 2px; }
          .sub { text-align: center; color: #444; font-size: 11px; margin-bottom: 8px; }
          .divider { border: none; border-top: 1px dashed #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 1px 0; vertical-align: top; }
          .right { text-align: right; }
          tfoot td { border-top: 1px dashed #000; font-weight: 700; font-size: 14px; padding-top: 4px; }
        </style>
      </head>
      <body>
        <h1>${order.order_number}</h1>
        <div class="sub">
          ${formatDiningLabel(order)} &middot; ${new Date(order.created_at).toLocaleString()}
          ${order.customer_name ? `<br/>Customer: ${order.customer_name}` : ''}
          ${order.notes ? `<br/>Notes: ${order.notes}` : ''}
        </div>
        <hr class="divider" />
        <table>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr><td>Total</td><td class="right">${formatCurrency(order.total_amount)}</td></tr>
          </tfoot>
        </table>
      </body>
    </html>
  `;
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order, items, loading, refresh } = useOrder(Number(id));
  const [snack, setSnack] = useState('');
  const [busy, setBusy] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [btPrinting, setBtPrinting] = useState(false);

  async function markServed() {
    setBusy(true);
    try {
      await orderRepository.updateStatus(Number(id), 'served');
      await refresh();
    } catch {
      setSnack('Failed to update status.');
    }
    setBusy(false);
  }

  async function handlePrint() {
    if (!order) return;
    setPrinting(true);
    try {
      const html = buildOrderHtml(order, items);
      // Sends straight to the OS print dialog / available printer — no PDF file involved.
      await Print.printAsync({ html });
    } catch (e: any) {
      if (!/cancel/i.test(e?.message ?? '')) {
        setSnack('Failed to print order details.');
      }
    }
    setPrinting(false);
  }

  async function handleBluetoothPrint() {
    if (!order) return;
    setBtPrinting(true);
    try {
      const printer = await settingsRepository.getPrinterDevice();
      if (!printer) {
        setSnack('No Bluetooth printer set. Pair one in Settings.');
        return;
      }
      await connectAndPrint(printer.address, order, items);
      setSnack('Sent to Bluetooth printer.');
    } catch {
      setSnack('Failed to print via Bluetooth. Check the printer is on and in range.');
    }
    setBtPrinting(false);
  }

  async function handleExportPdf() {
    if (!order) return;
    setExporting(true);
    let tempUri: string | null = null;
    try {
      const html = buildOrderHtml(order, items);
      const result = await Print.printToFileAsync({ html });
      tempUri = result.uri;

      const namedUri = `${cacheDirectory}${pdfFileName(order)}`;
      await deleteAsync(namedUri, { idempotent: true });
      await copyAsync({ from: tempUri, to: namedUri });

      if (await Sharing.isAvailableAsync()) {
        // Don't delete namedUri here — the share sheet reads it asynchronously
        // after this promise resolves; the OS cache directory is cleaned up over time.
        await Sharing.shareAsync(namedUri, { mimeType: 'application/pdf', dialogTitle: 'Order details' });
      } else {
        setSnack('Sharing is not available on this device.');
        await deleteAsync(namedUri, { idempotent: true });
      }
    } catch (e: any) {
      if (!/cancel/i.test(e?.message ?? '')) {
        setSnack('Failed to export PDF.');
      }
    } finally {
      if (tempUri) await deleteAsync(tempUri, { idempotent: true });
    }
    setExporting(false);
  }

  if (loading || !order) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>;
  }

  const actionButton = (() => {
    if (order.status === 'cooking') {
      return (
        <Button
          mode="contained"
          buttonColor={COLORS.status.served}
          onPress={markServed}
          loading={busy}
          disabled={busy}
          style={styles.actionBtn}
          labelStyle={{ fontSize: 16 }}
        >
          Mark as Served
        </Button>
      );
    }
    if (order.status === 'served') {
      return (
        <Button
          mode="contained"
          buttonColor={COLORS.primary}
          onPress={() => router.push(`/orders/${id}/payment`)}
          style={styles.actionBtn}
          labelStyle={{ fontSize: 16 }}
        >
          Process Payment
        </Button>
      );
    }
    if (order.status === 'paid') {
      return (
        <View style={styles.paidBanner}>
          <Text style={styles.paidText}>
            Paid {order.paid_at ? `• Change ₱${(order.change_due ?? 0).toFixed(2)}` : ''}
          </Text>
        </View>
      );
    }
    return null;
  })();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Text variant="headlineSmall" style={styles.orderNum}>{order.order_number}</Text>
              <View style={styles.headerActions}>
                <StatusBadge status={order.status as OrderStatus} />
                <IconButton
                  icon="printer-outline"
                  size={22}
                  onPress={handlePrint}
                  loading={printing}
                  disabled={printing || exporting || btPrinting}
                  accessibilityLabel="Print order details"
                />
                <IconButton
                  icon="file-pdf-box"
                  size={22}
                  onPress={handleExportPdf}
                  loading={exporting}
                  disabled={printing || exporting || btPrinting}
                  accessibilityLabel="Export order details as PDF"
                />
                <IconButton
                  icon="bluetooth"
                  size={22}
                  onPress={handleBluetoothPrint}
                  loading={btPrinting}
                  disabled={printing || exporting || btPrinting}
                  accessibilityLabel="Print via Bluetooth printer"
                />
              </View>
            </View>
            <Text style={styles.sub}>
              {formatDiningLabel(order)} · {formatRelativeTime(order.created_at)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Items</Text>
            {items.map((item, i) => (
              <View key={item.id}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>×{item.quantity}</Text>
                  <Text style={styles.itemSubtotal}>{formatCurrency(item.subtotal)}</Text>
                </View>
                {i < items.length - 1 && <Divider />}
              </View>
            ))}
            <Divider bold style={styles.totalDivider} />
            <View style={styles.itemRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatCurrency(order.total_amount)}</Text>
            </View>
          </Card.Content>
        </Card>

        {actionButton}
      </ScrollView>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')}>{snack}</Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 12, gap: 12, paddingBottom: 32 },
  card: {},
  headerContent: { gap: 4 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderNum: { fontWeight: '800', color: COLORS.primary },
  sub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  sectionTitle: { fontWeight: '700', marginBottom: 8, color: COLORS.text },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  itemName: { flex: 1, fontSize: 15, color: COLORS.text },
  itemQty: { minWidth: 30, textAlign: 'center', color: COLORS.textSecondary, fontSize: 14 },
  itemSubtotal: { minWidth: 70, textAlign: 'right', fontWeight: '600', fontSize: 15 },
  totalDivider: { marginVertical: 6 },
  totalLabel: { flex: 1, fontWeight: '700', fontSize: 16 },
  totalAmount: { fontWeight: '800', fontSize: 18, color: COLORS.primary },
  actionBtn: { borderRadius: 10, paddingVertical: 4 },
  paidBanner: {
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  paidText: { color: '#2E7D32', fontWeight: '700', fontSize: 16 },
});
