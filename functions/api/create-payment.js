import { json } from "../_shared.js";

const catalog = {
  uno: { name: "Arduino Uno R3 Starter Set", price: 890 },
  esp32: { name: "ESP32 Wi-Fi + Bluetooth Dev Board", price: 420 },
  sensor: { name: "Precision Sensor Pack", price: 560 },
  meter: { name: "Digital Multimeter", price: 1250 },
  rf: { name: "LoRa SX1278 Transceiver Pair", price: 380 },
  breadboard: { name: "Solderless Breadboard Kit", price: 295 },
  solder: { name: "Temperature-Controlled Soldering Iron", price: 1680 },
  radio: { name: "USB SDR Receiver Kit", price: 1420 },
};

export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.XENDIT_SECRET_KEY) return json({ error: "Online checkout is not configured yet." }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid checkout request." }, 400); }

  const name = String(body.name || "").trim().slice(0, 100);
  const email = String(body.email || "").trim().slice(0, 254);
  const phone = String(body.phone || "").trim().slice(0, 32);
  const address = String(body.address || "").trim().slice(0, 300);
  const lines = Array.isArray(body.items) ? body.items : [];
  const paymentPreference = String(body.paymentPreference || "");
  const allowedPreferences = new Set(["gcash", "maya", "grabpay", "shopeepay", "qrph", "bank", "card"]);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length < 7 || address.length < 8 || !allowedPreferences.has(paymentPreference) || lines.length < 1 || lines.length > 20) {
    return json({ error: "Enter your name, email, phone, and delivery address, choose a payment method, and add at least one item." }, 400);
  }

  const items = [];
  for (const line of lines) {
    const product = catalog[String(line.id || "")];
    const quantity = Number(line.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return json({ error: "One of the cart items is invalid. Please refresh and try again." }, 400);
    items.push({ name: product.name, quantity, price: product.price });
  }
  const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (amount < 1 || amount > 1000000) return json({ error: "This order total is outside the supported range." }, 400);

  const orderId = `zeltech-${crypto.randomUUID()}`;
  const cancelToken = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
  const origin = new URL(request.url).origin;
  await env.DB.prepare(`INSERT INTO zeltech_orders
    (order_id, customer_name, customer_email, customer_phone, shipping_address, items_json, amount, preferred_payment_method, status, cancel_token, confirmation_sent, cancellation_email_sent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, 0, 0, CURRENT_TIMESTAMP)`)
    .bind(orderId, name, email, phone, address, JSON.stringify(items), amount, paymentPreference, cancelToken).run();

  const payload = {
    external_id: orderId,
    amount,
    currency: "PHP",
    payer_email: email,
    description: `Zeltech order ${orderId}`,
    invoice_duration: 86400,
    success_redirect_url: `${origin}/?payment=returned`,
    failure_redirect_url: `${origin}/?payment=cancelled`,
    items: items.map(item => ({ name: item.name, quantity: item.quantity, price: item.price, category: "Electronics" })),
    metadata: { store: "Zeltech", customer_name: name, customer_phone: phone, preferred_payment_method: paymentPreference },
  };

  let response;
  try {
    response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: { authorization: `Basic ${btoa(`${env.XENDIT_SECRET_KEY}:`)}`, "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    await env.DB.prepare("UPDATE zeltech_orders SET status = 'PAYMENT_ERROR' WHERE order_id = ?").bind(orderId).run();
    return json({ error: "Could not reach the payment provider. Please try again later." }, 502);
  }
  const invoice = await response.json().catch(() => ({}));
  if (!response.ok || !invoice.invoice_url || !invoice.id) {
    await env.DB.prepare("UPDATE zeltech_orders SET status = 'PAYMENT_ERROR' WHERE order_id = ?").bind(orderId).run();
    return json({ error: "The payment provider could not create checkout. Please try again or contact Zeltech." }, 502);
  }

  await env.DB.prepare("UPDATE zeltech_orders SET invoice_id = ? WHERE order_id = ?").bind(invoice.id, orderId).run();
  return json({ checkoutUrl: invoice.invoice_url, orderId });
}
