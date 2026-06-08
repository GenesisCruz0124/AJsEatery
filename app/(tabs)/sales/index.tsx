import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Text, SegmentedButtons, Card, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSales, getPresetDateRange, SalesPeriod, DateRange } from '../../../src/hooks/useSales';
import { SalesCard } from '../../../src/components/SalesCard';
import { TopItemsTable } from '../../../src/components/TopItemsTable';
import { CalendarRangePicker } from '../../../src/components/CalendarRangePicker';
import { formatCurrency } from '../../../src/utils/currency';
import { getToday } from '../../../src/utils/dateHelpers';
import { COLORS } from '../../../src/constants/colors';

const PERIODS: { value: SalesPeriod; label: string }[] = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
];

export default function SalesScreen() {
  const [period, setPeriod] = useState<SalesPeriod>('daily');
  const [customRange, setCustomRange] = useState<DateRange>({ start: getToday(), end: getToday() });
  const [pickerVisible, setPickerVisible] = useState(false);

  const range = useMemo<DateRange>(
    () => (period === 'custom' ? customRange : getPresetDateRange(period)),
    [period, customRange]
  );
  const { summary, topItems, loading } = useSales(range);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Sales Report</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SegmentedButtons
          value={period}
          onValueChange={(v) => setPeriod(v as SalesPeriod)}
          buttons={PERIODS}
          style={styles.segmented}
        />

        {period === 'custom' && (
          <Pressable style={styles.rangePicker} onPress={() => setPickerVisible(true)}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            <Text style={styles.rangePickerText}>{range.start} → {range.end}</Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
          </Pressable>
        )}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <>
            <View style={styles.cardsRow}>
              <SalesCard label="Total Revenue" value={formatCurrency(summary.total_revenue)} />
              <SalesCard label="Orders" value={summary.order_count.toString()} />
            </View>
            <View style={styles.cardsRow}>
              <SalesCard
                label="Avg Order Value"
                value={formatCurrency(summary.avg_order_value)}
              />
            </View>

            <Card style={styles.topCard} mode="elevated">
              <Card.Content>
                <Text variant="titleMedium" style={styles.topTitle}>Top Items</Text>
                <Divider style={styles.divider} />
                <TopItemsTable items={topItems} />
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>

      <CalendarRangePicker
        visible={pickerVisible}
        initialRange={customRange}
        onDismiss={() => setPickerVisible(false)}
        onApply={(r) => {
          setCustomRange(r);
          setPickerVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
  },
  title: { color: '#fff', fontWeight: '800' },
  content: { padding: 12, gap: 12, paddingBottom: 32 },
  segmented: {},
  rangePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rangePickerText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  center: { paddingVertical: 40 },
  cardsRow: { flexDirection: 'row' },
  topCard: {},
  topTitle: { fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  divider: { marginBottom: 8 },
});
