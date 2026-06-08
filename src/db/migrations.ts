import { SQLiteDatabase } from 'expo-sqlite';
import { getDb } from './client';
import { CREATE_MENU_ITEMS, CREATE_ORDERS, CREATE_ORDER_ITEMS, CREATE_APP_SETTINGS } from './schema';
import { seedMenuItems } from './seed';

const CURRENT_VERSION = 7;

async function hasColumn(db: SQLiteDatabase, table: string, column: string): Promise<boolean> {
  const rows = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  return rows.some((r) => r.name === column);
}

async function addColumnIfMissing(db: SQLiteDatabase, table: string, column: string, definition: string): Promise<void> {
  if (!(await hasColumn(db, table, column))) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function dropOrderNumberUniqueConstraint(db: SQLiteDatabase): Promise<void> {
  const indexes = await db.getAllAsync<{ name: string; unique: number }>(`PRAGMA index_list(orders)`);
  let hasUniqueOrderNumber = false;
  for (const idx of indexes) {
    if (!idx.unique) continue;
    const cols = await db.getAllAsync<{ name: string }>(`PRAGMA index_info(${idx.name})`);
    if (cols.length === 1 && cols[0].name === 'order_number') {
      hasUniqueOrderNumber = true;
      break;
    }
  }
  if (!hasUniqueOrderNumber) return;

  const cols = `id, order_number, table_number, customer_name, dining_option, status, total_amount,
      cash_tendered, change_due, payment_type, payment_proof_uri, notes, created_at, updated_at, paid_at`;

  await db.execAsync('PRAGMA foreign_keys = OFF');
  await db.execAsync(`
    CREATE TABLE orders_rebuild (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number      TEXT    NOT NULL,
      table_number      TEXT,
      customer_name     TEXT,
      dining_option     TEXT,
      status            TEXT    NOT NULL DEFAULT 'pending',
      total_amount      REAL    NOT NULL DEFAULT 0,
      cash_tendered     REAL,
      change_due        REAL,
      payment_type      TEXT,
      payment_proof_uri TEXT,
      notes             TEXT,
      created_at        TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at        TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
      paid_at           TEXT
    )
  `);
  await db.execAsync(`INSERT INTO orders_rebuild (${cols}) SELECT ${cols} FROM orders`);
  await db.execAsync(`DROP TABLE orders`);
  await db.execAsync(`ALTER TABLE orders_rebuild RENAME TO orders`);
  await db.execAsync('PRAGMA foreign_keys = ON');
}

export async function runMigrations(): Promise<void> {
  const db = await getDb();
  const tables = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'orders'`
  );

  if (tables.length === 0) {
    await db.execAsync(CREATE_MENU_ITEMS);
    await db.execAsync(CREATE_ORDERS);
    await db.execAsync(CREATE_ORDER_ITEMS);
    await seedMenuItems();
  }

  await addColumnIfMissing(db, 'orders', 'customer_name', 'TEXT');
  await addColumnIfMissing(db, 'orders', 'payment_type', 'TEXT');
  await addColumnIfMissing(db, 'orders', 'payment_proof_uri', 'TEXT');

  if (!(await hasColumn(db, 'orders', 'dining_option'))) {
    await db.execAsync(`ALTER TABLE orders ADD COLUMN dining_option TEXT`);
    await db.execAsync(
      `UPDATE orders SET dining_option = CASE WHEN table_number IS NOT NULL THEN 'dine_in' ELSE 'takeout' END WHERE dining_option IS NULL`
    );
  }

  await dropOrderNumberUniqueConstraint(db);

  const settingsTables = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'app_settings'`
  );
  if (settingsTables.length === 0) {
    await db.execAsync(CREATE_APP_SETTINGS);
  }

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  if (version < CURRENT_VERSION) {
    await db.execAsync(`PRAGMA user_version = ${CURRENT_VERSION}`);
  }
}
