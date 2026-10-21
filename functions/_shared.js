export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

export const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

export async function sendEmail(env, { to, subject, html, text, idempotencyKey, replyTo }) {
  if (!env.RESEND_API_KEY || !env.ORDER_EMAIL_FROM) throw new Error("Email delivery is not configured.");
  const payload = { from: env.ORDER_EMAIL_FROM, to: [to], subject, html, text };
  if (replyTo) payload.reply_to = replyTo;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}.`);
  return response.json();
}

export const money = value => `₱${Number(value).toLocaleString("en-PH")}`;

export function getOrderSummary(order) {
  const items = JSON.parse(order.items_json || "[]");
  return items.map(item => `${item.quantity} × ${item.name} — ${money(item.price * item.quantity)}`).join("\n");
}
