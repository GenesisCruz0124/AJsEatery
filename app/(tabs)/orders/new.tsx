import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, View, ScrollView } from 'react-native';
import { Button, TextInput, Text, Divider, Snackbar, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MenuItemCard } from '../../../src/components/MenuItemCard';
import { CartItem } from '../../../src/components/CartItem';
import { useMenu } from '../../../src/hooks/useMenu';
import { useCartStore } from '../../../src/store/cartStore';
import { formatCurrency } from '../../../src/utils/currency';
import { COLORS } from '../../../src/constants/colors';
import * as orderRepository from '../../../src/repositories/orderRepository';
import * as orderItemRepository from '../../../src/repositories/orderItemRepository';

const CATEGORIES = ['All', 'Food', 'Drinks', 'Others'];

type DiningOption = 'dine_in' | 'takeout';

const DINING_OPTIONS: { value: DiningOption; label: string }[] = [
  { value: 'dine_in', label: 'Dine In' },
  { value: 'takeout', label: 'Takeout' },
];

export default function NewOrderScreen() {
  const [category, setCategory] = useState('All');
  const [diningOption, setDiningOption] = useState<DiningOption>('dine_in');
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');

  const { items: menuItems, loading } = useMenu(category === 'All' ? undefined : category);
  const { tableNumber, items: cartItems, setTableNumber, addItem, updateQty, getSubtotal, reset } =
    useCartStore();

  const cartMap = useMemo(() => {
    const m: Record<number, number> = {};
    cartItems.forEach((i) => { m[i.menuItemId] = i.quantity; });
    return m;
  }, [cartItems]);

  async function submitOrder() {
    if (cartItems.length === 0) {
      setSnack('Add at least one item first.');
      return;
    }
    setSubmitting(true);
    try {
      const total = getSubtotal();
      const orderId = await orderRepository.createOrder({
        table_number: diningOption === 'dine_in' ? tableNumber.trim() || null : null,
        customer_name: customerName.trim() || null,
        dining_option: diningOption,
        total_amount: total,
      });
      await orderItemRepository.createOrderItems(orderId, cartItems);
      reset();
      setCustomerName('');
      router.replace('/orders');
    } catch {
      setSnack('Failed to submit order. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Dining option + table input */}
      <View style={styles.topBar}>
        <SegmentedButtons
          value={diningOption}
          onValueChange={(v) => setDiningOption(v as DiningOption)}
          buttons={DINING_OPTIONS}
          style={styles.segmented}
        />
        <TextInput
          label="Customer name (optional)"
          value={customerName}
          onChangeText={setCustomerName}
          mode="outlined"
          dense
          style={styles.tableInput}
        />
        {diningOption === 'dine_in' && (
          <TextInput
            label="Table # (optional)"
            value={tableNumber}
            onChangeText={setTableNumber}
            keyboardType="numeric"
            mode="outlined"
            dense
            style={styles.tableInput}
          />
        )}
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContent}
      >
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            mode={category === cat ? 'contained' : 'outlined'}
            buttonColor={category === cat ? COLORS.primary : undefined}
            textColor={category === cat ? '#fff' : COLORS.primary}
            onPress={() => setCategory(cat)}
            style={styles.catBtn}
            compact
          >
            {cat}
          </Button>
        ))}
      </ScrollView>

      {/* POS menu grid */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <MenuItemCard
                item={item}
                quantityInCart={cartMap[item.id] ?? 0}
                onPress={() => addItem(item)}
              />
            </View>
          )}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No items in this category</Text>
            </View>
          }
        />
      )}

      {/* Cart bottom panel */}
      <View style={styles.cartPanel}>
        <Divider />
        {cartItems.length > 0 ? (
          <>
            <ScrollView style={styles.cartScroll} nestedScrollEnabled>
              {cartItems.map((item) => (
                <CartItem
                  key={item.menuItemId}
                  item={item}
                  onIncrement={() => updateQty(item.menuItemId, item.quantity + 1)}
                  onDecrement={() => updateQty(item.menuItemId, item.quantity - 1)}
                />
              ))}
            </ScrollView>
            <View style={styles.cartFooter}>
              <Text style={styles.totalText}>Total: {formatCurrency(getSubtotal())}</Text>
              <Button
                mode="contained"
                buttonColor={COLORS.primary}
                onPress={submitOrder}
                loading={submitting}
                disabled={submitting}
                style={styles.submitBtn}
              >
                Send to Kitchen
              </Button>
            </View>
          </>
        ) : (
          <Text style={styles.cartEmpty}>Tap items above to add to order</Text>
        )}
      </View>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  topBar: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4, gap: 8 },
  segmented: {},
  tableInput: { backgroundColor: '#fff' },
  catScroll: { maxHeight: 52, flexGrow: 0 },
  catContent: { paddingHorizontal: 8, gap: 6, alignItems: 'center', paddingVertical: 6 },
  catBtn: { marginHorizontal: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#9E9E9E', fontSize: 15 },
  grid: { paddingHorizontal: 4, paddingBottom: 8 },
  cardWrapper: { flex: 1 / 3 },
  cartPanel: { backgroundColor: '#fff', elevation: 8 },
  cartScroll: { maxHeight: 180 },
  cartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  totalText: { fontWeight: '700', fontSize: 15, color: COLORS.text, flex: 1 },
  submitBtn: { borderRadius: 8 },
  cartEmpty: { color: '#9E9E9E', textAlign: 'center', padding: 16, fontSize: 14 },
});
