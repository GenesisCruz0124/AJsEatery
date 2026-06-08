import { getDb } from '../db/client';
import { MenuItem } from '../types';

export async function getAllMenuItems(): Promise<MenuItem[]> {
  const db = await getDb();
  return db.getAllAsync<MenuItem>('SELECT * FROM menu_items ORDER BY name ASC, category ASC');
}

export async function getAvailableMenuItems(category?: string): Promise<MenuItem[]> {
  const db = await getDb();
  if (category) {
    return db.getAllAsync<MenuItem>(
      'SELECT * FROM menu_items WHERE is_available = 1 AND category = ? ORDER BY sort_order ASC, name ASC',
      [category]
    );
  }
  return db.getAllAsync<MenuItem>(
    'SELECT * FROM menu_items WHERE is_available = 1 ORDER BY sort_order ASC, name ASC'
  );
}

export async function getMenuItemById(id: number): Promise<MenuItem | null> {
  const db = await getDb();
  return (await db.getFirstAsync<MenuItem>('SELECT * FROM menu_items WHERE id = ?', [id])) ?? null;
}

export async function upsertMenuItem(item: {
  id?: number;
  name: string;
  price: number;
  category: string;
  image_uri: string | null;
  is_available: number;
}): Promise<number> {
  const db = await getDb();
  if (item.id) {
    await db.runAsync(
      'UPDATE menu_items SET name = ?, price = ?, category = ?, image_uri = ?, is_available = ? WHERE id = ?',
      [item.name, item.price, item.category, item.image_uri, item.is_available, item.id]
    );
    return item.id;
  }
  const result = await db.runAsync(
    'INSERT INTO menu_items (name, price, category, image_uri, is_available) VALUES (?, ?, ?, ?, ?)',
    [item.name, item.price, item.category, item.image_uri, item.is_available]
  );
  return result.lastInsertRowId;
}

export async function setMenuItemAvailability(id: number, isAvailable: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE menu_items SET is_available = ? WHERE id = ?', [isAvailable ? 1 : 0, id]);
}

export async function deleteMenuItem(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM menu_items WHERE id = ?', [id]);
}
