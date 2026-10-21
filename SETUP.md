# Zeltech EmailJS order requests

The checkout now sends an order request to Zeltech and an email copy to the buyer. It does not collect or verify payment. Zeltech must confirm the order and arrange GCash, Maya, bank transfer, or cash on delivery separately.

## 1. Create the EmailJS service and templates

In EmailJS, connect the email service that will send Zeltech messages, then create two templates.

**Owner order template**

- To Email: `yasuicide600@gmail.com` (set this directly in the template)
- Subject: `Zeltech order request {{order_id}} — payment pending`
- Reply-To: `{{customer_email}}`
- Include these variables in the body: `{{order_id}}`, `{{customer_name}}`, `{{customer_email}}`, `{{customer_phone}}`, `{{shipping_address}}`, `{{order_items}}`, `{{order_total}}`, `{{payment_preference}}`, and `{{payment_status}}`.

**Buyer receipt template**

- To Email: `{{customer_email}}`
- Subject: `We received your Zeltech order request {{order_id}}`
- Reply-To: `yasuicide600@gmail.com`
- Include the order ID, items, total, preferred payment arrangement, and a note that payment is still pending.

Use EmailJS's double-brace variables (`{{variable_name}}`) in each template. In the EmailJS dashboard, restrict allowed domains to the public Zeltech site domain, such as `zeltech.pages.dev`.

## 2. Add the EmailJS IDs to the site

Edit `emailjs-config.js` and replace the four `YOUR_EMAILJS_...` values with the EmailJS Public Key, Service ID, Owner Template ID, and Buyer Template ID. The public key is intended for browser use. Never put an EmailJS private key or email password in this file.

Deploy the site to Cloudflare Pages, then place a small test order and verify that both emails arrive. A success message means the order request emails were accepted; it does not mean the order was paid or confirmed.

## Customer cancellation and payment

Because this email-only flow does not store orders in the site database or process payments, customers should reply to the order email to request cancellation. Zeltech confirms payment manually through its chosen payment method. Automatic payment confirmation, refunds, and the prior Xendit cancellation workflow require a payment provider and server-side order storage.

