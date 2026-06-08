import { getDb } from '../db/client';
import { CartEntry, OrderItem } from '../types';

export async function createOrderItems(orderId: number, items: CartEntry[]): Promise<void> {
  const db = await getDb();
  for (const item of items) {
    await db.runAsync(
      `INSERT INTO order_items (order_id, menu_item_id, name, unit_price, quantity, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, item.menuItemId, item.name, item.unit_price, item.quantity, item.unit_price * item.quantity]
    );
  }
}

export async function getItemsByOrderId(orderId: number): Promise<OrderItem[]> {
  const db = await getDb();
  return db.getAllAsync<OrderItem>(
    'SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC',
    [orderId]
  );
}
