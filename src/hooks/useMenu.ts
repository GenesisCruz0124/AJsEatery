import { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '../types';
import * as menuRepository from '../repositories/menuRepository';

export function useMenu(category?: string) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await menuRepository.getAvailableMenuItems(category);
    setItems(data);
    setLoading(false);
  }, [category]);

  useEffect(() => { load(); }, [load]);

  return { items, loading, refresh: load };
}

export function useAllMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await menuRepository.getAllMenuItems();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { items, loading, refresh: load };
}
