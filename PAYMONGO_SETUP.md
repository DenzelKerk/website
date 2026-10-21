# PayMongo checkout setup

The checkout API and payment-confirmation webhook run as Cloudflare Pages Functions. GitHub Pages serves only the static storefront and cannot run these functions.

## 1. Deploy the site with Cloudflare Pages

Connect this repository to a Cloudflare Pages project and deploy the repository root. Use the repository root as the output directory and no build command. Connect or move the public site domain to this Pages project so the storefront and /api/* functions use the same domain.

## 2. Configure the order database

Create a Cloudflare D1 database, then run schema.sql against it. Add the database to the Pages project as a D1 binding named DB.

## 3. Add server-side variables and secrets

Configure these in the Cloudflare Pages project. Keep secret values out of the repository and browser code.

- PAYMONGO_SECRET_KEY: PayMongo secret API key (sk_test_... while testing).
- PAYMONGO_WEBHOOK_SECRET: signing secret for the webhook endpoint created below.
- RESEND_API_KEY: Resend API key for order confirmation emails.
- ORDER_EMAIL_FROM: verified sender address used by Resend.
- ZELTECH_OWNER_EMAIL: optional order notification address; defaults to the address in the function.

## 4. Register the PayMongo webhook

In the PayMongo dashboard, add a webhook endpoint at https://<your-pages-domain>/api/paymongo-webhook and subscribe to checkout_session.payment.paid. Save the endpoint signing secret as PAYMONGO_WEBHOOK_SECRET in Cloudflare. Test mode and live mode use separate PayMongo webhook endpoints and secrets.

## 5. Verify before accepting live payments

Use PayMongo test keys and test-mode webhooks first. Complete a test order and confirm that the order is marked paid and confirmation emails arrive. Then configure the live API key and a live-mode webhook secret after PayMongo activates the needed payment methods on your merchant account.
