import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, DataTable } from 'react-native-paper';
import { TopItem } from '../types';
import { formatCurrency } from '../utils/currency';

interface Props {
  items: TopItem[];
}

export function TopItemsTable({ items }: Props) {
  if (items.length === 0) {
    return <Text style={styles.empty}>No sales data for this period.</Text>;
  }
  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title>Item</DataTable.Title>
        <DataTable.Title numeric>Sold</DataTable.Title>
        <DataTable.Title numeric>Revenue</DataTable.Title>
      </DataTable.Header>
      {items.map((item, i) => (
        <DataTable.Row key={i}>
          <DataTable.Cell>{item.name}</DataTable.Cell>
          <DataTable.Cell numeric>{item.units_sold}</DataTable.Cell>
          <DataTable.Cell numeric>{formatCurrency(item.total_revenue)}</DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', color: '#9E9E9E', marginTop: 20 },
});
