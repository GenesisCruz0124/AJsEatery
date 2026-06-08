import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { SalesSummary, TopItem } from '../types';
import * as salesRepository from '../repositories/salesRepository';
import { getStartOfDay, getStartOfWeek, getStartOfMonth, getToday } from '../utils/dateHelpers';

export type SalesPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export function getPresetDateRange(period: 'daily' | 'weekly' | 'monthly'): DateRange {
  const end = getToday();
  const start =
    period === 'weekly' ? getStartOfWeek() :
    period === 'monthly' ? getStartOfMonth() :
    getStartOfDay();
  return { start, end };
}

export function useSales(range: DateRange) {
  const [summary, setSummary] = useState<SalesSummary>({
    order_count: 0,
    total_revenue: 0,
    avg_order_value: 0,
  });
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, t] = await Promise.all([
      salesRepository.getSalesSummary(range.start, range.end),
      salesRepository.getTopItems(range.start, range.end),
    ]);
    setSummary(s);
    setTopItems(t);
    setLoading(false);
  }, [range.start, range.end]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { summary, topItems, loading, refresh: load };
}
