import React, { useState } from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { Button, Text, Snackbar, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NumericKeypad } from '../../../../src/components/NumericKeypad';
import { ChangeDisplay } from '../../../../src/components/ChangeDisplay';
import { useOrder } from '../../../../src/hooks/useOrder';
import { formatCurrency } from '../../../../src/utils/currency';
import { copyImageToAppStorage } from '../../../../src/utils/imageHelpers';
import { COLORS } from '../../../../src/constants/colors';
import * as orderRepository from '../../../../src/repositories/orderRepository';

type PaymentType = 'cash' | 'gcash';

const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'gcash', label: 'GCash' },
];

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order, loading } = useOrder(Number(id));
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [cashStr, setCashStr] = useState('');
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');

  async function takeProofPhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setSnack('Camera permission is required to take a reference photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const stored = await copyImageToAppStorage(result.assets[0].uri, 'payment_proofs');
      setProofUri(stored);
    }
  }

  function handleKey(key: string) {
    if (key === '⌫') {
      setCashStr((s) => s.slice(0, -1));
      return;
    }
    if (cashStr.length >= 8) return;
    setCashStr((s) => s + key);
  }

  const total = order?.total_amount ?? 0;
  const cashTendered = paymentType === 'cash' ? Number(cashStr) || 0 : total;
  const changeDue = cashTendered - total;
  const isValid = paymentType === 'cash' ? cashTendered >= total && total > 0 : total > 0;

  async function confirm() {
    if (!isValid || !order) return;
    setSubmitting(true);
    try {
      await orderRepository.processPayment(
        Number(id),
        cashTendered,
        changeDue,
        paymentType,
        paymentType === 'gcash' ? proofUri : null
      );
      router.replace('/orders');
    } catch {
      setSnack('Payment failed. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading || !order) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <SegmentedButtons
          value={paymentType}
          onValueChange={(v) => setPaymentType(v as PaymentType)}
          buttons={PAYMENT_TYPES}
          style={styles.segmented}
        />

        {paymentType === 'cash' ? (
          <>
            <ChangeDisplay total={total} cashTendered={cashTendered} />
            <View style={styles.keypadContainer}>
              <NumericKeypad onKey={handleKey} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.gcashTotal}>
              <Text style={styles.gcashLabel}>Amount to collect via GCash</Text>
              <Text style={styles.gcashAmount}>{formatCurrency(total)}</Text>
            </View>

            <Pressable style={styles.proofCapture} onPress={takeProofPhoto}>
              {proofUri ? (
                <>
                  <Image source={{ uri: proofUri }} style={styles.proofThumb} resizeMode="cover" />
                  <View style={styles.proofRetakeOverlay}>
                    <Ionicons name="camera-reverse-outline" size={16} color="#fff" />
                    <Text style={styles.proofRetakeText}>Retake</Text>
                  </View>
                </>
              ) : (
                <View style={styles.proofPlaceholder}>
                  <Ionicons name="camera-outline" size={28} color={COLORS.textSecondary} />
                  <Text style={styles.proofHint}>Take a photo for reference (optional)</Text>
                </View>
              )}
            </Pressable>
          </>
        )}

        <Button
          mode="contained"
          buttonColor={isValid ? '#4CAF50' : '#BDBDBD'}
          textColor="#fff"
          disabled={!isValid || submitting}
          loading={submitting}
          onPress={confirm}
          style={styles.confirmBtn}
          labelStyle={{ fontSize: 18 }}
        >
          Confirm Payment
        </Button>
      </View>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')}>{snack}</Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 16, gap: 16, justifyContent: 'center' },
  segmented: {},
  keypadContainer: { paddingVertical: 4 },
  confirmBtn: { borderRadius: 10, paddingVertical: 4 },
  gcashTotal: {
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
  },
  gcashLabel: { fontSize: 15, color: COLORS.textSecondary },
  gcashAmount: { fontSize: 36, fontWeight: '800', color: COLORS.text },
  proofCapture: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  proofThumb: { width: '100%', height: '100%' },
  proofPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 6 },
  proofHint: { color: COLORS.textSecondary, fontSize: 13 },
  proofRetakeOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  proofRetakeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
