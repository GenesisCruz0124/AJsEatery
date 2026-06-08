export const CREATE_MENU_ITEMS = `
CREATE TABLE IF NOT EXISTS menu_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  price        REAL    NOT NULL,
  category     TEXT    NOT NULL DEFAULT 'Food',
  image_uri    TEXT,
  is_available INTEGER NOT NULL DEFAULT 1,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
)`;

export const CREATE_ORDERS = `
CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number  TEXT    NOT NULL,
  table_number  TEXT,
  status        TEXT    NOT NULL DEFAULT 'pending',
  total_amount  REAL    NOT NULL DEFAULT 0,
  cash_tendered REAL,
  change_due    REAL,
  notes         TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  paid_at       TEXT
)`;

export const CREATE_APP_SETTINGS = `
CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT
)`;

export const CREATE_ORDER_ITEMS = `
CREATE TABLE IF NOT EXISTS order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  name         TEXT    NOT NULL,
  unit_price   REAL    NOT NULL,
  quantity     INTEGER NOT NULL DEFAULT 1,
  subtotal     REAL    NOT NULL,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
)`;
