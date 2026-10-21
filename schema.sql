CREATE TABLE IF NOT EXISTS zeltech_orders (
  order_id TEXT PRIMARY KEY,
  invoice_id TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  items_json TEXT NOT NULL,
  amount INTEGER NOT NULL,
  preferred_payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  cancel_token TEXT NOT NULL UNIQUE,
  cancel_reason TEXT,
  cancel_details TEXT,
  confirmation_sent INTEGER NOT NULL DEFAULT 0,
  cancellation_email_sent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS zeltech_orders_status_idx ON zeltech_orders(status);
