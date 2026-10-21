import { json, sendEmail, money, getOrderSummary, escapeHtml } from "../_shared.js";

function safeEqual(left, right) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    difference |= (a[index] || 0) ^ (b[index] || 0);
  }
  return difference === 0;
}

async function validSignature(rawBody, signatureHeader, secret, isLive) {
  if (!signatureHeader || !secret) return false;
  const parts = Object.fromEntries(signatureHeader.split(",").map(part => {
    const separator = part.indexOf("=");
    return separator < 0 ? [part.trim(), ""] : [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
  }));
  if (!/^\d+$/.test(parts.t || "")) return false;
  const supplied = isLive ? parts.li : parts.te;
  if (!supplied) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(parts.t + "." + rawBody));
  const expected = [...new Uint8Array(signed)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  return safeEqual(expected.toLowerCase(), supplied.toLowerCase());
}

export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.PAYMONGO_WEBHOOK_SECRET) return json({ error: "Webhook is not configured." }, 503);

  const rawBody = await request.text();
  let event;
  try { event = JSON.parse(rawBody); } catch { return json({ error: "Invalid webhook body." }, 400); }

  const eventData = event && event.data;
  const eventAttributes = eventData && eventData.attributes || {};
  const session = eventAttributes.data || eventData && eventData.data;
  const sessionAttributes = session && session.attributes || {};
  const isLive = Boolean(eventAttributes.livemode ?? (eventData && eventData.livemode) ?? sessionAttributes.livemode);
  const signature = request.headers.get("paymongo-signature") || "";
  if (!await validSignature(rawBody, signature, env.PAYMONGO_WEBHOOK_SECRET, isLive)) return json({ error: "Unauthorized." }, 401);

  const eventType = eventAttributes.type || eventData && eventData.type || event && event.event_type;
  if (eventType !== "checkout_session.payment.paid") return json({ received: true });
  if (!session || !session.id || !sessionAttributes.reference_number) return json({ error: "Checkout session details are missing." }, 400);

  const paidPayment = (sessionAttributes.payments || []).find(payment => {
    const attributes = payment.attributes || payment;
    return attributes.status === "paid";
  });
  if (!paidPayment) return json({ error: "Paid payment details are missing." }, 400);
  const paymentAttributes = paidPayment.attributes || paidPayment;
  const orderId = String(sessionAttributes.reference_number);
  const order = await env.DB.prepare("SELECT * FROM zeltech_orders WHERE order_id = ?").bind(orderId).first();
  if (!order) return json({ error: "Order not found." }, 404);
  if (order.invoice_id !== session.id) return json({ error: "Checkout session does not match the order." }, 400);
  if (String(paymentAttributes.currency || "").toUpperCase() !== "PHP" || Number(paymentAttributes.amount) !== Number(order.amount) * 100) {
    return json({ error: "Payment amount or currency mismatch." }, 400);
  }

  await env.DB.prepare("UPDATE zeltech_orders SET status = 'PAID' WHERE order_id = ? AND status = 'PENDING'").bind(order.order_id).run();
  const current = await env.DB.prepare("SELECT * FROM zeltech_orders WHERE order_id = ?").bind(order.order_id).first();
  if (current.status === "PAID" && !current.confirmation_sent) {
    const items = getOrderSummary(current);
    const cancelUrl = new URL(request.url).origin + "/api/cancel?token=" + encodeURIComponent(current.cancel_token);
    const owner = env.ZELTECH_OWNER_EMAIL || "yasuicide600@gmail.com";
    const html = "<div style=\"font:16px Arial,sans-serif;color:#17201a\"><h1>Payment received — Zeltech</h1><p>Hi " + escapeHtml(current.customer_name) + ", your payment was confirmed.</p><p><b>Order:</b> " + escapeHtml(current.order_id) + "<br><b>Items:</b><br>" + items.split("\n").map(escapeHtml).join("<br>") + "<br><b>Total:</b> " + money(current.amount) + "</p><p>We’ll contact you about shipping to the address you provided.</p><p><a href=\"" + cancelUrl + "\">Request an order cancellation</a></p><p>If you need to cancel, choose a reason on the page and submit the request. This sends a request to Zeltech; it does not automatically issue a refund.</p></div>";
    const text = "Hi " + current.customer_name + ", your Zeltech payment was confirmed.\nOrder: " + current.order_id + "\n" + items + "\nTotal: " + money(current.amount) + "\n\nRequest cancellation and choose a reason: " + cancelUrl + "\nCancellation is reviewed by Zeltech and does not automatically issue a refund.";
    try {
      await sendEmail(env, { to: current.customer_email, subject: "Zeltech order " + current.order_id + " confirmed", html, text, idempotencyKey: "paid-" + current.order_id });
      const ownerHtml = "<p>Paid order from " + escapeHtml(current.customer_name) + " (" + escapeHtml(current.customer_email) + ").</p><p>" + items.replaceAll("\n", "<br>") + "<br>Total: " + money(current.amount) + "<br>Phone: " + escapeHtml(current.customer_phone) + "<br>Ship to: " + escapeHtml(current.shipping_address) + "</p>";
      const ownerText = "Paid order " + current.order_id + "\nBuyer: " + current.customer_name + " <" + current.customer_email + ">\n" + items + "\nTotal: " + money(current.amount) + "\nPhone: " + current.customer_phone + "\nShip to: " + current.shipping_address;
      await sendEmail(env, { to: owner, subject: "Zeltech order paid: " + current.order_id, html: ownerHtml, text: ownerText, idempotencyKey: "owner-paid-" + current.order_id, replyTo: current.customer_email });
      await env.DB.prepare("UPDATE zeltech_orders SET confirmation_sent = 1 WHERE order_id = ?").bind(current.order_id).run();
    } catch {
      return json({ error: "Confirmation email delivery failed. Retry the webhook after email setup is fixed." }, 500);
    }
  }
  return json({ received: true });
}
