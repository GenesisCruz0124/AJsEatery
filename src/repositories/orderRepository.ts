import { SQLiteDatabase } from 'expo-sqlite';
import { getDb } from '../db/client';
import { Order, KitchenOrder } from '../types';
import { canTransition, OrderStatus } from '../constants/orderStatuses';

async function generateOrderNumber(db: SQLiteDatabase): Promise<string> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM orders WHERE date(created_at) = date('now', 'localtime')`
  );
  return `#${(row?.count ?? 0) + 1}`;
}

export async function createOrder(data: {
  table_number: string | null;
  customer_name: string | null;
  dining_option: 'dine_in' | 'takeout';
  total_amount: number;
}): Promise<number> {
  const db = await getDb();
  const orderNumber = await generateOrderNumber(db);
  const result = await db.runAsync(
    `INSERT INTO orders (order_number, table_number, customer_name, dining_option, status, total_amount) VALUES (?, ?, ?, ?, 'cooking', ?)`,
    [orderNumber, data.table_number, data.customer_name, data.dining_option, data.total_amount]
  );
  return result.lastInsertRowId;
}

export async function getActiveOrders(): Promise<Order[]> {
  const db = await getDb();
  return db.getAllAsync<Order>(
    `SELECT * FROM orders WHERE status IN ('pending', 'cooking', 'served') ORDER BY created_at DESC`
  );
}

export async function getKitchenOrders(): Promise<KitchenOrder[]> {
  const db = await getDb();
  return db.getAllAsync<KitchenOrder>(
    `SELECT o.id, o.order_number, o.table_number, o.customer_name, o.dining_option, o.status, o.total_amount, o.created_at,
            GROUP_CONCAT(oi.name || ' x' || oi.quantity, char(10)) as items_summary
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.status = 'cooking'
     GROUP BY o.id
     ORDER BY o.created_at ASC`
  );
}

export async function getOrderById(id: number): Promise<Order | null> {
  const db = await getDb();
  return (await db.getFirstAsync<Order>('SELECT * FROM orders WHERE id = ?', [id])) ?? null;
}

export async function updateStatus(id: number, to: OrderStatus): Promise<void> {
  const db = await getDb();
  const order = await getOrderById(id);
  if (!order) throw new Error('Order not found');
  if (!canTransition(order.status as OrderStatus, to)) {
    throw new Error(`Cannot transition from ${order.status} to ${to}`);
  }
  await db.runAsync(
    `UPDATE orders SET status = ?, updated_at = datetime('now','localtime') WHERE id = ?`,
    [to, id]
  );
}

export async function processPayment(
  id: number,
  cash_tendered: number,
  change_due: number,
  payment_type: 'cash' | 'gcash',
  payment_proof_uri: string | null
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE orders SET
       status = 'paid',
       cash_tendered = ?,
       change_due = ?,
       payment_type = ?,
       payment_proof_uri = ?,
       paid_at = datetime('now','localtime'),
       updated_at = datetime('now','localtime')
     WHERE id = ?`,
    [cash_tendered, change_due, payment_type, payment_proof_uri, id]
  );
}

export async function getPaidOrders(): Promise<Order[]> {
  const db = await getDb();
  return db.getAllAsync<Order>(
    `SELECT * FROM orders WHERE status = 'paid' ORDER BY paid_at DESC`
  );
}

export async function resetSalesData(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`DELETE FROM order_items; DELETE FROM orders;`);
  try {
    await db.execAsync(`DELETE FROM sqlite_sequence WHERE name IN ('orders', 'order_items')`);
  } catch {
    // sqlite_sequence only exists once an AUTOINCREMENT table has inserted a row
  }
}
