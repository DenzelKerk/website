import { escapeHtml, json } from "../_shared.js";
import { ensureConfirmationTable, formatMoney, hashConfirmationToken, summarizeItems } from "../_confirmation.js";

const EMAILJS = {
  publicKey: "Qji7gvMFo3M8V5oAL",
  serviceId: "service_5jgu7m9",
  ownerTemplateId: "template_khraumm",
};

async function findOrder(env, rawToken) {
  if (!rawToken || !/^[a-f0-9]{64}$/.test(rawToken)) return null;
  const tokenHash = await hashConfirmationToken(rawToken);
  return env.DB.prepare("SELECT * FROM zeltech_email_confirmations WHERE token_hash = ?").bind(tokenHash).first();
}

function page(title, content, status = 200) {
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} — Zeltech</title><body style="margin:0;background:#0c1011;color:#f2f5ed;font:16px Arial,sans-serif;padding:24px"><main style="max-width:620px;margin:8vh auto;background:#121819;border:1px solid #34413c;border-radius:10px;padding:28px"><p style="color:#c6f36b;text-transform:uppercase;font:11px monospace">Zeltech / Order confirmation</p><h1 style="font-size:27px">${escapeHtml(title)}</h1>${content}</main></body></html>`, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

function orderDetails(order) {
  const items = JSON.parse(order.items_json || "[]");
  const lines = items.map(item => `<li>${Number(item.quantity)} × ${escapeHtml(item.name)} — ${formatMoney(Number(item.price) * Number(item.quantity))}</li>`).join("");
  return `<p><b>Order:</b> ${escapeHtml(order.order_id)}</p><ul>${lines}</ul><p><b>Items total:</b> ${formatMoney(order.amount)}</p><p style="color:#aeb9b3;line-height:1.6">No payment has been taken. Zeltech will contact you to confirm availability and payment arrangements.</p>`;
}

async function emailOwner(order, siteOrigin) {
  const params = {
    order_id: order.order_id,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    shipping_address: order.shipping_address,
    order_items: summarizeItems(JSON.parse(order.items_json || "[]")),
    order_total: formatMoney(order.amount),
    payment_preference: order.preferred_payment_method,
    payment_status: "Buyer confirmed by email; no payment collected",
    reply_to: order.customer_email,
  };
  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "content-type": "application/json", origin: siteOrigin },
    body: JSON.stringify({ service_id: EMAILJS.serviceId, template_id: EMAILJS.ownerTemplateId, user_id: EMAILJS.publicKey, template_params: params }),
  });
  if (!response.ok) throw new Error((await response.text()).trim().slice(0, 300) || `EmailJS error ${response.status}`);
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return page("Confirmation is unavailable", "<p>Order confirmation storage is not configured.</p>", 503);
  await ensureConfirmationTable(env.DB);
  const token = new URL(request.url).searchParams.get("token") || "";
  const order = await findOrder(env, token);
  if (!order || order.status === "EMAIL_CONFIRMATION_FAILED" || Number(order.expires_at) < Date.now()) {
    return page("Link not available", "<p>This confirmation link is invalid or expired. Return to Zeltech checkout to request another email.</p>", 404);
  }
  if (order.status === "EMAIL_CONFIRMED") return page("Order already confirmed", `${orderDetails(order)}<p>Your confirmation has already been recorded.</p>`);
  if (order.status !== "AWAITING_EMAIL_CONFIRMATION") return page("Order cannot be confirmed", "<p>This order is no longer waiting for email confirmation.</p>", 409);

  const content = `${orderDetails(order)}<form method="post" action="/api/confirm-order"><input type="hidden" name="token" value="${escapeHtml(token)}"><button style="background:#c6f36b;color:#111718;border:0;border-radius:4px;padding:14px 18px;font-weight:bold;cursor:pointer">Confirm these items</button></form><p style="color:#aeb9b3;font-size:12px;line-height:1.5">If these items are wrong, close this page and return to checkout. No payment is taken on this page.</p>`;
  return page("Review your items", content);
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return page("Confirmation is unavailable", "<p>Order confirmation storage is not configured.</p>", 503);
  await ensureConfirmationTable(env.DB);
  const form = await request.formData();
  const token = String(form.get("token") || "");
  const order = await findOrder(env, token);
  if (!order || Number(order.expires_at) < Date.now()) return page("Link not available", "<p>This confirmation link is invalid or expired.</p>", 404);
  if (order.status !== "AWAITING_EMAIL_CONFIRMATION" && order.status !== "EMAIL_CONFIRMED") {
    return page("Order cannot be confirmed", "<p>This order is no longer waiting for email confirmation.</p>", 409);
  }

  if (order.status === "AWAITING_EMAIL_CONFIRMATION") {
    await env.DB.prepare("UPDATE zeltech_email_confirmations SET status = 'EMAIL_CONFIRMED' WHERE order_id = ? AND status = 'AWAITING_EMAIL_CONFIRMATION'").bind(order.order_id).run();
  }
  const current = await env.DB.prepare("SELECT * FROM zeltech_email_confirmations WHERE order_id = ?").bind(order.order_id).first();
  if (!current.owner_email_sent) {
    try {
      await emailOwner(current, new URL(request.url).origin);
      await env.DB.prepare("UPDATE zeltech_email_confirmations SET owner_email_sent = 1 WHERE order_id = ?").bind(current.order_id).run();
    } catch {
      return page("Your items are confirmed", `${orderDetails(current)}<p>We recorded your confirmation, but could not notify Zeltech by email. Please contact <a style="color:#c6f36b" href="mailto:yasuicide600@gmail.com">Zeltech support</a> and include order ${escapeHtml(current.order_id)}.</p><form method="post" action="/api/confirm-order"><input type="hidden" name="token" value="${escapeHtml(token)}"><button style="background:#c6f36b;border:0;padding:10px;cursor:pointer">Retry notifying Zeltech</button></form>`, 503);
    }
  }

  return page("Your items are confirmed", `${orderDetails(current)}<p>Zeltech has been notified. Check your email for availability and payment instructions.</p>`);
}

