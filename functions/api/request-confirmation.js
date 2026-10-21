import { json, money } from "../_shared.js";
import { ensureConfirmationTable, hashConfirmationToken } from "../_confirmation.js";

const EMAILJS = {
  publicKey: "Qji7gvMFo3M8V5oAL",
  serviceId: "service_5jgu7m9",
  buyerTemplateId: "template_8cqlw3g",
};

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

const paymentLabels = {
  gcash: "GCash",
  maya: "Maya",
  bank: "Bank transfer",
  cod: "Cash on delivery",
  contact: "Contact me about options",
};

async function sendBuyerConfirmation(params, siteOrigin) {
  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "content-type": "application/json", origin: siteOrigin },
    body: JSON.stringify({
      service_id: EMAILJS.serviceId,
      template_id: EMAILJS.buyerTemplateId,
      user_id: EMAILJS.publicKey,
      template_params: params,
    }),
  });
  if (!response.ok) {
    const detail = (await response.text()).trim().slice(0, 300);
    throw new Error(`EmailJS error ${response.status}${detail ? `: ${detail}` : ""}`);
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Order confirmation storage is not configured on this Cloudflare site." }, 503);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "This checkout request is not allowed." }, 403);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid checkout request." }, 400); }

  const name = String(body.name || "").trim().slice(0, 100);
  const email = String(body.email || "").trim().slice(0, 254);
  const phone = String(body.phone || "").trim().slice(0, 32);
  const address = String(body.address || "").trim().slice(0, 300);
  const preference = String(body.paymentPreference || "");
  const lines = Array.isArray(body.items) ? body.items : [];
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length < 7 || address.length < 8 || !paymentLabels[preference] || lines.length < 1 || lines.length > 20) {
    return json({ error: "Enter your contact and delivery details, choose a payment preference, and add at least one item." }, 400);
  }

  const items = [];
  for (const line of lines) {
    const product = catalog[String(line.id || "")];
    const quantity = Number(line.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return json({ error: "One of the cart items is invalid. Refresh the page and try again." }, 400);
    items.push({ name: product.name, quantity, price: product.price });
  }

  const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (amount < 1 || amount > 1000000) return json({ error: "This order total is outside the supported range." }, 400);

  const orderId = `ZEL-${crypto.randomUUID().toUpperCase()}`;
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = [...tokenBytes].map(value => value.toString(16).padStart(2, "0")).join("");
  const tokenHash = await hashConfirmationToken(token);
  const confirmUrl = `${new URL(request.url).origin}/api/confirm-order?token=${token}`;
  const itemsText = items.map(item => `${item.quantity} × ${item.name} — ${money(item.price * item.quantity)}`).join("\n");

  try {
    await ensureConfirmationTable(env.DB);
    await env.DB.prepare(`INSERT INTO zeltech_email_confirmations
      (order_id, token_hash, customer_name, customer_email, customer_phone, shipping_address, items_json, amount, preferred_payment_method, status, owner_email_sent, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'AWAITING_EMAIL_CONFIRMATION', 0, ?, CURRENT_TIMESTAMP)`)
      .bind(orderId, tokenHash, name, email, phone, address, JSON.stringify(items), amount, preference, Date.now() + 24 * 60 * 60 * 1000).run();
  } catch {
    return json({ error: "Could not save this order for email confirmation. Please try again." }, 503);
  }

  const params = {
    order_id: orderId,
    customer_name: name,
    customer_email: email,
    to_email: email,
    customer_phone: phone,
    shipping_address: address,
    order_items: `${itemsText}\n\nReview and confirm these items before completing your order: ${confirmUrl}`,
    confirmation_url: confirmUrl,
    order_total: money(amount),
    payment_preference: paymentLabels[preference],
    payment_status: "Waiting for buyer email confirmation; no payment collected",
    reply_to: email,
  };

  try {
    await sendBuyerConfirmation(params, new URL(request.url).origin);
  } catch (error) {
    await env.DB.prepare("UPDATE zeltech_email_confirmations SET status = 'EMAIL_CONFIRMATION_FAILED' WHERE order_id = ?").bind(orderId).run();
    return json({ error: `Could not send the buyer confirmation email. ${error.message}` }, 502);
  }

  return json({ orderId, message: `A confirmation email was sent to ${email}.` });
}

