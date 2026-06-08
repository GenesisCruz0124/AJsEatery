import { getDb } from '../db/client';
import { SalesSummary, TopItem } from '../types';

export async function getSalesSummary(startDate: string, endDate: string): Promise<SalesSummary> {
  const db = await getDb();
  const result = await db.getFirstAsync<SalesSummary>(
    `SELECT
       COUNT(*) as order_count,
       COALESCE(SUM(total_amount), 0) as total_revenue,
       COALESCE(AVG(total_amount), 0) as avg_order_value
     FROM orders
     WHERE status = 'paid'
       AND date(paid_at) >= ?
       AND date(paid_at) <= ?`,
    [startDate, endDate]
  );
  return result ?? { order_count: 0, total_revenue: 0, avg_order_value: 0 };
}

export async function getTopItems(startDate: string, endDate: string): Promise<TopItem[]> {
  const db = await getDb();
  return db.getAllAsync<TopItem>(
    `SELECT
       oi.name,
       SUM(oi.quantity) as units_sold,
       SUM(oi.subtotal) as total_revenue
     FROM order_items oi
     INNER JOIN orders o ON oi.order_id = o.id
     WHERE o.status = 'paid'
       AND date(o.paid_at) >= ?
       AND date(o.paid_at) <= ?
     GROUP BY oi.name
     ORDER BY units_sold DESC
     LIMIT 5`,
    [startDate, endDate]
  );
}
