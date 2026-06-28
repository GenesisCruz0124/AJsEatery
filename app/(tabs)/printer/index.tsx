import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, Card, Button, Snackbar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { BluetoothDevice } from 'react-native-bluetooth-classic';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { COLORS } from '../../../src/constants/colors';
import * as settingsRepository from '../../../src/repositories/settingsRepository';
import { listPairedDevices, sendTestPrint } from '../../../src/services/bluetoothPrinter';

export default function PrinterScreen() {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [snack, setSnack] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [paired, saved] = await Promise.all([
        listPairedDevices(),
        settingsRepository.getPrinterDevice(),
      ]);
      setDevices(paired);
      setSavedAddress(saved?.address ?? null);
    } catch {
      setError('Could not access Bluetooth. Make sure Bluetooth is turned on.');
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleSelect(device: BluetoothDevice) {
    await settingsRepository.savePrinterDevice(device.address, device.name ?? device.address);
    setSavedAddress(device.address);
    setSnack(`${device.name ?? device.address} set as default printer.`);
  }

  async function handleTestPrint() {
    if (!savedAddress) return;
    setTesting(true);
    try {
      await sendTestPrint(savedAddress);
      setSnack('Test print sent.');
    } catch {
      setSnack('Failed to print. Check that the printer is on and in range.');
    }
    setTesting(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Bluetooth Printer" />

      <View style={styles.content}>
        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Paired Devices</Text>
            <Text style={styles.hint}>
              Pair your thermal printer in Android Bluetooth settings first, then select it below.
            </Text>

            {loading ? (
              <ActivityIndicator color={COLORS.primary} style={styles.loader} />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : devices.length === 0 ? (
              <Text style={styles.hint}>No paired Bluetooth devices found.</Text>
            ) : (
              devices.map((device) => {
                const selected = device.address === savedAddress;
                return (
                  <Pressable
                    key={device.address}
                    style={[styles.row, selected && styles.rowSelected]}
                    onPress={() => handleSelect(device)}
                  >
                    <View style={styles.rowIcon}>
                      <Ionicons name="bluetooth" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{device.name ?? 'Unknown device'}</Text>
                      <Text style={styles.rowSub}>{device.address}</Text>
                    </View>
                    {selected && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
                  </Pressable>
                );
              })
            )}
          </Card.Content>
        </Card>

        {savedAddress && (
          <Button
            mode="contained"
            buttonColor={COLORS.primary}
            onPress={handleTestPrint}
            loading={testing}
            disabled={testing}
            style={styles.testBtn}
            labelStyle={{ fontSize: 16 }}
          >
            Test Print
          </Button>
        )}
      </View>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')}>{snack}</Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 12, gap: 12 },
  card: {},
  cardContent: { gap: 4 },
  sectionTitle: { fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  hint: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 8 },
  errorText: { color: '#E53935', fontSize: 13 },
  loader: { marginVertical: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  rowSelected: { backgroundColor: '#FBE9E7', borderRadius: 8, marginHorizontal: -8, paddingHorizontal: 8 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FBE9E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: { fontWeight: '600', fontSize: 15, color: COLORS.text },
  rowSub: { fontSize: 12, color: COLORS.textSecondary },
  testBtn: { borderRadius: 10, paddingVertical: 4 },
});
