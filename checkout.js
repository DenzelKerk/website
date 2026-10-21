(() => {
  const ownerEmail = "yasuicide600@gmail.com";
  const formatPeso = value => "₱" + Number(value).toLocaleString("en-PH");
  const style = document.createElement("style");
  style.textContent = `
    .checkout-backdrop{position:fixed;inset:0;z-index:30;background:#050808eF;display:none;overflow:auto;padding:28px 16px;align-items:center;justify-content:center}
    .checkout-backdrop.open{display:flex}.checkout-dialog{width:min(900px,100%);background:#111718;border:1px solid #34413c;border-radius:9px;box-shadow:0 25px 90px #000b;color:#f2f5ed;max-height:calc(100vh - 56px);overflow:auto}
    .checkout-head{display:flex;justify-content:space-between;align-items:center;padding:21px 25px;border-bottom:1px solid #293332}.checkout-head h2{font:500 22px 'Space Grotesk',sans-serif;margin:0}.checkout-close{border:1px solid #293332;background:transparent;border-radius:4px;width:36px;height:36px;font-size:20px;color:#f2f5ed}
    .checkout-grid{display:grid;grid-template-columns:1.1fr .9fr}.checkout-main{padding:24px;border-right:1px solid #293332}.checkout-aside{padding:24px;background:#141a1a}.checkout-kicker{font:10px 'DM Mono',monospace;color:#c6f36b;letter-spacing:.1em;text-transform:uppercase;margin:0 0 12px}.checkout-fields{display:grid;grid-template-columns:1fr 1fr;gap:13px}.checkout-field{display:flex;flex-direction:column;gap:7px}.checkout-field.wide{grid-column:1/-1}.checkout-field label{font:9px 'DM Mono',monospace;color:#a6b3ab;letter-spacing:.06em;text-transform:uppercase}.checkout-field input{background:#0c1011;border:1px solid #293332;border-radius:4px;padding:12px;color:#f2f5ed;font:12px 'DM Sans',sans-serif;outline:0}.checkout-field input:focus{border-color:#c6f36b}
    .checkout-methods{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:13px 0 0}.checkout-method{padding:10px;border:1px solid #293332;border-radius:4px;color:#d8dfd9;font:10px 'DM Mono',monospace;background:#0c1011;text-align:left;cursor:pointer;transition:.18s}.checkout-method:hover,.checkout-method[aria-pressed="true"]{border-color:#c6f36b;background:#c6f36b12;box-shadow:inset 0 0 0 1px #c6f36b55}.checkout-method:focus-visible{outline:2px solid #c6f36b;outline-offset:2px}.checkout-method span{display:block;color:#849189;font:10px 'DM Sans',sans-serif;margin-top:4px}.checkout-note{font-size:10px;line-height:1.6;color:#95a199;margin:12px 0 0}.checkout-line{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid #ffffff12;font-size:11px;color:#dce3dd}.checkout-line small{display:block;color:#89958e;margin-top:4px;font:10px 'DM Mono',monospace}.checkout-total{display:flex;justify-content:space-between;padding:17px 0;font:12px 'DM Mono',monospace}.checkout-total strong{font-weight:400;color:#c6f36b}.checkout-actions{display:flex;align-items:center;gap:12px;margin-top:14px}.checkout-submit{width:100%;border:0;background:#c6f36b;color:#151b10;border-radius:4px;padding:14px;font:500 11px 'DM Mono',monospace}.checkout-submit:disabled{opacity:.55;cursor:wait}.checkout-alert{display:none;margin-top:12px;padding:11px;border:1px solid #ff815955;background:#ff81590d;color:#ffc2ad;font-size:11px;line-height:1.5}.checkout-alert.show{display:block}.checkout-provider{font:9px 'DM Mono',monospace;color:#85928a;text-align:center;margin-top:11px}
    @media(max-width:650px){.checkout-backdrop{padding:0}.checkout-dialog{max-height:100vh;border-radius:0}.checkout-grid{grid-template-columns:1fr}.checkout-main{border-right:0;border-bottom:1px solid #293332;padding:19px}.checkout-aside{padding:19px}.checkout-head{padding:17px 19px}.checkout-fields{grid-template-columns:1fr}.checkout-field.wide{grid-column:auto}}
  `;
  document.head.append(style);
  const backdrop = document.createElement("div");
  backdrop.className = "checkout-backdrop";
  backdrop.id = "checkout-backdrop";
  backdrop.innerHTML = `
    <section class="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <header class="checkout-head"><div><p class="checkout-kicker" style="margin-bottom:6px">Secure payment / PHP</p><h2 id="checkout-title">Checkout</h2></div><button class="checkout-close" type="button" aria-label="Close checkout">×</button></header>
      <div class="checkout-grid"><div class="checkout-main">
        <p class="checkout-kicker">Delivery details</p>
        <form id="zeltech-checkout-form"><div class="checkout-fields">
          <div class="checkout-field"><label for="checkout-name">Full name</label><input id="checkout-name" name="name" autocomplete="name" required minlength="2"></div>
          <div class="checkout-field"><label for="checkout-phone">Mobile number</label><input id="checkout-phone" name="phone" autocomplete="tel" type="tel" required minlength="7" placeholder="09XX XXX XXXX"></div>
          <div class="checkout-field wide"><label for="checkout-email">Email</label><input id="checkout-email" name="email" autocomplete="email" type="email" required></div>
          <div class="checkout-field wide"><label for="checkout-address">Delivery address</label><input id="checkout-address" name="address" autocomplete="street-address" required placeholder="Street, barangay, city, province"></div>
        </div>
        <p class="checkout-kicker" style="margin-top:24px">Online payment options</p>
        <div class="checkout-methods" role="group" aria-label="Choose a preferred payment method"><button class="checkout-method" type="button" data-payment-method="gcash" aria-pressed="false">GCash<span>E-wallet</span></button><button class="checkout-method" type="button" data-payment-method="maya" aria-pressed="false">Maya<span>E-wallet</span></button><button class="checkout-method" type="button" data-payment-method="grabpay" aria-pressed="false">GrabPay<span>E-wallet</span></button><button class="checkout-method" type="button" data-payment-method="shopeepay" aria-pressed="false">ShopeePay<span>E-wallet</span></button><button class="checkout-method" type="button" data-payment-method="qrph" aria-pressed="false">QR Ph<span>Scan to pay</span></button><button class="checkout-method" type="button" data-payment-method="bank" aria-pressed="false">BDO / BPI / other banks<span>Online bank channels</span></button><button class="checkout-method" type="button" data-payment-method="card" aria-pressed="false">Credit / debit cards<span>Card checkout</span></button></div>
        <p class="checkout-note">You’ll pay on PayMongo’s secure checkout using the selected method, if it is enabled on Zeltech’s account. Shipping is arranged separately; checkout charges the item subtotal shown.</p>
        <div class="checkout-alert" id="checkout-alert" role="alert"></div>
        <div class="checkout-actions"><button class="checkout-submit" id="checkout-submit" type="submit">Continue to secure payment ↗</button></div><p class="checkout-provider">PAYMENT DETAILS ARE ENTERED ON PAYMONGO — NEVER ON THIS PAGE</p></form>
      </div><aside class="checkout-aside"><p class="checkout-kicker">Order summary</p><div id="checkout-lines"></div><div class="checkout-total"><span>Items subtotal</span><strong id="checkout-subtotal">₱0</strong></div><p class="checkout-note">After payment, keep your PayMongo receipt. Zeltech will contact you about shipping.</p></aside></div>
    </section>`;
  document.body.append(backdrop);
  const modal = document.getElementById("checkout-backdrop");
  const form = document.getElementById("zeltech-checkout-form");
  const alertBox = document.getElementById("checkout-alert");
  let selectedPaymentMethod = "";
  backdrop.querySelectorAll("[data-payment-method]").forEach(button => button.addEventListener("click", () => {
    selectedPaymentMethod = button.dataset.paymentMethod;
    backdrop.querySelectorAll("[data-payment-method]").forEach(option => option.setAttribute("aria-pressed", String(option === button)));
    alertBox.classList.remove("show");
  }));
  function paintSummary() {
    const items = window.getCart() || [];
    document.getElementById("checkout-lines").innerHTML = items.map(item => `<div class="checkout-line"><div>${item.name}<small>${item.qty} × ${formatPeso(item.price)}</small></div><strong>${formatPeso(item.qty * item.price)}</strong></div>`).join("") || '<p class="checkout-note">Your cart is empty.</p>';
    document.getElementById("checkout-subtotal").textContent = formatPeso(items.reduce((sum, item) => sum + item.qty * item.price, 0));
  }
  function openCheckout() {
    if (!window.getCart() || !window.getCart().length) { window.alert("Add a product to your cart before checkout."); return; }
    paintSummary(); alertBox.classList.remove("show"); alertBox.textContent = ""; modal.classList.add("open"); document.body.style.overflow = "hidden";
  }
  function closeCheckout() { modal.classList.remove("open"); document.body.style.overflow = ""; }
  document.querySelector(".checkout-close").addEventListener("click", closeCheckout);
  modal.addEventListener("click", event => { if (event.target === modal) closeCheckout(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && modal.classList.contains("open")) closeCheckout(); });
  const cartButton = document.getElementById("checkout");
  cartButton.onclick = () => { if (document.getElementById("cart").classList.contains("open")) document.getElementById("cart").classList.remove("open"); document.getElementById("scrim").classList.remove("open"); document.getElementById("cart").setAttribute("aria-hidden", "true");; openCheckout(); };
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const submit = document.getElementById("checkout-submit");
    alertBox.classList.remove("show");
    if (!selectedPaymentMethod) { alertBox.textContent = "Choose a payment method to continue."; alertBox.classList.add("show"); return; }
    submit.disabled = true; submit.textContent = "Creating secure checkout…";
    try {
      const data = new FormData(form);
      const response = await fetch("/api/create-payment", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: data.get("name"), email: data.get("email"), phone: data.get("phone"), address: data.get("address"), items: (window.getCart() || []).map(item => ({ id: item.id, quantity: item.qty })), paymentPreference: selectedPaymentMethod }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not start payment. Please try again.");
      const paymentUrl = new URL(result.checkoutUrl);
      if (paymentUrl.protocol !== "https:" || paymentUrl.hostname !== "checkout.paymongo.com") throw new Error("PayMongo returned an invalid checkout link.");
      window.location.assign(paymentUrl.href);
    } catch (error) {
      const customer = Object.fromEntries(new FormData(form).entries());
      const items = window.getCart() || [];
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const orderDetails = [
        "ORDER REQUEST — PAYMENT NOT YET MADE",
        "",
        "Customer: " + customer.name,
        "Email: " + customer.email,
        "Mobile: " + customer.phone,
        "Delivery address: " + customer.address,
        "Preferred payment method: " + selectedPaymentMethod,
        "",
        "Items:",
        ...items.map(item => item.qty + " × " + item.name + " — " + formatPeso(item.price * item.qty)),
        "",
        "Items subtotal: " + formatPeso(subtotal),
      ].join("\n");
      alertBox.textContent = (error.message || "Online checkout is temporarily unavailable.") + " This website could not start a payment. You can email an order request instead; it will not charge you.";
      const emailLink = document.createElement("a");
      emailLink.href = "mailto:" + ownerEmail + "?subject=" + encodeURIComponent("Zeltech order request") + "&body=" + encodeURIComponent(orderDetails);
      emailLink.textContent = "Email order request";
      emailLink.style.cssText = "display:inline-block;margin-top:8px;color:#c6f36b;text-decoration:underline;font-weight:600";
      alertBox.append(document.createElement("br"), emailLink);
      alertBox.classList.add("show");
    } finally {
      submit.disabled = false; submit.textContent = "Continue to secure payment ↗";
    }
  });
  window.addEventListener("load", () => {
    const status = new URLSearchParams(location.search).get("payment");
    if (status === "returned") { document.getElementById("toast").textContent = "Returned from checkout. Payment confirmation may take a moment."; document.getElementById("toast").classList.add("show"); }
    else if (status === "cancelled") { document.getElementById("toast").textContent = "Checkout was cancelled. Your cart is still here."; document.getElementById("toast").classList.add("show"); }
  });
})();



