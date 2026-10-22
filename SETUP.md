# Zeltech demo checkout (EmailJS)

This is a static-site demo. Checkout sends the buyer an email with their chosen items and total. The buyer replies **CONFIRM** to place the order, **CHANGE** to request an edit, or **CANCEL** to stop. Set the buyer template's Reply-To address to `yasuicide600@gmail.com`; the buyer's reply then goes directly to Zeltech. No order email is sent to Zeltech before the buyer replies, and this demo does not collect payment.

## EmailJS setup

The site reads its browser-safe EmailJS values from `emailjs-config.js`:

- `publicKey`: EmailJS public key
- `serviceId`: connected email service
- `buyerTemplateId`: buyer item-review template

The buyer template should use:

- **To Email:** `{{to_email}}` (the checkout sends this and compatible `email` / `buyer_email` aliases)
- **Reply-To:** `yasuicide600@gmail.com`
- **Subject:** `Review your Zeltech order {{order_id}}`
- **Body variables:** `{{order_id}}`, `{{customer_name}}`, `{{customer_email}}`, `{{customer_phone}}`, `{{shipping_address}}`, `{{order_items}}`, `{{order_total}}`, `{{payment_preference}}`, and `{{payment_status}}`.

The site appends the CONFIRM / CHANGE / CANCEL instructions to `{{order_items}}`. Add the public website domain to EmailJS's allowed origins, such as `denzelkerk.github.io` (or the custom domain you use). No Cloudflare Functions or database are needed.

The owner template ID is retained in the config for future use, but this static demo does not send the owner a message until the buyer replies to the review email.

## Limits of the demo

EmailJS sends the review email from the browser. It cannot detect or validate the buyer's reply, so Zeltech must treat the reply email as the buyer's confirmation. Payment is arranged separately through the selected method; this page does not process GCash, Maya, bank transfers, or card payments.

The EmailJS public key is intended for browser use. Never put an EmailJS private key or email password in the site files.

