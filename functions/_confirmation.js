export async function ensureConfirmationTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS zeltech_email_confirmations (
    order_id TEXT PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    items_json TEXT NOT NULL,
    amount INTEGER NOT NULL,
    preferred_payment_method TEXT NOT NULL,
    status TEXT NOT NULL,
    owner_email_sent INTEGER NOT NULL DEFAULT 0,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

export async function hashConfirmationToken(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
}

export function formatMoney(value) {
  return `₱${Number(value).toLocaleString("en-PH")}`;
}

export function summarizeItems(items) {
  return items.map(item => `${Number(item.quantity)} × ${item.name} — ${formatMoney(Number(item.price) * Number(item.quantity))}`).join("\n");
}

