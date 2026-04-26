const GST = (() => {
  let gstOn = true;
  let svcOn = true;

  // ─── Render ───────────────────────────────────────────────────

  function render() {
    document.getElementById("panel-gst").innerHTML = `
      <div class="card">
        <label class="card-title" for="gst-input">Enter Bill Amount (SGD)</label>
        <input
          type="number"
          id="gst-input"
          class="input-large"
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>

      <div class="metrics-grid">
        <div class="metric">
          <div class="metric-val" id="gst-m-sub">$0.00</div>
          <div class="metric-label">Subtotal</div>
        </div>
        <div class="metric">
          <div class="metric-val" id="gst-m-tax">$0.00</div>
          <div class="metric-label">Tax &amp; Fees</div>
        </div>
        <div class="metric">
          <div class="metric-val" id="gst-m-total">$0.00</div>
          <div class="metric-label">You Pay</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Breakdown</div>
        <div class="toggle-row">
          <button class="toggle-btn on" id="gst-tog-svc">+ Service Charge (10%)</button>
          <button class="toggle-btn on" id="gst-tog-gst">+ GST (9%)</button>
        </div>
        <div id="gst-breakdown"></div>
      </div>
    `;

    bindEvents();
    calculate();
  }

  // bind event

  function bindEvents() {
    document.getElementById("gst-input").addEventListener("input", calculate);

    document.getElementById("gst-tog-gst").addEventListener("click", () => {
      gstOn = !gstOn;
      document.getElementById("gst-tog-gst").classList.toggle("on", gstOn);
      calculate();
    });

    document.getElementById("gst-tog-svc").addEventListener("click", () => {
      svcOn = !svcOn;
      document.getElementById("gst-tog-svc").classList.toggle("on", svcOn);
      calculate();
    });
  }

  // calculation logic

  function calculate() {
    const sub = parseFloat(document.getElementById("gst-input").value) || 0;
    const svc = svcOn ? sub * 0.1 : 0;
    const gst = gstOn ? (sub + svc) * 0.09 : 0;
    const total = sub + svc + gst;

    document.getElementById("gst-m-sub").textContent = Format.currency(sub);
    document.getElementById("gst-m-tax").textContent = Format.currency(svc + gst);
    document.getElementById("gst-m-total").textContent = Format.currency(total);

    document.getElementById("gst-breakdown").innerHTML = `
      <div class="result-row"><span>Subtotal</span><span>${Format.currency(sub)}</span></div>
      ${svcOn ? `<div class="result-row"><span>Service Charge (10%)</span><span>${Format.currency(svc)}</span></div>` : ""}
      ${gstOn ? `<div class="result-row"><span>GST (9% on subtotal + service)</span><span>${Format.currency(gst)}</span></div>` : ""}
      <div class="result-row total"><span>Total</span><span>${Format.currency(total)}</span></div>
    `;
  }

  return { render };
})();
