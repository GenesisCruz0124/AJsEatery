import React from 'react';
import { Chip } from 'react-native-paper';
import { COLORS } from '../constants/colors';
import { OrderStatus, STATUS_LABELS } from '../constants/orderStatuses';

interface Props {
  status: OrderStatus;
}

export function StatusBadge({ status }: Props) {
  const bg = COLORS.status[status] ?? '#9E9E9E';
  return (
    <Chip
      style={{ backgroundColor: bg, alignSelf: 'flex-start' }}
      textStyle={{ color: '#fff', fontSize: 11, fontWeight: '700' }}
    >
      {STATUS_LABELS[status]}
    </Chip>
  );
}
