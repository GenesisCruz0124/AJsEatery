import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Linking } from 'react-native';
import { Text, Card, Dialog, Portal, Button, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as orderRepository from '../../../src/repositories/orderRepository';
import { COLORS } from '../../../src/constants/colors';

export default function SettingsScreen() {
  const appName = Constants.expoConfig?.name ?? 'Sales Tracker';
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const contactEmail = 'genesiscruz.dev@gmail.com';
  const [resetVisible, setResetVisible] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [snack, setSnack] = useState('');

  async function confirmReset() {
    setResetting(true);
    try {
      await orderRepository.resetSalesData();
      setResetVisible(false);
      setSnack('Sales data has been reset.');
    } catch {
      setSnack('Failed to reset sales data.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Manage</Text>
            <Pressable style={styles.row} onPress={() => router.push('/maintenance')}>
              <View style={styles.rowIcon}>
                <Ionicons name="grid-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Products</Text>
                <Text style={styles.rowSub}>Add, edit, and organize menu items</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </Pressable>
            <Pressable
              style={styles.row}
              onPress={() => router.push('/activation' as Parameters<typeof router.push>[0])}
            >
              <View style={styles.rowIcon}>
                <Ionicons name="key-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Activation</Text>
                <Text style={styles.rowSub}>View trial status and activate this device</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </Pressable>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Data</Text>
            <Pressable style={styles.row} onPress={() => setResetVisible(true)}>
              <View style={[styles.rowIcon, styles.rowIconDanger]}>
                <Ionicons name="trash-outline" size={20} color="#E53935" />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, styles.rowTitleDanger]}>Reset Sales Data</Text>
                <Text style={styles.rowSub}>Clear all orders, transactions, and sales history</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </Pressable>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>App name</Text>
              <Text style={styles.aboutValue}>{appName}</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>{appVersion}</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Developer</Text>
              <Text style={styles.aboutValue}>Genesis</Text>
            </View>
            <Pressable style={styles.aboutRow} onPress={() => Linking.openURL(`mailto:${contactEmail}`)}>
              <Text style={styles.aboutLabel}>Contact</Text>
              <Text style={[styles.aboutValue, styles.aboutLink]}>{contactEmail}</Text>
            </Pressable>
          </Card.Content>
        </Card>
      </View>

      <Portal>
        <Dialog visible={resetVisible} onDismiss={() => setResetVisible(false)}>
          <Dialog.Title>Reset Sales Data?</Dialog.Title>
          <Dialog.Content>
            <Text>
              This will permanently delete all orders, transactions, and sales history. Products
              and activation will not be affected. This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setResetVisible(false)} disabled={resetting}>Cancel</Button>
            <Button textColor="#E53935" onPress={confirmReset} loading={resetting} disabled={resetting}>
              Reset
            </Button>
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
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontWeight: '700', color: COLORS.text },
  content: { padding: 12, gap: 12 },
  card: {},
  cardContent: { gap: 4 },
  sectionTitle: { fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FBE9E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowIconDanger: { backgroundColor: '#FFEBEE' },
  rowText: { flex: 1 },
  rowTitle: { fontWeight: '600', fontSize: 15, color: COLORS.text },
  rowTitleDanger: { color: '#E53935' },
  rowSub: { fontSize: 12, color: COLORS.textSecondary },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  aboutLabel: { fontSize: 14, color: COLORS.textSecondary },
  aboutValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  aboutLink: { color: COLORS.primary },
});
