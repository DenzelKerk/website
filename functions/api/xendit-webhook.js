import { json, sendEmail, money, getOrderSummary, escapeHtml } from "../_shared.js";

export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.XENDIT_CALLBACK_TOKEN) return json({ error: "Webhook is not configured." }, 503);
  const supplied = request.headers.get("x-callback-token") || "";
  const expected = env.XENDIT_CALLBACK_TOKEN;
  const suppliedBytes = new TextEncoder().encode(supplied);
  const expectedBytes = new TextEncoder().encode(expected);
  let difference = suppliedBytes.length ^ expectedBytes.length;
  for (let index = 0; index < Math.max(suppliedBytes.length, expectedBytes.length); index++) {
    difference |= (suppliedBytes[index] || 0) ^ (expectedBytes[index] || 0);
  }
  if (difference !== 0) return json({ error: "Unauthorized." }, 401);

  let event;
  try { event = await request.json(); } catch { return json({ error: "Invalid webhook body." }, 400); }
  if (!event.external_id || !["PAID", "EXPIRED"].includes(event.status)) return json({ received: true });
  const order = await env.DB.prepare("SELECT * FROM zeltech_orders WHERE order_id = ?").bind(event.external_id).first();
  if (!order) return json({ error: "Order not found." }, 404);
  if (event.amount !== undefined && Number(event.amount) !== Number(order.amount)) return json({ error: "Amount mismatch." }, 400);

  if (event.status === "EXPIRED") {
    await env.DB.prepare("UPDATE zeltech_orders SET status = 'EXPIRED' WHERE order_id = ? AND status = 'PENDING'").bind(order.order_id).run();
    return json({ received: true });
  }

  await env.DB.prepare("UPDATE zeltech_orders SET status = 'PAID' WHERE order_id = ? AND status = 'PENDING'").bind(order.order_id).run();
  const current = await env.DB.prepare("SELECT * FROM zeltech_orders WHERE order_id = ?").bind(order.order_id).first();
  if (current.status === "PAID" && !current.confirmation_sent) {
    const items = getOrderSummary(current);
    const cancelUrl = `${new URL(request.url).origin}/api/cancel?token=${encodeURIComponent(current.cancel_token)}`;
    const owner = env.ZELTECH_OWNER_EMAIL || "yasuicide600@gmail.com";
    const html = `<div style="font:16px Arial,sans-serif;color:#17201a"><h1>Payment received — Zeltech</h1><p>Hi ${escapeHtml(current.customer_name)}, your payment was confirmed.</p><p><b>Order:</b> ${escapeHtml(current.order_id)}<br><b>Items:</b><br>${items.split("\n").map(escapeHtml).join("<br>")}<br><b>Total:</b> ${money(current.amount)}</p><p>We’ll contact you about shipping to the address you provided.</p><p><a href="${cancelUrl}">Request an order cancellation</a></p><p>If you need to cancel, choose a reason on the page and submit the request. This sends a request to Zeltech; it does not automatically issue a refund.</p></div>`;
    const text = `Hi ${current.customer_name}, your Zeltech payment was confirmed.\nOrder: ${current.order_id}\n${items}\nTotal: ${money(current.amount)}\n\nRequest cancellation and choose a reason: ${cancelUrl}\nCancellation is reviewed by Zeltech and does not automatically issue a refund.`;
    try {
      await sendEmail(env, { to: current.customer_email, subject: `Zeltech order ${current.order_id} confirmed`, html, text, idempotencyKey: `paid-${current.order_id}` });
      await sendEmail(env, { to: owner, subject: `Zeltech order paid: ${current.order_id}`, html: `<p>Paid order from ${escapeHtml(current.customer_name)} (${escapeHtml(current.customer_email)}).</p><p>${items.replaceAll("\n", "<br>")}<br>Total: ${money(current.amount)}<br>Phone: ${escapeHtml(current.customer_phone)}<br>Ship to: ${escapeHtml(current.shipping_address)}</p>`, text: `Paid order ${current.order_id}\nBuyer: ${current.customer_name} <${current.customer_email}>\n${items}\nTotal: ${money(current.amount)}\nPhone: ${current.customer_phone}\nShip to: ${current.shipping_address}`, idempotencyKey: `owner-paid-${current.order_id}`, replyTo: current.customer_email });
      await env.DB.prepare("UPDATE zeltech_orders SET confirmation_sent = 1 WHERE order_id = ?").bind(current.order_id).run();
    } catch {
      return json({ error: "Confirmation email delivery failed. Retry the webhook after email setup is fixed." }, 500);
    }
  }
  return json({ received: true });
}





