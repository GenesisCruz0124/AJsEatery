import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { COLORS } from '../constants/colors';

interface Props {
  onKey: (key: string) => void;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['00', '0', '⌫'],
];

export function NumericKeypad({ onKey }: Props) {
  return (
    <View style={styles.container}>
      {KEYS.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((key) => (
            <Button
              key={key}
              mode={key === '⌫' ? 'outlined' : 'contained'}
              buttonColor={key === '⌫' ? undefined : COLORS.primary}
              textColor={key === '⌫' ? COLORS.primary : '#fff'}
              style={styles.key}
              labelStyle={styles.keyLabel}
              onPress={() => onKey(key)}
            >
              {key}
            </Button>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  key: { flex: 1, borderRadius: 8 },
  keyLabel: { fontSize: 22, fontWeight: '700', paddingVertical: 6 },
});
