# Zeltech email-confirmation checkout

Checkout first emails the buyer a private review link. The buyer reviews the saved item list and confirms it from that link. Only after confirmation does Zeltech receive the order email. This flow does not collect payment; payment is arranged separately.

## 1. EmailJS service and templates

In EmailJS, connect the email service that will send Zeltech messages, then create two templates.

**Owner order template**

- To Email: `yasuicide600@gmail.com` (set this directly in the template)
- Subject: `Zeltech order request {{order_id}} — payment pending`
- Reply-To: `{{customer_email}}`
- Include these variables in the body: `{{order_id}}`, `{{customer_name}}`, `{{customer_email}}`, `{{customer_phone}}`, `{{shipping_address}}`, `{{order_items}}`, `{{order_total}}`, `{{payment_preference}}`, and `{{payment_status}}`.

**Buyer receipt template**

- To Email: `{{to_email}}` (the checkout sends the buyer's address in this field)
- Subject: `Confirm your Zeltech items {{order_id}}`
- Reply-To: `yasuicide600@gmail.com`
- Include `{{order_id}}`, `{{order_items}}`, `{{order_total}}`, `{{payment_preference}}`, and `{{payment_status}}`. `{{order_items}}` contains the review link. For a clickable button, add `{{confirmation_url}}` as the link target in the template.

Use EmailJS's double-brace variables (`{{variable_name}}`) in each template. In the EmailJS dashboard, restrict allowed domains to the public Zeltech site domain, such as `zeltech.pages.dev`.

## 2. Cloudflare Pages requirement

Deploy the repository to Cloudflare Pages with Functions enabled and bind the existing D1 database as `DB`. The confirmation endpoints create their table automatically. GitHub Pages cannot run these endpoints, so checkout confirmation must use the Cloudflare Pages URL. EmailJS sends the buyer's review email and notifies Zeltech after the buyer confirms. The site does not collect payment; Zeltech arranges GCash, Maya, bank transfer, or cash on delivery separately.

The public EmailJS key is intended for browser use. Never put an EmailJS private key or email password in the site files.

## Customer cancellation and payment

Unconfirmed review links expire after 24 hours. The confirmation page records the buyer's choice and notifies Zeltech; no payment is taken, and the order is not a paid order.

