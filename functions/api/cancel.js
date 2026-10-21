import { json, sendEmail, escapeHtml, money, getOrderSummary } from "../_shared.js";

const reasons = new Map([
  ["mistake", "I placed this order by mistake"],
  ["changed-mind", "I no longer need the items"],
  ["delivery", "The delivery timing or address does not work"],
  ["other", "Other reason"],
]);

async function findOrder(env, token) {
  if (!token || token.length < 40 || token.length > 100) return null;
  return env.DB.prepare("SELECT * FROM zeltech_orders WHERE cancel_token = ?").bind(token).first();
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return new Response("Cancellation service is not configured.", { status: 503 });
  const token = new URL(request.url).searchParams.get("token") || "";
  const order = await findOrder(env, token);
  if (!order) return new Response("This cancellation link is invalid or expired.", { status: 404 });
  if (["CANCELLATION_REQUESTED", "CANCELLED"].includes(order.status)) return new Response(`<main style="font:16px Arial;max-width:560px;margin:12vh auto;padding:24px"><h1>Zeltech cancellation</h1><p>Your order is already marked ${order.status.toLowerCase().replaceAll("_", " ")}.</p></main>`, { headers: { "content-type": "text/html; charset=utf-8" } });
  if (order.status !== "PAID") return new Response("Only paid orders can request cancellation here.", { status: 409 });
  const options = [...reasons].map(([value, label]) => `<label style="display:block;padding:10px 0"><input type="radio" name="reason" value="${value}" required> ${label}</label>`).join("");
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Request cancellation — Zeltech</title><body style="background:#0c1011;color:#f2f5ed;font:15px Arial;padding:24px"><main style="max-width:560px;margin:8vh auto;background:#121819;border:1px solid #293332;border-radius:10px;padding:28px"><p style="color:#c6f36b;text-transform:uppercase;font:11px monospace">Zeltech / Order cancellation</p><h1 style="font-size:28px">Request a cancellation</h1><p>Order ${escapeHtml(order.order_id)} · ${money(order.amount)}</p><p>Select the reason for your request:</p><form method="post" action="/api/cancel">${options}<input type="hidden" name="token" value="${escapeHtml(token)}"><label style="display:block;margin:14px 0 7px">More details (optional)</label><textarea name="details" maxlength="500" rows="4" style="width:100%;box-sizing:border-box;background:#0c1011;color:white;border:1px solid #34413c;padding:10px"></textarea><p style="color:#aeb9b3;font-size:12px;line-height:1.5">Submitting sends a cancellation request to Zeltech for review. Refunds are not automatic; the store will email you about the result.</p><button style="background:#c6f36b;border:0;padding:13px 16px;font-weight:bold;cursor:pointer">Submit cancellation request</button></form></main></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return new Response("Cancellation service is not configured.", { status: 503 });
  const data = await request.formData();
  const token = String(data.get("token") || "");
  const reason = String(data.get("reason") || "");
  const details = String(data.get("details") || "").trim().slice(0, 500);
  const order = await findOrder(env, token);
  if (!order || !reasons.has(reason)) return new Response("Invalid cancellation request.", { status: 400 });
  if (order.status === "PAID") {
    await env.DB.prepare("UPDATE zeltech_orders SET status = 'CANCELLATION_REQUESTED', cancel_reason = ?, cancel_details = ? WHERE order_id = ? AND status = 'PAID'").bind(reasons.get(reason), details, order.order_id).run();
  }
  const current = await env.DB.prepare("SELECT * FROM zeltech_orders WHERE order_id = ?").bind(order.order_id).first();
  if (current.status !== "CANCELLATION_REQUESTED") return new Response("This order can no longer be cancelled using this link.", { status: 409 });
  if (!current.cancellation_email_sent) {
    const owner = env.ZELTECH_OWNER_EMAIL || "yasuicide600@gmail.com";
    const items = getOrderSummary(current);
    try {
      await sendEmail(env, { to: owner, subject: `Cancellation requested: ${current.order_id}`, html: `<p>Buyer ${escapeHtml(current.customer_name)} (${escapeHtml(current.customer_email)}) requested cancellation of paid order ${escapeHtml(current.order_id)}.</p><p>Reason: ${escapeHtml(current.cancel_reason)}<br>Details: ${escapeHtml(current.cancel_details || "None provided")}<br>Total: ${money(current.amount)}</p><p>${items.replaceAll("\n", "<br>")}</p>`, text: `Cancellation request for paid order ${current.order_id}\nBuyer: ${current.customer_name} <${current.customer_email}>\nReason: ${current.cancel_reason}\nDetails: ${current.cancel_details || "None provided"}\n${items}\nTotal: ${money(current.amount)}`, idempotencyKey: `cancel-owner-${current.order_id}`, replyTo: current.customer_email });
      await sendEmail(env, { to: current.customer_email, subject: `Cancellation request received: ${current.order_id}`, html: `<p>Hi ${escapeHtml(current.customer_name)}, Zeltech received your cancellation request for order ${escapeHtml(current.order_id)}.</p><p>Reason: ${escapeHtml(current.cancel_reason)}</p><p>The store will review it and email you about the result. This request is not a refund confirmation.</p>`, text: `Zeltech received your cancellation request for order ${current.order_id}. Reason: ${current.cancel_reason}. The store will review it and email you about the result. This request is not a refund confirmation.`, idempotencyKey: `cancel-buyer-${current.order_id}` });
      await env.DB.prepare("UPDATE zeltech_orders SET cancellation_email_sent = 1 WHERE order_id = ?").bind(current.order_id).run();
    } catch {
      return new Response("Your request was saved, but email delivery failed. Contact Zeltech directly to confirm it.", { status: 503 });
    }
  }
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><main style="font:16px Arial;max-width:560px;margin:12vh auto;padding:24px"><h1>Request received</h1><p>Zeltech received your cancellation request for ${escapeHtml(current.order_id)}. The store will review it and email you. This is not a refund confirmation.</p></main>`, { headers: { "content-type": "text/html; charset=utf-8" } });
}
