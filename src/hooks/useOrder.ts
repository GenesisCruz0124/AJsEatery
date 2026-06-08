import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Order, OrderItem } from '../types';
import * as orderRepository from '../repositories/orderRepository';
import * as orderItemRepository from '../repositories/orderItemRepository';

export function useOrder(id: number) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [o, i] = await Promise.all([
      orderRepository.getOrderById(id),
      orderItemRepository.getItemsByOrderId(id),
    ]);
    setOrder(o);
    setItems(i);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { order, items, loading, refresh: load };
}
