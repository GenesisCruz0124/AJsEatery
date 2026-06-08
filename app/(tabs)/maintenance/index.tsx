import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Image } from 'react-native';
import { FAB, Text, Switch, Divider, ActivityIndicator, Snackbar, Dialog, Portal, Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAllMenuItems } from '../../../src/hooks/useMenu';
import { useActivation } from '../../../src/hooks/useActivation';
import { TrialLockDialog } from '../../../src/components/TrialLockDialog';
import { MenuItem } from '../../../src/types';
import { formatCurrency } from '../../../src/utils/currency';
import { COLORS } from '../../../src/constants/colors';
import * as menuRepository from '../../../src/repositories/menuRepository';

export default function MaintenanceScreen() {
  const navigation = useNavigation();
  const { items, loading, refresh } = useAllMenuItems();
  const { activated, daysRemaining } = useActivation();
  const [snack, setSnack] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<MenuItem | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [lockVisible, setLockVisible] = useState(false);
  const locked = !activated && daysRemaining <= 0;

  function handleNewProduct() {
    if (locked) {
      setLockVisible(true);
      return;
    }
    router.push('/maintenance/new');
  }

  const filteredItems = useMemo(
    () => (availableOnly ? items.filter((i) => i.is_available === 1) : items),
    [items, availableOnly]
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon={availableOnly ? 'filter' : 'filter-outline'}
          iconColor="#fff"
          onPress={() => setAvailableOnly((v) => !v)}
        />
      ),
    });
  }, [navigation, availableOnly]);

  async function toggleAvailability(item: MenuItem) {
    try {
      await menuRepository.setMenuItemAvailability(item.id, item.is_available === 0);
      await refresh();
    } catch {
      setSnack('Failed to update item.');
    }
  }

  async function confirmDelete() {
    if (!deleteDialog) return;
    try {
      await menuRepository.deleteMenuItem(deleteDialog.id);
      setDeleteDialog(null);
      await refresh();
    } catch {
      setSnack('Failed to delete item.');
      setDeleteDialog(null);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={filteredItems}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View>
            <View style={styles.row}>
              <View style={styles.imageWrap}>
                {item.image_uri ? (
                  <Image source={{ uri: item.image_uri }} style={styles.thumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]}>
                    <Ionicons name="restaurant-outline" size={24} color={COLORS.textSecondary} />
                  </View>
                )}
              </View>
              <View style={styles.info} >
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.price}>{formatCurrency(item.price)}</Text>
              </View>
              <View style={styles.actions}>
                <Switch
                  value={item.is_available === 1}
                  onValueChange={() => toggleAvailability(item)}
                  color={COLORS.primary}
                />
                <IconButton
                  icon="pencil-outline"
                  size={20}
                  iconColor={COLORS.primary}
                  onPress={() => router.push(`/maintenance/${item.id}`)}
                />
                <IconButton
                  icon="trash-can-outline"
                  size={20}
                  iconColor="#E53935"
                  onPress={() => setDeleteDialog(item)}
                />
              </View>
            </View>
            <Divider />
          </View>
        )}
        contentContainerStyle={filteredItems.length === 0 ? styles.emptyContent : undefined}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {availableOnly ? 'No available products' : 'No products yet'}
            </Text>
            <Text style={styles.emptyHint}>
              {availableOnly ? 'Try turning off the filter' : 'Tap + to add your first product'}
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        label="New Product"
        style={styles.fab}
        color="#fff"
        onPress={handleNewProduct}
      />

      <TrialLockDialog
        visible={lockVisible}
        onDismiss={() => setLockVisible(false)}
        message="Your trial has ended. Activate the app to add new products."
      />

      <Portal>
        <Dialog visible={!!deleteDialog} onDismiss={() => setDeleteDialog(null)}>
          <Dialog.Title>Delete Product?</Dialog.Title>
          <Dialog.Content>
            <Text>Remove "{deleteDialog?.name}"? This cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialog(null)}>Cancel</Button>
            <Button textColor="#E53935" onPress={confirmDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  imageWrap: {},
  thumb: { width: 60, height: 60, borderRadius: 8 },
  thumbPlaceholder: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  name: { fontWeight: '600', fontSize: 15, color: COLORS.text },
  category: { fontSize: 12, color: COLORS.textSecondary },
  price: { fontWeight: '700', fontSize: 14, color: COLORS.primary, marginTop: 2 },
  actions: { alignItems: 'center', gap: 2 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: COLORS.primary },
  emptyContent: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 80 },
  emptyText: { fontSize: 18, color: '#9E9E9E', fontWeight: '600' },
  emptyHint: { fontSize: 14, color: '#BDBDBD' },
});
