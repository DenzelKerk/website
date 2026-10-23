(() => {
  "use strict";

  const cfg = window.ZELTECH_EMAILJS_CONFIG || {};
  const ownerEmail = cfg.ownerEmail || "yasuicide600@gmail.com";
  const ADMIN_PASSWORD = cfg.adminPassword || "babsi123";
  const ORDERS_STORAGE_KEY = "zeltech_orders_db_v2";

  let activeOrderId = null;
  let isAdminUnlocked = false;
  let selectedPaymentMethod = "Credit Card";

  const formatPeso = value =>
    "₱" +
    Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  /* =====================================================================
     1. INJECT ZELTECH STYLES FOR CHECKOUT, PORTAL, ADMIN & INVOICE MODAL
     ===================================================================== */
  const style = document.createElement("style");
  style.textContent = `
    .checkout-backdrop{position:fixed;inset:0;z-index:30;background:#050808eb;display:none;overflow:auto;padding:28px 16px;align-items:center;justify-content:center}
    .checkout-backdrop.open{display:flex}
    .checkout-dialog{width:min(960px,100%);background:#111718;border:1px solid #34413c;border-radius:9px;box-shadow:0 25px 90px #000b;color:#f2f5ed;max-height:calc(100vh - 56px);overflow:auto}
    .checkout-head{display:flex;justify-content:space-between;align-items:center;padding:20px 25px;border-bottom:1px solid #293332}
    .checkout-head h2{font:500 22px 'Space Grotesk',sans-serif;margin:0}
    .checkout-close{border:1px solid #293332;background:transparent;border-radius:4px;width:36px;height:36px;font-size:20px;color:#f2f5ed}
    .checkout-grid{display:grid;grid-template-columns:1.15fr .85fr}
    .checkout-main{padding:24px;border-right:1px solid #293332}
    .checkout-aside{padding:24px;background:#141a1a}
    .checkout-kicker{font:10px 'DM Mono',monospace;color:#c6f36b;letter-spacing:.1em;text-transform:uppercase;margin:0 0 12px}
    .checkout-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .checkout-field{display:flex;flex-direction:column;gap:6px}
    .checkout-field.wide{grid-column:1/-1}
    .checkout-field label{font:9px 'DM Mono',monospace;color:#a6b3ab;letter-spacing:.06em;text-transform:uppercase}
    .checkout-field input,.checkout-field select,.checkout-field textarea{background:#0c1011;border:1px solid #293332;border-radius:4px;padding:11px 12px;color:#f2f5ed;font:12px 'DM Sans',sans-serif;outline:0}
    .checkout-field input:focus,.checkout-field select:focus{border-color:#c6f36b}
    .digit-counter{font:10px 'DM Mono',monospace;color:#89958e;margin-top:2px}
    .checkout-bill-after-details{margin-top:16px;padding:14px 16px;background:#0c1011;border:1px solid #c6f36b66;border-radius:6px}
    .checkout-bill-row{display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#d1d8d1}
    .checkout-bill-row.grand{border-top:1px solid #293332;margin-top:6px;padding-top:8px;font:600 15px 'DM Mono',monospace;color:#c6f36b}
    .checkout-methods{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0 14px}
    .checkout-method{padding:11px;border:1px solid #293332;border-radius:4px;color:#d8dfd9;font:11px 'DM Mono',monospace;background:#0c1011;text-align:left;cursor:pointer;transition:.18s}
    .checkout-method:hover,.checkout-method[aria-pressed="true"]{border-color:#c6f36b;background:#c6f36b14;box-shadow:inset 0 0 0 1px #c6f36b55}
    .checkout-method span{display:block;color:#849189;font:10px 'DM Sans',sans-serif;margin-top:4px}
    .brand-pills{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0 14px}
    .brand-pill{display:flex;align-items:center;gap:8px;padding:9px 11px;background:#0c1011;border:1px solid #293332;border-radius:4px;cursor:pointer;font:11px 'DM Mono',monospace;color:#d8dfd9}
    .brand-pill:has(input:checked){border-color:#c6f36b;background:#c6f36b18;color:#c6f36b}
    .checkout-line{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #ffffff12;font-size:11px;color:#dce3dd}
    .checkout-line small{display:block;color:#89958e;margin-top:3px;font:10px 'DM Mono',monospace}
    .checkout-total{display:flex;justify-content:space-between;padding:15px 0;font:13px 'DM Mono',monospace}
    .checkout-total strong{font-weight:500;color:#c6f36b}
    .checkout-submit{width:100%;border:0;background:#c6f36b;color:#151b10;border-radius:4px;padding:14px;font:500 11px 'DM Mono',monospace;cursor:pointer;margin-top:12px}
    .checkout-submit:disabled{opacity:.55;cursor:wait}
    .checkout-alert{display:none;margin-top:12px;padding:11px;border:1px solid #ff815955;background:#ff81590d;color:#ffc2ad;font-size:11px;line-height:1.5;border-radius:4px}
    .checkout-alert.show{display:block}
    .checkout-alert.success{border-color:#c6f36b66;background:#c6f36b0d;color:#d7f5a8}
    .checkout-note{font-size:10px;line-height:1.6;color:#95a199;margin:10px 0 0}

    /* Portal & Admin Section */
    .zt-portal-wrap{border-top:1px solid #ffffff12;border-bottom:1px solid #ffffff12;padding:72px 0;margin-bottom:60px}
    .zt-portal-bar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;background:#121819;border:1px solid #293332;border-radius:7px;padding:14px 18px;margin-bottom:20px}
    .zt-portal-card{background:#121819;border:1px solid #293332;border-radius:7px;padding:24px}
    .zt-pill{display:inline-block;padding:4px 10px;border-radius:3px;font:10px 'DM Mono',monospace;text-transform:uppercase}
    .zt-pill.approved{background:#c6f36b22;color:#c6f36b;border:1px solid #c6f36b66}
    .zt-pill.cancelled{background:#ff815922;color:#ff8159;border:1px solid #ff815966}
    .zt-btn-danger{border:1px solid #ff8159;background:#ff81591a;color:#ff8159;padding:10px 14px;border-radius:4px;font:11px 'DM Mono',monospace;cursor:pointer}
    .zt-btn-danger:hover{background:#ff8159;color:#12180e}

    /* Official Printable Invoice Modal */
    .zt-inv-modal{position:fixed;inset:0;z-index:40;background:#050808eb;display:none;align-items:center;justify-content:center;padding:20px;overflow:auto}
    .zt-inv-modal.open{display:flex}
    .zt-inv-sheet{background:#ffffff;color:#0f172a;width:min(600px,100%);border-radius:8px;padding:30px;box-shadow:0 25px 80px #000c;font-family:'DM Sans',sans-serif}
    .zt-inv-head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #e2e8f0;padding-bottom:14px;margin-bottom:14px}
    .zt-inv-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px;gap:12px}
    .zt-inv-row.total{border-top:2px solid #0f172a;border-bottom:0;padding-top:10px;margin-top:6px;font:700 16px 'DM Mono',monospace}
    @media(max-width:700px){.checkout-grid,.checkout-fields,.checkout-methods,.brand-pills{grid-template-columns:1fr}.checkout-main{border-right:0;border-bottom:1px solid #293332}}
    @media print{body *{visibility:hidden}#zt-invoice-modal,#zt-printable-sheet,#zt-printable-sheet *{visibility:visible}#zt-invoice-modal{position:absolute;inset:0;background:#fff;padding:0}.no-print{display:none!important}}
  `;
  document.head.append(style);

  /* =====================================================================
     2. MOUNT ON-PAGE ORDER, REFUND & OWNER ADMIN PORTAL (#order-portal)
     ===================================================================== */
  const portalMount = document.getElementById("zeltech-portal-mount");
  if (portalMount) {
    portalMount.innerHTML = `
      <section class="zt-portal-wrap" id="order-portal">
        <div class="wrap">
          <div class="section-head">
            <div>
              <div class="section-kicker">Order Tracker / 10% Refund Portal / Owner Admin</div>
              <h2 class="section-title">Manage Order, Invoice &amp; Cancellation.</h2>
            </div>
            <p class="section-sub">Open your order from your email link or enter your Order ID below. Cancelling within 2–3 days automatically deducts a 10% holding fee and emails an updated Refund Invoice Receipt.</p>
          </div>

          <div class="zt-portal-bar">
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" class="iconbtn" id="zt-tab-cust" style="border-color:var(--lime);color:var(--lime);">👤 Customer Order &amp; Refund View</button>
              <button type="button" class="iconbtn" id="zt-tab-admin" hidden>🛠️ Owner Admin Panel (Unlocked)</button>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="text" id="zt-lookup-input" placeholder="Order ID (e.g. ZEL-1024)" style="background:#0c1011;border:1px solid #293332;border-radius:4px;padding:9px 12px;color:#f2f5ed;font:11px var(--mono);">
              <button type="button" class="iconbtn" id="zt-lookup-btn">Load Order</button>
            </div>
          </div>

          <div id="zt-cust-panel" class="zt-portal-card">
            <div id="zt-active-order-box">
              <p style="color:var(--muted);font-size:13px;margin:0;">No active order loaded yet. Add products or services to your cart and complete checkout, or click the Cancellation / Receipt link inside your email.</p>
            </div>
          </div>

          <div id="zt-admin-panel" class="zt-portal-card" hidden>
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;border-bottom:1px solid #293332;padding-bottom:14px;margin-bottom:16px;">
              <div>
                <h3 style="margin:0;font:500 18px var(--display);">🛠️ Zeltech Owner Admin Dashboard (Password: babsi123)</h3>
                <p style="margin:4px 0 0;font-size:12px;color:var(--muted);">View customer orders, Total Bills, 16-digit bank/card approvals, and 10% cancellation receipts.</p>
              </div>
              <div style="display:flex;gap:8px;">
                <button type="button" class="iconbtn" id="zt-clear-demo-btn">🧹 Clear Demo Data</button>
                <button type="button" class="zt-btn-danger" id="zt-lock-admin-btn">🔒 Lock Admin</button>
              </div>
            </div>
            <div id="zt-admin-orders-list" style="display:grid;gap:12px;"></div>
          </div>
        </div>
      </section>
    `;
  }

  /* =====================================================================
     3. MOUNT CHECKOUT DIALOG & PRINTABLE INVOICE RECEIPT MODAL
     ===================================================================== */
  const backdrop = document.createElement("div");
  backdrop.className = "checkout-backdrop";
  backdrop.id = "checkout-backdrop";
  backdrop.innerHTML = `
    <section class="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <header class="checkout-head">
        <div>
          <p class="checkout-kicker" style="margin-bottom:4px">Instant Online Approval &amp; Invoice / PHP</p>
          <h2 id="checkout-title">Zeltech Checkout &amp; Payment</h2>
        </div>
        <button class="checkout-close" type="button" aria-label="Close checkout">×</button>
      </header>
      <div class="checkout-grid">
        <div class="checkout-main">
          <p class="checkout-kicker">1. Your Contact &amp; Delivery Details</p>
          <form id="zeltech-checkout-form" novalidate>
            <div class="checkout-fields">
              <div class="checkout-field">
                <label for="checkout-name">Full name *</label>
                <input id="checkout-name" name="name" autocomplete="name" required placeholder="Juan dela Cruz">
              </div>
              <div class="checkout-field">
                <label for="checkout-phone">Mobile number (Numbers Only) *</label>
                <input id="checkout-phone" name="phone" autocomplete="tel" type="tel" required maxlength="11" placeholder="09171234567">
              </div>
              <div class="checkout-field wide">
                <label for="checkout-email">Customer Email (Receives Invoice &amp; Cancel Link) *</label>
                <input id="checkout-email" name="email" autocomplete="email" type="email" required placeholder="customer@gmail.com">
              </div>
              <div class="checkout-field wide">
                <label for="checkout-address">Delivery / Service Address *</label>
                <input id="checkout-address" name="address" autocomplete="street-address" required placeholder="Street, Barangay, City, Province">
              </div>
            </div>

            <!-- CONDITION 3: AMOUNT ADDED AFTER CHECKOUT DETAILS -->
            <div class="checkout-bill-after-details">
              <p class="checkout-kicker" style="margin-bottom:6px">2. Total Bill Amount After Checkout Details (Customer &amp; Owner Copy)</p>
              <div class="checkout-bill-row"><span>Cart Items &amp; Services Count:</span><strong id="modal-detail-count">0</strong></div>
              <div class="checkout-bill-row"><span>10% Cancellation Fee (If cancelled within 2–3 days):</span><strong id="modal-detail-fee" style="color:#ff8159;">-₱0.00</strong></div>
              <div class="checkout-bill-row grand"><span>Total Bill to Avail:</span><span id="modal-detail-total">₱0.00</span></div>
            </div>

            <p class="checkout-kicker" style="margin-top:18px">3. Choose Payment Method</p>
            <div class="checkout-methods" role="group" aria-label="Choose a payment method">
              <button class="checkout-method" type="button" data-payment-method="Credit Card" aria-pressed="true">💳 Credit Card<span>Visa, Mastercard, JCB, Amex (16 digits)</span></button>
              <button class="checkout-method" type="button" data-payment-method="Online Bank Transfer" aria-pressed="false">🏦 Online Bank Transfer<span>BDO, BPI, Landbank, Metrobank (16 digits)</span></button>
              <button class="checkout-method" type="button" data-payment-method="Debit Card" aria-pressed="false">🏧 Debit Card<span>16-Digit Bank Card Checkout</span></button>
              <button class="checkout-method" type="button" data-payment-method="GCash" aria-pressed="false">📱 GCash E-Wallet<span>11-Digit Mobile Wallet</span></button>
            </div>

            <!-- CREDIT / DEBIT CARD BRANDS -->
            <div id="zt-card-brands-box">
              <label style="font:9px 'DM Mono',monospace;color:#c6f36b;text-transform:uppercase;">Select Credit / Debit Card Brand:</label>
              <div class="brand-pills">
                <label class="brand-pill"><input type="radio" name="ztCardBrand" value="Visa" checked><span>💳 Visa</span></label>
                <label class="brand-pill"><input type="radio" name="ztCardBrand" value="Mastercard"><span>💳 Mastercard</span></label>
                <label class="brand-pill"><input type="radio" name="ztCardBrand" value="JCB"><span>💳 JCB</span></label>
                <label class="brand-pill"><input type="radio" name="ztCardBrand" value="American Express"><span>💳 American Express</span></label>
              </div>
            </div>

            <!-- ONLINE BANKING 4 BANKS (BDO, BPI, LANDBANK, METROBANK) -->
            <div id="zt-bank-brands-box" hidden>
              <label style="font:9px 'DM Mono',monospace;color:#c6f36b;text-transform:uppercase;">Select Online Bank (Strictly 16 Numbers Only — No Letters):</label>
              <div class="brand-pills">
                <label class="brand-pill"><input type="radio" name="ztBankBrand" value="BDO" checked><span>🏦 BDO (16 Digits)</span></label>
                <label class="brand-pill"><input type="radio" name="ztBankBrand" value="BPI"><span>🏦 BPI (16 Digits)</span></label>
                <label class="brand-pill"><input type="radio" name="ztBankBrand" value="Landbank"><span>🏦 Landbank (16 Digits)</span></label>
                <label class="brand-pill"><input type="radio" name="ztBankBrand" value="Metrobank"><span>🏦 Metrobank (16 Digits)</span></label>
              </div>
            </div>

            <!-- 16-DIGIT CARD / BANK FIELDS -->
            <div id="zt-16digit-group" class="checkout-fields">
              <div class="checkout-field wide">
                <label for="zt-holder-name" id="zt-holder-label">Cardholder Name *</label>
                <input id="zt-holder-name" type="text" placeholder="NAME ON CARD / BANK ACCOUNT">
              </div>
              <div class="checkout-field wide">
                <label for="zt-card-16" id="zt-card-16-label">Visa Card Number (Strictly 16 Numbers — No Letters) *</label>
                <input id="zt-card-16" type="text" inputmode="numeric" maxlength="16" placeholder="16 numbers only (no letters allowed)">
                <span id="zt-digit-counter" class="digit-counter">0 / 16 digits entered (Numbers only, no letters)</span>
              </div>
              <div class="checkout-field" id="zt-exp-wrap">
                <label for="zt-card-exp">Expiration Date (MM/YY) *</label>
                <input id="zt-card-exp" type="text" maxlength="5" placeholder="MM/YY">
              </div>
              <div class="checkout-field" id="zt-cvv-wrap">
                <label for="zt-card-cvv">CVV Security Code (3 Digits) *</label>
                <input id="zt-card-cvv" type="password" inputmode="numeric" maxlength="3" placeholder="123">
              </div>
            </div>

            <!-- GCASH FIELD -->
            <div id="zt-gcash-group" class="checkout-fields" hidden>
              <div class="checkout-field wide">
                <label for="zt-gcash-num">GCash Mobile Number (11 Digits — Numbers Only) *</label>
                <input id="zt-gcash-num" type="text" inputmode="numeric" maxlength="11" placeholder="09171234567">
              </div>
            </div>

            <div class="checkout-alert" id="checkout-alert" role="status" aria-live="polite"></div>
            <button class="checkout-submit" id="checkout-submit" type="submit">Authorize Payment &amp; Send Invoice Receipt ↗</button>
          </form>
        </div>

        <aside class="checkout-aside">
          <p class="checkout-kicker">Order Summary &amp; Total Bill</p>
          <div id="checkout-lines"></div>
          <div class="checkout-total">
            <span>Total Bill to Avail</span>
            <strong id="checkout-subtotal">₱0.00</strong>
          </div>
          <p class="checkout-note">
            <strong>Automated Email &amp; Refund Policy:</strong><br>
            Both you and Zeltech (${ownerEmail}) will automatically receive the Official Approval &amp; Invoice Receipt by email. If you cancel within 2–3 days via the email portal link, a <strong>10% holding fee</strong> is deducted and a Refund Invoice is emailed automatically.
          </p>
        </aside>
      </div>
    </section>
  `;
  document.body.append(backdrop);

  const invModal = document.createElement("div");
  invModal.className = "zt-inv-modal";
  invModal.id = "zt-invoice-modal";
  invModal.innerHTML = `
    <div class="zt-inv-sheet" id="zt-printable-sheet">
      <div class="zt-inv-head">
        <div>
          <span style="font:700 10px 'DM Mono',monospace;color:#3f6212;letter-spacing:.1em;">ZELTECH ENGINEERING • OFFICIAL RECEIPT</span>
          <h3 id="zt-inv-title" style="margin:4px 0;font:600 20px 'Space Grotesk',sans-serif;color:#0f172a;">Official Approval &amp; Invoice Receipt</h3>
          <small style="color:#64748b;font-size:11px;">Owner Copy &amp; Customer Copy • ${ownerEmail}</small>
        </div>
        <span id="zt-inv-badge" class="zt-pill approved" style="background:#16a34a;color:#fff;">APPROVED</span>
      </div>
      <div id="zt-inv-body"></div>
      <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:10px 12px;margin:14px 0;font-size:11px;color:#334155;">
        <strong>2–3 Day / 10% Cancellation Policy:</strong> Cancelling an approved order within 2–3 days automatically deducts <strong>10% of the Total Bill</strong> as a service/holding fee and refunds the remaining 90%. Copies of this official receipt have been emailed to both the Customer and Zeltech.
      </div>
      <div class="no-print" style="display:flex;justify-content:flex-end;gap:8px;">
        <button type="button" class="iconbtn" style="color:#0f172a;border-color:#94a3b8;" onclick="window.print()">🖨️ Print / Save PDF</button>
        <button type="button" class="iconbtn" style="background:#152012;color:#c6f36b;border-color:#152012;" id="zt-inv-close">Done</button>
      </div>
    </div>
  `;
  document.body.append(invModal);

  document.getElementById("zt-inv-close").onclick = () => invModal.classList.remove("open");

  /* =====================================================================
     4. STRICT NUMBERS-ONLY ENFORCEMENT (NO LETTERS ALLOWED)
     ===================================================================== */
  function bindDigitsOnly(inputId, maxDigits, counterId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener("input", () => {
      el.value = el.value.replace(/\D/g, "").slice(0, maxDigits);
      if (counterId) {
        const c = document.getElementById(counterId);
        if (c) {
          c.textContent = `${el.value.length} / ${maxDigits} digits entered (Numbers only, no letters)`;
          c.style.color = el.value.length === maxDigits ? "#c6f36b" : "#89958e";
        }
      }
    });
  }

  bindDigitsOnly("checkout-phone", 11);
  bindDigitsOnly("zt-card-16", 16, "zt-digit-counter");
  bindDigitsOnly("zt-card-cvv", 3);
  bindDigitsOnly("zt-gcash-num", 11);

  const expEl = document.getElementById("zt-card-exp");
  expEl.addEventListener("input", () => {
    const d = expEl.value.replace(/\D/g, "").slice(0, 4);
    expEl.value = d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  });

  function syncMethodFields() {
    const isCard = selectedPaymentMethod === "Credit Card" || selectedPaymentMethod === "Debit Card";
    const isBank = selectedPaymentMethod === "Online Bank Transfer";
    const isGCash = selectedPaymentMethod === "GCash";

    document.getElementById("zt-card-brands-box").hidden = !isCard;
    document.getElementById("zt-bank-brands-box").hidden = !isBank;
    document.getElementById("zt-16digit-group").hidden = isGCash;
    document.getElementById("zt-exp-wrap").hidden = !isCard;
    document.getElementById("zt-cvv-wrap").hidden = !isCard;
    document.getElementById("zt-gcash-group").hidden = !isGCash;

    const holderLbl = document.getElementById("zt-holder-label");
    const numLbl = document.getElementById("zt-card-16-label");

    if (isCard) {
      const brand = document.querySelector('input[name="ztCardBrand"]:checked')?.value || "Visa";
      holderLbl.textContent = `${brand} Cardholder Name *`;
      numLbl.textContent = `${brand} ${selectedPaymentMethod} Number (Strictly 16 Numbers — No Letters) *`;
    } else if (isBank) {
      const bank = document.querySelector('input[name="ztBankBrand"]:checked')?.value || "BDO";
      holderLbl.textContent = `${bank} Account / Cardholder Name *`;
      numLbl.textContent = `${bank} Card / Account Number (Strictly 16 Numbers — No Letters) *`;
    }
  }

  backdrop.querySelectorAll("[data-payment-method]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedPaymentMethod = btn.dataset.paymentMethod;
      backdrop.querySelectorAll("[data-payment-method]").forEach(b =>
        b.setAttribute("aria-pressed", String(b === btn))
      );
      syncMethodFields();
    });
  });

  backdrop.querySelectorAll('input[name="ztCardBrand"], input[name="ztBankBrand"]').forEach(r =>
    r.addEventListener("change", syncMethodFields)
  );

  /* =====================================================================
     5. SYNC CHECKOUT SUMMARY & AMOUNT AFTER CHECKOUT DETAILS
     ===================================================================== */
  function paintSummary() {
    const items = window.getCart ? window.getCart() : [];
    const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const tenFee = +(total * 0.10).toFixed(2);

    document.getElementById("checkout-lines").innerHTML =
      items
        .map(
          item =>
            `<div class="checkout-line"><div>${item.name}<small>${item.qty} × ${formatPeso(item.price)}</small></div><strong>${formatPeso(item.qty * item.price)}</strong></div>`
        )
        .join("") || '<p class="checkout-note">Your cart is empty.</p>';

    document.getElementById("checkout-subtotal").textContent = formatPeso(total);
    document.getElementById("modal-detail-count").textContent = `${count} item(s)`;
    document.getElementById("modal-detail-fee").textContent = `-${formatPeso(tenFee)}`;
    document.getElementById("modal-detail-total").textContent = formatPeso(total);
  }
  window.syncCheckoutSummary = paintSummary;

  const modal = document.getElementById("checkout-backdrop");
  const form = document.getElementById("zeltech-checkout-form");
  const alertBox = document.getElementById("checkout-alert");
  const submit = document.getElementById("checkout-submit");

  function openCheckout() {
    if (!window.getCart || !window.getCart().length) {
      if (typeof window.toast === "function") window.toast("Add a product or service to your cart first");
      return;
    }
    alertBox.classList.remove("show", "success");
    alertBox.textContent = "";
    paintSummary();
    syncMethodFields();
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelector(".checkout-close").addEventListener("click", closeCheckout);
  modal.addEventListener("click", event => {
    if (event.target === modal) closeCheckout();
  });

  const cartButton = document.getElementById("checkout");
  if (cartButton) {
    cartButton.onclick = () => {
      document.getElementById("cart")?.classList.remove("open");
      document.getElementById("scrim")?.classList.remove("open");
      openCheckout();
    };
  }

  /* =====================================================================
     6. EMAILJS DUAL DISPATCHER (CUSTOMER & OWNER COPIES + CANCEL LINK)
     ===================================================================== */
  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveOrders(list) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list));
    renderAdminDashboard();
  }

  function buildCancelPortalLink(order) {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      order: order.id,
      action: "cancel",
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: order.address,
      total: String(order.totalBill),
      method: order.paymentMethod,
      invoice: order.invoiceNo
    });
    return `${base}?${params.toString()}#order-portal`;
  }

  async function sendOneEmailJS(templateId, recipientEmail, recipientName, subjectLine, order, summaryText) {
    const cancelLink = buildCancelPortalLink(order);
    const templateParams = {
      to_email: recipientEmail,
      email: recipientEmail,
      buyer_email: recipientEmail,
      customer_email: order.customerEmail,
      to_name: recipientName,
      customer_name: order.customerName,
      name: order.customerName,
      customer_phone: order.customerPhone,
      shipping_address: order.address,
      subject: subjectLine,
      email_subject: subjectLine,
      order_id: order.id,
      invoice_id: order.invoiceNo,
      invoice_no: order.invoiceNo,
      order_items: summaryText,
      message: summaryText,
      message_body: summaryText,
      order_total: formatPeso(order.totalBill),
      amount: formatPeso(order.totalBill),
      payment_preference: order.paymentMethod,
      payment_method: order.paymentMethod,
      payment_status: order.status,
      status: order.status,
      cancel_link: cancelLink,
      action_link: cancelLink,
      reply_to: ownerEmail
    };

    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: cfg.serviceId,
        template_id: templateId,
        user_id: cfg.publicKey,
        template_params: templateParams
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt);
    }
    return true;
  }

  async function dispatchBuyerAndOwnerEmails(subjectLine, order, summaryText) {
    if (!cfg.publicKey || !cfg.serviceId || !cfg.buyerTemplateId) return false;
    const ownerTpl = cfg.ownerTemplateId || cfg.buyerTemplateId;

    const results = await Promise.allSettled([
      sendOneEmailJS(cfg.buyerTemplateId, order.customerEmail, order.customerName, subjectLine, order, summaryText),
      sendOneEmailJS(ownerTpl, ownerEmail, "Zeltech Owner", `[OWNER COPY] ${subjectLine}`, order, `[OWNER COPY]\n${summaryText}`)
    ]);

    // If ownerTemplateId has a fixed issue, fallback to buyerTemplateId for ownerEmail
    if (results[1].status === "rejected" && ownerTpl !== cfg.buyerTemplateId) {
      try {
        await sendOneEmailJS(cfg.buyerTemplateId, ownerEmail, "Zeltech Owner", `[OWNER COPY] ${subjectLine}`, order, `[OWNER COPY]\n${summaryText}`);
      } catch (e) {}
    }

    return results[0].status === "fulfilled" || results[1].status === "fulfilled";
  }

  /* =====================================================================
     7. SUBMIT CHECKOUT, VALIDATE 16-DIGIT BANK/CARD & SEND RECEIPT
     ===================================================================== */
  function showAlert(msg, isSuccess = false) {
    alertBox.textContent = msg;
    alertBox.className = "checkout-alert show" + (isSuccess ? " success" : "");
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    alertBox.classList.remove("show", "success");

    const cart = window.getCart ? window.getCart() : [];
    if (!cart.length) return showAlert("Your cart is empty.");

    const name = document.getElementById("checkout-name").value.trim();
    const phone = document.getElementById("checkout-phone").value.trim();
    const email = document.getElementById("checkout-email").value.trim();
    const address = document.getElementById("checkout-address").value.trim();

    if (!name || name.length < 2) return showAlert("Please enter your full name.");
    if (!/^\d{10,11}$/.test(phone)) return showAlert("Enter a valid 10 or 11 digit mobile number (numbers only).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAlert("Enter a valid email address.");
    if (!address || address.length < 5) return showAlert("Enter your delivery or service address.");

    let paymentDetail = "";
    let approvalCode = "";

    if (selectedPaymentMethod === "Online Bank Transfer") {
      const bank = document.querySelector('input[name="ztBankBrand"]:checked')?.value || "BDO";
      const holder = document.getElementById("zt-holder-name").value.trim();
      const cardNum = document.getElementById("zt-card-16").value.trim();
      if (!holder) return showAlert(`Please enter the ${bank} Account / Cardholder Name.`);
      if (!/^\d{16}$/.test(cardNum)) {
        return showAlert(`${bank} Card / Account Number must be strictly 16 numbers (no letters allowed).`);
      }
      paymentDetail = `Online Bank Transfer — ${bank} (**** **** **** ${cardNum.slice(-4)})`;
      approvalCode = `BNK-${bank.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    } else if (selectedPaymentMethod === "Credit Card" || selectedPaymentMethod === "Debit Card") {
      const brand = document.querySelector('input[name="ztCardBrand"]:checked')?.value || "Visa";
      const holder = document.getElementById("zt-holder-name").value.trim();
      const cardNum = document.getElementById("zt-card-16").value.trim();
      const exp = document.getElementById("zt-card-exp").value.trim();
      const cvv = document.getElementById("zt-card-cvv").value.trim();
      if (!holder) return showAlert(`Please enter the ${brand} Cardholder Name.`);
      if (!/^\d{16}$/.test(cardNum)) {
        return showAlert(`${brand} ${selectedPaymentMethod} Number must be strictly 16 numbers (no letters allowed).`);
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) return showAlert("Enter Expiration Date in MM/YY format.");
      if (!/^\d{3}$/.test(cvv)) return showAlert("Enter a 3-digit numeric CVV code.");
      paymentDetail = `${selectedPaymentMethod} — ${brand} (**** **** **** ${cardNum.slice(-4)})`;
      approvalCode = `AUTH-${brand.slice(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    } else {
      const gcash = document.getElementById("zt-gcash-num").value.trim();
      if (!/^09\d{9}$/.test(gcash)) return showAlert("Enter a valid 11-digit GCash number starting with 09.");
      paymentDetail = `GCash E-Wallet (${gcash})`;
      approvalCode = `GCASH-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    const totalBill = cart.reduce((s, i) => s + i.qty * i.price, 0);
    const tenFee = +(totalBill * 0.10).toFixed(2);

    const newOrder = {
      id: "ZEL-" + Math.floor(1000 + Math.random() * 9000),
      invoiceNo: "ZEL-INV-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000),
      approvalCode,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      address,
      items: cart.map(i => ({ ...i })),
      totalBill,
      paymentMethod: paymentDetail,
      status: "APPROVED & PAID",
      createdAt: Date.now(),
      cancelledAt: null,
      deductionFee: 0,
      netRefund: 0
    };

    submit.disabled = true;
    submit.textContent = "Authorizing Transaction & Sending Emails…";

    const orders = getOrders();
    orders.unshift(newOrder);
    saveOrders(orders);
    activeOrderId = newOrder.id;
    if (document.getElementById("zt-lookup-input")) {
      document.getElementById("zt-lookup-input").value = newOrder.id;
    }

    const cancelUrl = buildCancelPortalLink(newOrder);
    const itemsLines = newOrder.items
      .map(i => `• ${i.qty} × ${i.name} — ${formatPeso(i.qty * i.price)}`)
      .join("\n");

    const receiptEmailBody =
      `OFFICIAL ZELTECH TRANSACTION APPROVAL & INVOICE RECEIPT\n` +
      `--------------------------------------------------------\n` +
      `Invoice No.: ${newOrder.invoiceNo}\n` +
      `Order ID: ${newOrder.id}\n` +
      `Approval Reference: ${newOrder.approvalCode}\n` +
      `Customer: ${newOrder.customerName} (${newOrder.customerEmail})\n` +
      `Payment Method: ${newOrder.paymentMethod}\n\n` +
      `ITEMIZED PRODUCTS & SERVICES:\n${itemsLines}\n` +
      `--------------------------------------------------------\n` +
      `TOTAL BILL PAID: ${formatPeso(newOrder.totalBill)}\n` +
      `--------------------------------------------------------\n` +
      `2–3 DAY REFUND & CANCELLATION POLICY (10% FEE):\n` +
      `To cancel this order or view your cancellation receipt within 2–3 days (10% deduction fee of ${formatPeso(tenFee)} applies), open your Order Portal link:\n${cancelUrl}`;

    await dispatchBuyerAndOwnerEmails(
      `Zeltech Official Approval & Invoice [${newOrder.invoiceNo}]`,
      newOrder,
      receiptEmailBody
    );

    if (typeof window.clearCart === "function") window.clearCart();
    form.reset();
    submit.disabled = false;
    submit.textContent = "Authorize Payment & Send Invoice Receipt ↗";

    closeCheckout();
    renderCustomerPortal(newOrder.id);
    openInvoiceModal(newOrder.id);
    if (typeof window.toast === "function") {
      window.toast(`Order ${newOrder.id} Approved! Invoice emailed to Customer & Owner.`);
    }
  });

  /* =====================================================================
     8. CANCEL ORDER WITHIN 2–3 DAYS (10% DEDUCTION) & AUTO REFUND INVOICE
     ===================================================================== */
  window.cancelZeltechOrder = async function(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status.includes("CANCELLED")) return;

    const fee = +(order.totalBill * 0.10).toFixed(2);
    const netRefund = +(order.totalBill - fee).toFixed(2);

    const confirmed = window.confirm(
      `ZELTECH 2–3 DAY CANCELLATION & 10% DEDUCTION POLICY:\n\n` +
      `Cancelling Order ${order.id} within 2–3 days automatically deducts 10% of the Total Bill:\n\n` +
      `• Original Total Bill Paid: ${formatPeso(order.totalBill)}\n` +
      `• Less 10% Cancellation / Holding Fee: -${formatPeso(fee)}\n` +
      `• Net Automated Refund to Customer (90%): ${formatPeso(netRefund)}\n\n` +
      `Confirm cancellation and automatically email the Cancellation & Refund Invoice Receipt to Customer and Owner?`
    );
    if (!confirmed) return;

    order.status = "CANCELLED (10% FEE DEDUCTED)";
    order.cancelledAt = Date.now();
    order.deductionFee = fee;
    order.netRefund = netRefund;
    order.invoiceNo = "ZEL-REF-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);

    saveOrders(orders);
    renderCustomerPortal(order.id);
    openInvoiceModal(order.id);

    const cancelBody =
      `OFFICIAL ZELTECH CANCELLATION & 10% DEDUCTION REFUND INVOICE\n` +
      `--------------------------------------------------------\n` +
      `Refund Invoice No.: ${order.invoiceNo}\n` +
      `Cancelled Order ID: ${order.id}\n` +
      `Customer: ${order.customerName} (${order.customerEmail})\n` +
      `Payment Method: ${order.paymentMethod}\n` +
      `Original Total Bill: ${formatPeso(order.totalBill)}\n` +
      `Less 10% Cancellation Fee (Within 2–3 Days): -${formatPeso(fee)}\n` +
      `Net Refund Issued to Customer (90%): ${formatPeso(netRefund)}\n` +
      `--------------------------------------------------------`;

    await dispatchBuyerAndOwnerEmails(
      `Zeltech Cancellation & 10% Deduction Refund Invoice [${order.invoiceNo}]`,
      order,
      cancelBody
    );

    if (typeof window.toast === "function") {
      window.toast(`Order ${order.id} cancelled (10% deducted). Refund Invoice sent!`);
    }
  };

  /* =====================================================================
     9. RENDER CUSTOMER PORTAL, INVOICE MODAL & OWNER ADMIN (babsi123)
     ===================================================================== */
  window.openInvoiceModal = function(orderId) {
    const order = getOrders().find(o => o.id === orderId);
    if (!order) return;

    const isCancelled = order.status.includes("CANCELLED");
    document.getElementById("zt-inv-title").textContent = isCancelled
      ? "Cancellation & 10% Deduction Refund Invoice"
      : "Official Transaction Approval & Invoice Receipt";

    const badge = document.getElementById("zt-inv-badge");
    badge.textContent = order.status;
    badge.style.background = isCancelled ? "#dc2626" : "#16a34a";

    const itemRows = (order.items || [])
      .map(
        i =>
          `<div class="zt-inv-row"><span>• ${i.qty} × ${i.name}</span><strong>${formatPeso(i.qty * i.price)}</strong></div>`
      )
      .join("");

    document.getElementById("zt-inv-body").innerHTML = `
      <div class="zt-inv-row"><span>Invoice Number</span><strong>${order.invoiceNo}</strong></div>
      <div class="zt-inv-row"><span>Order Reference ID</span><strong>${order.id}</strong></div>
      <div class="zt-inv-row"><span>Approval / Reference Code</span><strong>${order.approvalCode}</strong></div>
      <div class="zt-inv-row"><span>Date &amp; Time</span><strong>${new Date(order.cancelledAt || order.createdAt).toLocaleString()}</strong></div>
      <div class="zt-inv-row"><span>Customer</span><strong>${order.customerName} (${order.customerEmail})</strong></div>
      <div class="zt-inv-row"><span>Delivery Address</span><strong>${order.address}</strong></div>
      <div class="zt-inv-row"><span>Payment Method</span><strong>${order.paymentMethod}</strong></div>
      <div style="margin-top:8px;font:700 10px 'DM Mono',monospace;color:#3f6212;">ITEMIZED PRODUCTS &amp; SERVICES</div>
      ${itemRows}
      <div class="zt-inv-row total"><span>Total Bill Amount</span><span>${formatPeso(order.totalBill)}</span></div>
      ${
        isCancelled
          ? `<div class="zt-inv-row" style="color:#dc2626;font-weight:700;"><span>Less: 10% Cancellation Fee (Within 2–3 Days)</span><span>-${formatPeso(order.deductionFee)}</span></div>
             <div class="zt-inv-row total" style="color:#16a34a;"><span>Net Refund Issued to Customer (90%)</span><span>${formatPeso(order.netRefund)}</span></div>`
          : ""
      }
    `;

    invModal.classList.add("open");
  };

  function renderCustomerPortal(orderId) {
    const box = document.getElementById("zt-active-order-box");
    if (!box) return;
    const orders = getOrders();
    const order = orders.find(o => o.id === (orderId || activeOrderId)) || orders[0];

    if (!order) {
      box.innerHTML = `<p style="color:var(--muted);font-size:13px;margin:0;">No active order loaded yet. Add products or services to your cart and complete checkout, or click the Cancellation / Receipt link inside your email.</p>`;
      return;
    }

    activeOrderId = order.id;
    const isCancelled = order.status.includes("CANCELLED");
    const fee = +(order.totalBill * 0.10).toFixed(2);
    const net = +(order.totalBill - fee).toFixed(2);

    const itemsHTML = (order.items || [])
      .map(
        i =>
          `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #ffffff12;font-size:12px;">
            <span>${i.qty} × ${i.name}</span><strong>${formatPeso(i.qty * i.price)}</strong>
          </div>`
      )
      .join("");

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;border-bottom:1px solid #293332;padding-bottom:14px;">
        <div>
          <div class="sku" style="color:var(--lime);">ORDER ID: ${order.id} • INVOICE: ${order.invoiceNo}</div>
          <h3 style="margin:6px 0 4px;font:500 20px var(--display);">${order.customerName} (${order.customerEmail})</h3>
          <small style="color:var(--muted);font:11px var(--mono);">${order.paymentMethod} • Approval: ${order.approvalCode}</small>
        </div>
        <span class="zt-pill ${isCancelled ? "cancelled" : "approved"}">${order.status}</span>
      </div>

      <div style="margin:14px 0;">
        ${itemsHTML}
        <div style="display:flex;justify-content:space-between;padding-top:10px;font:600 16px var(--mono);color:var(--lime);">
          <span>Total Bill Paid:</span><span>${formatPeso(order.totalBill)}</span>
        </div>
      </div>

      ${
        isCancelled
          ? `<div style="background:#ff815914;border-left:3px solid var(--orange);padding:12px;border-radius:4px;font-size:12px;margin:12px 0;">
              <strong style="color:var(--orange);">Cancelled Within 2–3 Days — 10% Holding Fee Deducted:</strong><br>
              Original Total Bill: ${formatPeso(order.totalBill)} | Less 10% Fee: -${formatPeso(order.deductionFee)} | <strong>Net Refund: ${formatPeso(order.netRefund)}</strong>
            </div>`
          : `<div style="background:#c6f36b12;border-left:3px solid var(--lime);padding:12px;border-radius:4px;font-size:12px;margin:12px 0;">
              <strong>2–3 Day Refund &amp; Cancellation Policy:</strong> Cancelling this order deducts a <strong>10% fee (-${formatPeso(fee)})</strong> from your Total Bill and issues a <strong>Net Refund of ${formatPeso(net)}</strong> with an automated Refund Invoice Receipt.
            </div>`
      }

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
        <button type="button" class="btn" onclick="openInvoiceModal('${order.id}')">🧾 View / Print Official Invoice Receipt</button>
        ${
          !isCancelled
            ? `<button type="button" class="zt-btn-danger" onclick="cancelZeltechOrder('${order.id}')">✕ Cancel Order &amp; Request Refund (10% Deduction)</button>`
            : ""
        }
      </div>
    `;
  }

  function renderAdminDashboard() {
    const listEl = document.getElementById("zt-admin-orders-list");
    if (!listEl) return;
    const orders = getOrders();
    if (!orders.length) {
      listEl.innerHTML = `<p style="color:var(--muted);font-size:12px;">No orders recorded yet.</p>`;
      return;
    }

    listEl.innerHTML = orders
      .map(o => {
        const isCancelled = o.status.includes("CANCELLED");
        return `
          <div style="background:#171e1e;border:1px solid #293332;border-radius:6px;padding:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <div>
              <span class="sku" style="color:var(--lime);">${o.id} • ${o.invoiceNo}</span>
              <h4 style="margin:4px 0;font:500 15px var(--display);">${o.customerName} (${o.customerEmail})</h4>
              <small style="color:var(--muted);display:block;font:10px var(--mono);">${o.paymentMethod} | Approval: ${o.approvalCode}</small>
              <strong style="font:500 13px var(--mono);color:var(--text);">Total Bill: ${formatPeso(o.totalBill)} ${
          isCancelled ? `| Deducted 10%: -${formatPeso(o.deductionFee)} | Net Refund: ${formatPeso(o.netRefund)}` : ""
        }</strong>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" class="iconbtn" onclick="openInvoiceModal('${o.id}')">🧾 View Receipt</button>
              ${
                !isCancelled
                  ? `<button type="button" class="zt-btn-danger" onclick="cancelZeltechOrder('${o.id}')">✕ Cancel (10% Fee)</button>`
                  : ""
              }
            </div>
          </div>
        `;
      })
      .join("");
  }

  function switchPortalTab(tab) {
    const isCust = tab === "cust";
    document.getElementById("zt-cust-panel").hidden = !isCust;
    document.getElementById("zt-admin-panel").hidden = isCust;
    if (!isCust) renderAdminDashboard();
  }

  document.getElementById("zt-tab-cust")?.addEventListener("click", () => switchPortalTab("cust"));
  document.getElementById("zt-tab-admin")?.addEventListener("click", () => {
    if (isAdminUnlocked) switchPortalTab("admin");
  });

  document.getElementById("admin-open-btn")?.addEventListener("click", () => {
    if (isAdminUnlocked) {
      switchPortalTab("admin");
      document.getElementById("order-portal")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const entered = window.prompt("🔒 Enter Zeltech Owner Admin Password:");
    if (entered === null) return;
    if (entered.trim() === ADMIN_PASSWORD) {
      isAdminUnlocked = true;
      document.getElementById("zt-tab-admin").hidden = false;
      switchPortalTab("admin");
      document.getElementById("order-portal")?.scrollIntoView({ behavior: "smooth" });
      if (typeof window.toast === "function") window.toast("🔓 Owner Admin Panel unlocked!");
    } else {
      window.alert("❌ Incorrect Admin Password!");
    }
  });

  document.getElementById("zt-lock-admin-btn")?.addEventListener("click", () => {
    isAdminUnlocked = false;
    document.getElementById("zt-tab-admin").hidden = true;
    switchPortalTab("cust");
    if (typeof window.toast === "function") window.toast("🔒 Owner Admin locked");
  });

  document.getElementById("zt-clear-demo-btn")?.addEventListener("click", () => {
    if (!window.confirm("Clear all demo orders?")) return;
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    activeOrderId = null;
    renderCustomerPortal();
    renderAdminDashboard();
    if (typeof window.toast === "function") window.toast("🧹 Demo data cleared");
  });

  document.getElementById("zt-lookup-btn")?.addEventListener("click", () => {
    const val = document.getElementById("zt-lookup-input").value.trim().toUpperCase();
    if (val) {
      switchPortalTab("cust");
      renderCustomerPortal(val);
    }
  });

  /* Handle Incoming Email Cancellation Link (?order=ZEL-XXXX&action=cancel) */
  function handleIncomingEmailCancelLink() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order");
    if (!orderId) return;

    const orders = getOrders();
    let existing = orders.find(o => o.id === orderId);

    if (!existing && params.get("name")) {
      const total = parseFloat(params.get("total") || "890");
      existing = {
        id: orderId,
        invoiceNo: params.get("invoice") || "ZEL-INV-2026",
        approvalCode: "AUTH-VERIFIED",
        customerName: params.get("name"),
        customerEmail: params.get("email") || "",
        customerPhone: params.get("phone") || "",
        address: params.get("address") || "Philippines",
        items: [{ id: "item", name: "Zeltech Order", price: total, qty: 1 }],
        totalBill: total,
        paymentMethod: params.get("method") || "Online Payment",
        status: "APPROVED & PAID",
        createdAt: Date.now()
      };
      orders.unshift(existing);
      saveOrders(orders);
    }

    if (existing) {
      activeOrderId = existing.id;
      window.history.replaceState({}, document.title, window.location.pathname + "#order-portal");
      switchPortalTab("cust");
      renderCustomerPortal(existing.id);
      document.getElementById("order-portal")?.scrollIntoView({ behavior: "smooth" });
      if (params.get("action") === "cancel" && !existing.status.includes("CANCELLED")) {
        setTimeout(() => window.cancelZeltechOrder(existing.id), 400);
      }
    }
  }

  renderCustomerPortal();
  renderAdminDashboard();
  handleIncomingEmailCancelLink();
})();
