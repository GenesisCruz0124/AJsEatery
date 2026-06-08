import { getDb } from './client';

const SEED_ITEMS = [
  { name: 'Tapsilog',      price: 85,  category: 'Food',   sort_order: 1 },
  { name: 'Longsilog',     price: 75,  category: 'Food',   sort_order: 2 },
  { name: 'Tocilog',       price: 80,  category: 'Food',   sort_order: 3 },
  { name: 'Bangsilog',     price: 90,  category: 'Food',   sort_order: 4 },
  { name: 'Pork Sinigang', price: 120, category: 'Food',   sort_order: 5 },
  { name: 'Adobo',         price: 110, category: 'Food',   sort_order: 6 },
  { name: 'Fried Rice',    price: 45,  category: 'Food',   sort_order: 7 },
  { name: 'Sinangag',      price: 35,  category: 'Food',   sort_order: 8 },
  { name: 'Soft Drinks',   price: 35,  category: 'Drinks', sort_order: 9 },
  { name: 'Bottled Water', price: 20,  category: 'Drinks', sort_order: 10 },
  { name: 'Iced Tea',      price: 40,  category: 'Drinks', sort_order: 11 },
];

export async function seedMenuItems(): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM menu_items');
  if ((row?.count ?? 0) > 0) return;
  for (const item of SEED_ITEMS) {
    await db.runAsync(
      'INSERT INTO menu_items (name, price, category, sort_order) VALUES (?, ?, ?, ?)',
      [item.name, item.price, item.category, item.sort_order]
    );
  }
}
