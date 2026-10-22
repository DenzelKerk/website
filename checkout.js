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
        <p class="checkout-note">We’ll email your item list first. Reply to that email with CONFIRM to place the order, or CHANGE / CANCEL if needed. Zeltech receives your order only when you reply.</p>
        <div class="checkout-alert" id="checkout-alert" role="status" aria-live="polite"></div>
        <div class="checkout-actions"><button class="checkout-submit" id="checkout-submit" type="submit">Email my items for confirmation ✉</button></div><p class="checkout-provider">EMAIL CONFIRMATION FIRST — NO PAYMENT TAKEN</p></form>
      </div><aside class="checkout-aside"><p class="checkout-kicker">Order summary</p><div id="checkout-lines"></div><div class="checkout-total"><span>Items subtotal</span><strong id="checkout-subtotal">₱0</strong></div><p class="checkout-note">The email goes to you first. Reply CONFIRM to send your order to Zeltech.</p></aside></div>
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
    submit.textContent = "Email my items for confirmation ✉";
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

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (requestSent) return;
    alertBox.classList.remove("show", "success");
    if (!selectedPaymentMethod) {
      alertBox.textContent = "Choose a preferred payment arrangement to continue.";
      alertBox.classList.add("show");
      return;
    }

    const cartItems = (window.getCart() || []).map(item => ({ id: String(item.id), quantity: Number(item.qty) }));
    if (!cartItems.length || cartItems.some(item => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      alertBox.textContent = "Your cart needs a valid item before you can request email confirmation.";
      alertBox.classList.add("show");
      return;
    }

    const data = new FormData(form);
    const customerEmail = String(data.get("email")).trim();
    const requestBody = {
      name: String(data.get("name")).trim(),
      email: customerEmail,
      phone: String(data.get("phone")).trim(),
      address: String(data.get("address")).trim(),
      paymentPreference: selectedPaymentMethod,
      items: cartItems,
    };

    submit.disabled = true;
    submit.textContent = "Sending confirmation email…";
    try {
      const config = window.ZELTECH_EMAILJS_CONFIG;
      if (!config?.publicKey || !config?.serviceId || !config?.buyerTemplateId) {
        throw new Error("EmailJS is not configured. Check emailjs-config.js.");
      }
      const orderId = `ZEL-${Date.now().toString(36).toUpperCase()}`;
      const orderItems = (window.getCart() || []).map(item => `${Number(item.qty)} × ${item.name} — ${formatPeso(Number(item.qty) * Number(item.price))}`).join("\n");
      const templateParams = {
        order_id: orderId,
        customer_name: requestBody.name,
        customer_email: customerEmail,
        to_email: customerEmail,
        customer_phone: requestBody.phone,
        shipping_address: requestBody.address,
        order_items: `${orderItems}\n\nTo place this order, reply to this email with CONFIRM. Reply CHANGE to request an edit or CANCEL to stop. Zeltech receives the order only after you reply.`,
        order_total: formatPeso((window.getCart() || []).reduce((sum, item) => sum + Number(item.qty) * Number(item.price), 0)),
        payment_preference: requestBody.paymentPreference,
        payment_status: "Awaiting buyer email confirmation; no payment collected",
        reply_to: ownerEmail,
      };
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: config.serviceId,
          template_id: config.buyerTemplateId,
          user_id: config.publicKey,
          template_params: templateParams,
        }),
      });
      if (!response.ok) {
        const detail = (await response.text()).trim().slice(0, 240);
        throw new Error(`EmailJS could not send the confirmation email${detail ? `: ${detail}` : ". Check the EmailJS template and allowed domain."}`);
      }

      requestSent = true;
      if (typeof window.clearCart === "function") window.clearCart();
      paintSummary();
      form.reset();
      alertBox.textContent = `We sent your item list to ${customerEmail}. Reply to that email with CONFIRM to place the order, or CHANGE / CANCEL. Zeltech will receive it only after you reply. No payment has been collected.`;
      alertBox.classList.add("show", "success");
      submit.textContent = "Confirmation email sent ✓";
      if (typeof window.toast === "function") window.toast("Check your email to confirm your items");
    } catch (error) {
      alertBox.textContent = error.message || `Could not send the confirmation email. Contact ${ownerEmail} if you need help.`;
      alertBox.classList.add("show");
      submit.disabled = false;
      submit.textContent = "Email my items for confirmation ✉";
    }
  });
})();

