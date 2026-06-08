import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, Button, Portal, Modal, IconButton } from 'react-native-paper';
import { COLORS } from '../constants/colors';

interface DateRange {
  start: string;
  end: string;
}

interface Props {
  visible: boolean;
  initialRange: DateRange;
  onDismiss: () => void;
  onApply: (range: DateRange) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildMonthCells(year: number, month: number): (number | null)[] {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function CalendarRangePicker({ visible, initialRange, onDismiss, onApply }: Props) {
  const anchor = new Date(initialRange.start);
  const [viewYear, setViewYear] = useState(anchor.getFullYear());
  const [viewMonth, setViewMonth] = useState(anchor.getMonth());
  const [start, setStart] = useState(initialRange.start);
  const [end, setEnd] = useState(initialRange.end);

  function handleDayPress(day: number) {
    const dateStr = toDateStr(viewYear, viewMonth, day);
    if (!start || (start && end)) {
      setStart(dateStr);
      setEnd('');
    } else if (dateStr < start) {
      setEnd(start);
      setStart(dateStr);
    } else {
      setEnd(dateStr);
    }
  }

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  const cells = buildMonthCells(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <IconButton icon="chevron-left" onPress={() => changeMonth(-1)} />
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <IconButton icon="chevron-right" onPress={() => changeMonth(1)} />
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((w) => (
            <Text key={w} style={styles.weekday}>{w}</Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (day === null) return <View key={i} style={styles.cell} />;
            const dateStr = toDateStr(viewYear, viewMonth, day);
            const isStart = dateStr === start;
            const isEnd = dateStr === end;
            const inRange = !!start && !!end && dateStr > start && dateStr < end;
            return (
              <Pressable key={i} style={styles.cell} onPress={() => handleDayPress(day)}>
                <View
                  style={[
                    styles.dayCircle,
                    inRange && styles.dayInRange,
                    (isStart || isEnd) && styles.daySelected,
                  ]}
                >
                  <Text style={[styles.dayText, (isStart || isEnd) && styles.daySelectedText]}>
                    {day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.rangeSummary}>
          <Text style={styles.rangeText}>{start || 'Start date'}</Text>
          <Text style={styles.rangeArrow}>→</Text>
          <Text style={styles.rangeText}>{end || 'End date'}</Text>
        </View>

        <View style={styles.actions}>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button
            mode="contained"
            buttonColor={COLORS.primary}
            disabled={!start}
            onPress={() => onApply({ start, end: end || start })}
          >
            Apply
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  weekRow: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInRange: { backgroundColor: '#FDE8E5', borderRadius: 0 },
  daySelected: { backgroundColor: COLORS.primary },
  dayText: { fontSize: 14, color: COLORS.text },
  daySelectedText: { color: '#fff', fontWeight: '700' },
  rangeSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  rangeText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  rangeArrow: { color: COLORS.textSecondary },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
});
