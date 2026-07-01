import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card, Button, TextInput, Snackbar, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useActivation } from '../../../src/hooks/useActivation';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { COLORS } from '../../../src/constants/colors';
import { TRIAL_DAYS } from '../../../src/constants/activation';

export default function ActivationScreen() {
  const { loading, activated, activatedAt, deviceId, daysRemaining, submitCode } = useActivation();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');

  async function handleCopyDeviceId() {
    if (!deviceId) return;
    await Clipboard.setStringAsync(deviceId);
    setSnack('Device ID copied to clipboard');
  }

  async function handleActivate() {
    if (!code.trim()) return;
    setSubmitting(true);
    const ok = await submitCode(code);
    setSubmitting(false);
    if (ok) {
      setCode('');
      setSnack('App activated. Thank you!');
    } else {
      setSnack('Invalid activation code. Please check and try again.');
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Activation" />

      <View style={styles.content}>
        <Card style={styles.statusCard} mode="elevated">
          <Card.Content style={styles.statusContent}>
            <View style={[styles.iconCircle, { backgroundColor: activated ? '#E8F5E9' : '#FFF3E0' }]}>
              <Ionicons
                name={activated ? 'checkmark-circle' : 'time-outline'}
                size={32}
                color={activated ? '#2E7D32' : '#F57C00'}
              />
            </View>
            {activated ? (
              <>
                <Text style={styles.statusTitle}>App Activated</Text>
                {activatedAt && (
                  <Text style={styles.statusSub}>
                    Activated on {new Date(activatedAt).toLocaleDateString()}
                  </Text>
                )}
              </>
            ) : daysRemaining > 0 ? (
              <>
                <Text style={styles.statusTitle}>Trial Mode</Text>
                <Text style={styles.statusSub}>
                  {daysRemaining} of {TRIAL_DAYS} day{TRIAL_DAYS !== 1 ? 's' : ''} remaining
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.statusTitle, { color: COLORS.primary }]}>Trial Expired</Text>
                <Text style={styles.statusSub}>Enter an activation code below to continue using the app</Text>
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.formCard} mode="elevated">
          <Card.Content style={styles.formContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Device ID</Text>
            <Text style={styles.deviceHint}>
              This code is unique to this device. Share it to receive an activation code valid only here.
            </Text>
            <View style={styles.deviceIdRow}>
              <View style={[styles.deviceIdBox, styles.deviceIdBoxFlex]}>
                <Text selectable style={styles.deviceIdText}>{deviceId}</Text>
              </View>
              <IconButton
                icon="content-copy"
                size={20}
                iconColor={COLORS.primary}
                onPress={handleCopyDeviceId}
              />
            </View>
          </Card.Content>
        </Card>

        {!activated && (
          <Card style={styles.formCard} mode="elevated">
            <Card.Content style={styles.formContent}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Activate App</Text>
              <TextInput
                label="Activation code"
                value={code}
                onChangeText={setCode}
                mode="outlined"
                autoCapitalize="characters"
                dense
                style={styles.input}
              />
              <Button
                mode="contained"
                buttonColor={COLORS.primary}
                onPress={handleActivate}
                loading={submitting}
                disabled={submitting || !code.trim()}
                style={styles.activateBtn}
                labelStyle={{ fontSize: 16 }}
              >
                Activate
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')}>{snack}</Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 12, gap: 12 },
  statusCard: {},
  statusContent: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusTitle: { fontWeight: '800', fontSize: 18, color: COLORS.text },
  statusSub: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
  formCard: {},
  formContent: { gap: 12 },
  sectionTitle: { fontWeight: '700', color: COLORS.text },
  deviceHint: { color: COLORS.textSecondary, fontSize: 12 },
  deviceIdRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deviceIdBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deviceIdBoxFlex: { flex: 1 },
  deviceIdText: { fontSize: 18, fontWeight: '700', letterSpacing: 1, color: COLORS.text, textAlign: 'center' },
  input: {},
  activateBtn: { borderRadius: 10, paddingVertical: 4 },
});
