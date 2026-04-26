const Debts = (() => {
  let debts = [];

  //render component

  function render() {
    document.getElementById("panel-debts").innerHTML = `
      <div class="card">
        <div class="card-title">Log An Outing</div>
        <div class="row">
          <input type="text" id="debt-desc" placeholder="What was it? (e.g. Dinner at Maxwell)" />
        </div>
        <div class="row">
          <input type="text" id="debt-payer" placeholder="Who paid?" />
          <input type="number" id="debt-amount" placeholder="$0.00" style="width: 110px;" />
        </div>
        <input
          type="text"
          id="debt-owers"
          class="input-full"
          placeholder="Who splits it? (names, comma separated)"
        />
        <button class="btn-primary" id="debt-add-btn">Add Outing</button>
      </div>

      <div class="card">
        <div class="card-title">Outstanding</div>
        <div id="debt-list">
          <div class="empty-state">No debts yet, jio your friends out leh...</div>
        </div>
      </div>
    `;

    bindEvents();
  }


  function bindEvents() {
    document.getElementById("debt-add-btn").addEventListener("click", addDebt);
  }

  // add debt entry

  function addDebt() {
    const desc = document.getElementById("debt-desc").value.trim();
    const payer = document.getElementById("debt-payer").value.trim();
    const amount = parseFloat(document.getElementById("debt-amount").value) || 0;
    const owersRaw = document.getElementById("debt-owers").value.trim();

    if (!payer || !amount || !owersRaw) return;

    const owers = owersRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => s.toLowerCase() !== payer.toLowerCase());

    if (!owers.length) return;

    const share = parseFloat((amount / (owers.length + 1)).toFixed(2));
    owers.forEach((ower) => debts.push({ desc, payer, ower, amount: share, settled: false }));

    ["debt-desc", "debt-payer", "debt-amount", "debt-owers"].forEach(
      (id) => (document.getElementById(id).value = "")
    );

    refreshList();
  }

  // remove debt
  function settle(index) {
    debts[index].settled = !debts[index].settled;
    refreshList();
  }

  // render debt list

  function refreshList() {
    const el = document.getElementById("debt-list");

    if (!debts.length) {
      el.innerHTML = `<div class="empty-state">No debts yet — jio your friends out!</div>`;
      return;
    }

    const active = debts.filter((d) => !d.settled);
    const settled = debts.filter((d) => d.settled);

    let html = active.map((d) => debtRowHTML(d, debts.indexOf(d))).join("");

    if (settled.length) {
      html += `<div class="section-divider">Settled</div>`;
      html += settled.map((d) => debtRowHTML(d, debts.indexOf(d))).join("");
    }

    el.innerHTML = html;

    el.querySelectorAll(".settle-btn").forEach((btn) => {
      btn.addEventListener("click", () => settle(Number(btn.dataset.index)));
    });
  }

  function debtRowHTML(d, i) {
    return `
      <div class="debt-row">
        <div>
          <div class="debt-name">${d.ower} owes ${d.payer}</div>
          <div class="debt-desc">${d.desc}</div>
        </div>
        <div class="debt-row-right">
          <span class="debt-badge ${d.settled ? "badge-settled" : "badge-owes"}">${Format.currency(d.amount)}</span>
          <button class="btn-secondary settle-btn" data-index="${i}" style="font-size: 12px; padding: 5px 10px;">
            ${d.settled ? "Undo" : "Paid"}
          </button>
        </div>
      </div>
    `;
  }

  return { render };
})();
