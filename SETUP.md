# Zeltech EmailJS order requests

The checkout sends an order request to Zeltech and an email copy to the buyer. It does not collect or verify payment. Zeltech must confirm the order and arrange GCash, Maya, bank transfer, or cash on delivery separately.

## EmailJS service and templates

The EmailJS service and two templates are set up. The site configuration points to the owner order template and the buyer receipt template. Confirm each template matches these settings:

**Owner order template**

- To Email: `yasuicide600@gmail.com`
- Subject: `Zeltech order request {{order_id}} — payment pending`
- Reply-To: `{{customer_email}}`
- Include `{{order_id}}`, `{{customer_name}}`, `{{customer_email}}`, `{{customer_phone}}`, `{{shipping_address}}`, `{{order_items}}`, `{{order_total}}`, `{{payment_preference}}`, and `{{payment_status}}` in the body.

**Buyer receipt template**

- To Email: `{{customer_email}}`
- Subject: `We received your Zeltech order request {{order_id}}`
- Reply-To: `yasuicide600@gmail.com`
- Include the order ID, items, total, preferred payment arrangement, and a note that payment is still pending.

Use EmailJS's double-brace variables (`{{variable_name}}`) in each template. In the EmailJS dashboard, allow the public Zeltech site domain, such as `zeltech.pages.dev`, if domain restrictions are enabled.

## Deploy and verify

The current EmailJS IDs are configured in `emailjs-config.js`. The public key is intended for browser use. Never put an EmailJS private key or email password in the site files.

Deploy the site to Cloudflare Pages, then place a small test order with an email address you can access and verify that both emails arrive. A success message means the order request emails were accepted; it does not mean the order was paid or confirmed.

## Customer cancellation and payment

Because this email-only flow does not store orders in the site database or process payments, customers should reply to the order email to request cancellation. Zeltech confirms payment manually through its chosen payment method. Automatic payment confirmation, refunds, and the prior Xendit cancellation workflow require a payment provider and server-side order storage.
