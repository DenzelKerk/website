(() => {
  const ownerEmail = "yasuicide600@gmail.com";
  const formatPeso = value => "₱" + Number(value).toLocaleString("en-PH");
  const style = document.createElement("style");
  style.textContent = `
    .checkout-backdrop{position:fixed;inset:0;z-index:30;background:#050808eF;display:none;overflow:auto;padding:28px 16px;align-items:center;justify-content:center}
    .checkout-backdrop.open{display:flex}.checkout-dialog{width:min(900px,100%);background:#111718;border:1px solid #34413c;border-radius:9px;box-shadow:0 25px 90px #000b;color:#f2f5ed;max-height:calc(100vh - 56px);overflow:auto}
    .checkout-head{display:flex;justify-content:space-between;align-items:center;padding:21px 25px;border-bottom:1px solid #293332}.checkout-head h2{font:500 22px 'Space Grotesk',sans-serif;margin:0}.checkout-close{border:1px solid #293332;background:transparent;border-radius:4px;width:36px;height:36px;font-size:20px;color:#f2f5ed}
    .checkout-grid{display:grid;grid-template-columns:1.1fr .9fr}.checkout-main{padding:24px;border-right:1px solid #293332}.checkout-aside{padding:24px;background:#141a1a}.checkout-kicker{font:10px 'DM Mono',monospace;color:#c6f36b;letter-spacing:.1em;text-transform:uppercase;margin:0 0 12px}.checkout-fields{display:grid;grid-template-columns:1fr 1fr;gap:13px}.checkout-field{display:flex;flex-direction:column;gap:7px}.checkout-field.wide{grid-column:1/-1}.checkout-field label{font:9px 'DM Mono',monospace;color:#a6b3ab;letter-spacing:.06em;text-transform:uppercase}.checkout-field input{background:#0c1011;border:1px solid #293332;border-radius:4px;padding:12px;color:#f2f5ed;font:12px 'DM Sans',sans-serif;outline:0}.checkout-field input:focus{border-color:#c6f36b}
    .checkout-methods{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:13px 0 0}.checkout-method{padding:10px;border:1px solid #293332;border-radius:4px;color:#d8dfd9;font:10px 'DM Mono',monospace;background:#0c1011;text-align:left;cursor:pointer;transition:.18s}.checkout-method:hover,.checkout-method[aria-pressed="true"]{border-color:#c6f36b;background:#c6f36b12;box-shadow:inset 0 0 0 1px #c6f36b55}.checkout-method:focus-visible{outline:2px solid #c6f36b;outline-offset:2px}.checkout-method span{display:block;color:#849189;font:10px 'DM Sans',sans-serif;margin-top:4px}.checkout-note{font-size:10px;line-height:1.6;color:#95a199;margin:12px 0 0}.checkout-line{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid #ffffff12;font-size:11px;color:#dce3dd}.checkout-line small{display:block;color:#89958e;margin-top:4px;font:10px 'DM Mono',monospace}.checkout-total{display:flex;justify-content:space-between;padding:17px 0;font:12px 'DM Mono',monospace}.checkout-total strong{font-weight:400;color:#c6f36b}.checkout-actions{display:flex;align-items:center;gap:12px;margin-top:14px}.checkout-submit{width:100%;border:0;background:#c6f36b;color:#151b10;border-radius:4px;padding:14px;font:500 11px 'DM Mono',monospace;cursor:pointer}.checkout-submit:disabled{opacity:.55;cursor:wait}.checkout-alert{display:none;margin-top:12px;padding:11px;border:1px solid #ff815955;background:#ff81590d;color:#ffc2ad;font-size:11px;line-height:1.5}.checkout-alert.show{display:block}.checkout-alert.success{border-color:#c6f36b66;background:#c6f36b0d;color:#d7f5a8}.checkout-provider{font:9px 'DM Mono',monospace;color:#c6f36b;text-align:center;margin-top:11px}
    @media(max-width:650px){.checkout-backdrop{padding:0}.checkout-dialog{max-height:100vh;border-radius:0}.checkout-grid{grid-template-columns:1fr}.checkout-main{border-right:0;border-bottom:1px solid #293332;padding:19px}.checkout-aside{padding:19px}.checkout-head{padding:17px 19px}.checkout-fields{grid-template-columns:1fr}.checkout-field.wide{grid-column:auto}}
  `;
  document.head.append(style);

  const backdrop = document.createElement("div");
  backdrop.className = "checkout-backdrop";
  backdrop.id = "checkout-backdrop";
  backdrop.innerHTML = `
    <section class="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <header class="checkout-head"><div><p class="checkout-kicker" style="margin-bottom:6px">Order request / PHP</p><h2 id="checkout-title">Checkout</h2></div><button class="checkout-close" type="button" aria-label="Close checkout">×</button></header>
      <div class="checkout-grid"><div class="checkout-main">
        <p class="checkout-kicker">Your contact and delivery details</p>
        <form id="zeltech-checkout-form"><div class="checkout-fields">
          <div class="checkout-field"><label for="checkout-name">Full name</label><input id="checkout-name" name="name" autocomplete="name" required minlength="2" maxlength="100"></div>
          <div class="checkout-field"><label for="checkout-phone">Mobile number</label><input id="checkout-phone" name="phone" autocomplete="tel" type="tel" required minlength="7" maxlength="32" placeholder="09XX XXX XXXX"></div>
          <div class="checkout-field wide"><label for="checkout-email">Email</label><input id="checkout-email" name="email" autocomplete="email" type="email" required maxlength="254"></div>
          <div class="checkout-field wide"><label for="checkout-address">Delivery address</label><input id="checkout-address" name="address" autocomplete="street-address" required minlength="8" maxlength="300" placeholder="Street, barangay, city, province"></div>
        </div>
        <p class="checkout-kicker" style="margin-top:24px">Preferred payment arrangement</p>
        <div class="checkout-methods" role="group" aria-label="Choose a preferred payment arrangement"><button class="checkout-method" type="button" data-payment-method="gcash" aria-pressed="false">GCash<span>We’ll send instructions by email</span></button><button class="checkout-method" type="button" data-payment-method="maya" aria-pressed="false">Maya<span>We’ll send instructions by email</span></button><button class="checkout-method" type="button" data-payment-method="bank" aria-pressed="false">Bank transfer<span>We’ll send instructions by email</span></button><button class="checkout-method" type="button" data-payment-method="cod" aria-pressed="false">Cash on delivery<span>Subject to Zeltech confirmation</span></button><button class="checkout-method" type="button" data-payment-method="contact" aria-pressed="false">Contact me<span>Help me choose later</span></button></div>
        <p class="checkout-note">This sends an order request to Zeltech. No payment is taken here. We’ll confirm availability and email you to arrange payment.</p>
        <div class="checkout-alert" id="checkout-alert" role="status" aria-live="polite"></div>
        <div class="checkout-actions"><button class="checkout-submit" id="checkout-submit" type="submit">Send order request ✉</button></div><p class="checkout-provider">ORDER REQUEST ONLY — PAYMENT IS ARRANGED SEPARATELY</p></form>
      </div><aside class="checkout-aside"><p class="checkout-kicker">Order summary</p><div id="checkout-lines"></div><div class="checkout-total"><span>Items subtotal</span><strong id="checkout-subtotal">₱0</strong></div><p class="checkout-note">Your order is not confirmed until Zeltech replies. Shipping and final availability will be confirmed by email.</p></aside></div>
    </section>`;
  document.body.append(backdrop);

  const modal = document.getElementById("checkout-backdrop");
  const form = document.getElementById("zeltech-checkout-form");
  const alertBox = document.getElementById("checkout-alert");
  const submit = document.getElementById("checkout-submit");
  let selectedPaymentMethod = "";
  let requestSent = false;

  backdrop.querySelectorAll("[data-payment-method]").forEach(button => button.addEventListener("click", () => {
    if (requestSent) return;
    selectedPaymentMethod = button.dataset.paymentMethod;
    backdrop.querySelectorAll("[data-payment-method]").forEach(option => option.setAttribute("aria-pressed", String(option === button)));
    alertBox.classList.remove("show", "success");
  }));

  function paintSummary() {
    const items = window.getCart() || [];
    document.getElementById("checkout-lines").innerHTML = items.map(item => `<div class="checkout-line"><div>${item.name}<small>${item.qty} × ${formatPeso(item.price)}</small></div><strong>${formatPeso(item.qty * item.price)}</strong></div>`).join("") || '<p class="checkout-note">Your cart is empty.</p>';
    document.getElementById("checkout-subtotal").textContent = formatPeso(items.reduce((sum, item) => sum + item.qty * item.price, 0));
  }

  function openCheckout() {
    if (!window.getCart() || !window.getCart().length) { window.alert("Add a product to your cart before checkout."); return; }
    requestSent = false;
    selectedPaymentMethod = "";
    backdrop.querySelectorAll("[data-payment-method]").forEach(option => option.setAttribute("aria-pressed", "false"));
    submit.disabled = false;
    submit.textContent = "Send order request ✉";
    alertBox.classList.remove("show", "success");
    alertBox.textContent = "";
    paintSummary();
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() { modal.classList.remove("open"); document.body.style.overflow = ""; }
  document.querySelector(".checkout-close").addEventListener("click", closeCheckout);
  modal.addEventListener("click", event => { if (event.target === modal) closeCheckout(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && modal.classList.contains("open")) closeCheckout(); });

  const cartButton = document.getElementById("checkout");
  cartButton.onclick = () => {
    if (document.getElementById("cart").classList.contains("open")) document.getElementById("cart").classList.remove("open");
    document.getElementById("scrim").classList.remove("open");
    document.getElementById("cart").setAttribute("aria-hidden", "true");
    openCheckout();
  };

  function emailJsConfigured(config) {
    return config && [config.publicKey, config.serviceId, config.ownerTemplateId, config.buyerTemplateId].every(value => typeof value === "string" && value.trim() && !value.startsWith("YOUR_EMAILJS_"));
  }

  async function sendEmail(templateId, publicKey, serviceId, params) {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: serviceId, template_id: templateId, user_id: publicKey, template_params: params }),
    });
    if (!response.ok) throw new Error("EmailJS could not send the order email. Check the EmailJS service, template, and domain settings.");
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (requestSent) return;
    alertBox.classList.remove("show", "success");
    if (!selectedPaymentMethod) {
      alertBox.textContent = "Choose a preferred payment arrangement to continue.";
      alertBox.classList.add("show");
      return;
    }

    const savedConfig = window.ZELTECH_EMAILJS_CONFIG;
    const config = emailJsConfigured(savedConfig) ? savedConfig : {
      publicKey: "Qji7gvMFo3M8V5oAL",
      serviceId: "service_5jgu7m9",
      ownerTemplateId: "template_khraumm",
      buyerTemplateId: "template_8cqlw3g",
    };
    if (!emailJsConfigured(config)) {
      alertBox.textContent = "EmailJS is not connected yet. Zeltech must add the EmailJS service ID, both template IDs, and public key to emailjs-config.js.";
      alertBox.classList.add("show");
      return;
    }

    const cartItems = (window.getCart() || []).map(item => ({ name: String(item.name), quantity: Number(item.qty), price: Number(item.price) }));
    if (!cartItems.length || cartItems.some(item => !Number.isInteger(item.quantity) || item.quantity < 1 || !Number.isFinite(item.price) || item.price < 0)) {
      alertBox.textContent = "Your cart needs a valid item before you can send an order request.";
      alertBox.classList.add("show");
      return;
    }

    const data = new FormData(form);
    const orderId = `ZEL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const customerName = String(data.get("name")).trim();
    const customerEmail = String(data.get("email")).trim();
    const itemsText = cartItems.map(item => `${item.quantity} × ${item.name} — ${formatPeso(item.price * item.quantity)}`).join("\n");
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const paymentLabels = { gcash: "GCash", maya: "Maya", bank: "Bank transfer", cod: "Cash on delivery", contact: "Contact me about options" };
    const templateParams = {
      order_id: orderId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: String(data.get("phone")).trim(),
      shipping_address: String(data.get("address")).trim(),
      order_items: itemsText,
      order_total: formatPeso(total),
      payment_preference: paymentLabels[selectedPaymentMethod],
      payment_status: "PENDING — order request only; no payment collected",
      reply_to: customerEmail,
    };

    submit.disabled = true;
    submit.textContent = "Sending order request…";
    try {
      await sendEmail(config.ownerTemplateId, config.publicKey, config.serviceId, templateParams);
      let buyerReceiptSent = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 1100));
        await sendEmail(config.buyerTemplateId, config.publicKey, config.serviceId, templateParams);
      } catch {
        buyerReceiptSent = false;
      }

      requestSent = true;
      if (typeof window.clearCart === "function") window.clearCart();
      paintSummary();
      form.reset();
      alertBox.textContent = buyerReceiptSent
        ? `Order request ${orderId} sent to Zeltech. A copy was sent to your email. No payment has been collected; wait for Zeltech to confirm your order and payment instructions.`
        : `Order request ${orderId} reached Zeltech, but we could not send your email copy. No payment has been collected. Contact ${ownerEmail} if you need to follow up.`;
      alertBox.classList.add("show", "success");
      submit.textContent = "Order request sent ✓";
      if (typeof window.toast === "function") window.toast("Order request sent — payment is pending");
    } catch (error) {
      alertBox.textContent = error.message || "Could not send the order request. Please try again or contact Zeltech.";
      alertBox.classList.add("show");
      submit.disabled = false;
      submit.textContent = "Send order request ✉";
    }
  });
})();

