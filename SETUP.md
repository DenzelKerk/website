# Zeltech order emails and cancellations

The payment confirmation and cancellation emails run on **Cloudflare Pages Functions**. GitHub Pages can host the front-end files but cannot run these API endpoints. Deploy the site with the project root as the Pages build output, and keep the top-level `functions/` directory alongside `index.html`.

## 1. Create the order database

Create a Cloudflare D1 database and bind it to the Pages project using the binding name `DB`. Run `schema.sql` against that database before accepting orders.

## 2. Add server-side secrets and settings

Add these as Cloudflare Pages environment variables/secrets. Never put secret values into HTML or JavaScript.

- `XENDIT_SECRET_KEY`: Xendit secret API key.
- `XENDIT_CALLBACK_TOKEN`: the callback verification token from Xendit's invoice webhook settings.
- `RESEND_API_KEY`: Resend API key.
- `ORDER_EMAIL_FROM`: sender address on a domain verified with Resend, such as `Zeltech <orders@your-verified-domain>`.
- `ZELTECH_OWNER_EMAIL`: `yasuicide600@gmail.com` (optional; the code defaults to this address).

## 3. Configure Xendit

Enable the payment channels you want on your merchant account and set the invoice webhook URL to `https://YOUR_SITE/api/xendit-webhook`. A buyer is emailed only after the authenticated webhook reports the invoice as `PAID`; the browser return URL alone never marks an order paid.

## Buyer confirmation and cancellations

The buyer email contains the paid order summary and a **Request an order cancellation** link. The buyer chooses a reason (ordered by mistake, no longer needed, delivery issue, or other) and may add details. The request is recorded and emailed to the owner and buyer. It does not automatically refund a paid order; the owner reviews the request and handles any refund through Xendit.

Shipping is still arranged separately and is not included in the checkout total.
