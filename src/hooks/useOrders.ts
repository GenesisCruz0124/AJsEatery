import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Order, KitchenOrder } from '../types';
import * as orderRepository from '../repositories/orderRepository';

export function useActiveOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await orderRepository.getActiveOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { orders, loading, refresh: load };
}

export function useTransactions() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await orderRepository.getPaidOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { orders, loading, refresh: load };
}

export function useKitchenOrders() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await orderRepository.getKitchenOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      const interval = setInterval(load, 10000);
      return () => clearInterval(interval);
    }, [load])
  );

  return { orders, loading, refresh: load };
}
