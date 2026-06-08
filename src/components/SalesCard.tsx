import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { COLORS } from '../constants/colors';

interface Props {
  label: string;
  value: string;
}

export function SalesCard({ label, value }: Props) {
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, margin: 4 },
  content: { alignItems: 'center', paddingVertical: 12 },
  label: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 4, textAlign: 'center' },
  value: { fontWeight: '800', fontSize: 20, color: COLORS.primary },
});
