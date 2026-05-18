const Debts = (() => {
  let debts = [];
  let editingIndex = null;

  const STORAGE_KEY = "jio_debts";

  // load from localStorage
  function load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) debts = JSON.parse(saved);
  }

  // save to localStorage
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(debts));
  }

  // get today as YYYY-MM-DD
  function todayStr() {
    return new Date().toISOString().split("T")[0];
  }

  // render component
  function render() {
    load();

    document.getElementById("panel-debts").innerHTML = `
      <div class="card">
        <div class="card-title" id="debt-form-title">Log A Debt</div>
        <div class="row">
          <input type="text" id="debt-desc" placeholder="What was it? (e.g. Dinner at Orchard)" />
        </div>
        <div class="row">
          <input type="text" id="debt-payer" placeholder="Who paid?" />
          <input type="text" id="debt-ower" placeholder="Who owes?" />
          <input type="number" id="debt-amount" placeholder="$0.00" style="width: 110px;" />
        </div>
        <div class="row" style="margin-top: 10px;">
          <input type="date" 
                id="debt-date" 
                class="custom-picker" 
                value="${todayStr()}" 
                max="${todayStr()}" 
                placeholder="Select Date" 
                required />
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-primary" id="debt-add-btn" style="margin-top: 10px;">Add Debt</button>
          <button class="btn-secondary" id="debt-cancel-btn" style="display: none; margin-top: 10px; padding: 11px 16px;">Cancel</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Outstanding</div>
        <div id="debt-list">
          <div class="empty-state">No debts yet, jio your friends out leh...</div>
        </div>
      </div>
    `;

    bindEvents();
    refreshList();
  }

  // bind events
  function bindEvents() {
    document.getElementById("debt-add-btn").addEventListener("click", submitForm);
    document.getElementById("debt-cancel-btn").addEventListener("click", cancelEdit);
  }

  // handles both add and save edit
  function submitForm() {
    const desc = document.getElementById("debt-desc").value.trim();
    const payer = document.getElementById("debt-payer").value.trim();
    const ower = document.getElementById("debt-ower").value.trim();
    const amount = parseFloat(document.getElementById("debt-amount").value) || 0;
    const date = document.getElementById("debt-date").value;

    if (!desc || !payer || !ower || !amount || !date) return;
    if (payer.toLowerCase() === ower.toLowerCase()) return;

    const parsed = new Date(date).getTime();
    if (isNaN(parsed)) return;

    if (editingIndex !== null) {
      debts[editingIndex].desc = desc;
      debts[editingIndex].payer = payer;
      debts[editingIndex].ower = ower;
      debts[editingIndex].amount = amount;
      debts[editingIndex].createdAt = parsed;
      editingIndex = null;
      setFormState("add");
    } else {
      debts.push({ desc, payer, ower, amount, settled: false, createdAt: parsed, settledAt: null });
    }

    clearForm();
    save();
    refreshList();
  }

  // populate form for editing
  function edit(index) {
    const d = debts[index];
    editingIndex = index;

    document.getElementById("debt-desc").value = d.desc;
    document.getElementById("debt-payer").value = d.payer;
    document.getElementById("debt-ower").value = d.ower;
    document.getElementById("debt-amount").value = d.amount;
    document.getElementById("debt-date").value = new Date(d.createdAt).toISOString().split("T")[0];

    setFormState("edit");
    document.getElementById("debt-desc").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // cancel edit mode
  function cancelEdit() {
    editingIndex = null;
    clearForm();
    setFormState("add");
  }

  // toggle form between add and edit state
  function setFormState(mode) {
    const btn = document.getElementById("debt-add-btn");
    const cancel = document.getElementById("debt-cancel-btn");
    const title = document.getElementById("debt-form-title");

    if (mode === "edit") {
      btn.textContent = "Save Changes";
      cancel.style.display = "block";
      title.textContent = "Edit Debt";
    } else {
      btn.textContent = "Add Entry";
      cancel.style.display = "none";
      title.textContent = "Log A Debt";
    }
  }

  // clear all form fields
  function clearForm() {
    ["debt-desc", "debt-payer", "debt-ower", "debt-amount"].forEach(
      (id) => (document.getElementById(id).value = "")
    );
    document.getElementById("debt-date").value = todayStr();
  }

  // settle or unsettle
  function settle(index) {
    if (debts[index].settled) {
      debts[index].settled = false;
      debts[index].settledAt = null;
    } else {
      debts[index].settled = true;
      debts[index].settledAt = Date.now();
    }
    save();
    refreshList();
  }

  // remove from settled list
  function remove(index) {
    debts.splice(index, 1);
    save();
    refreshList();
  }

  // check debt age tier
  function ageTier(createdAt) {
    const days = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
    if (days > 30) return "old";
    if (days > 7) return "aging";
    return "fresh";
  }

  // refresh debt list
  function refreshList() {
    const el = document.getElementById("debt-list");

    if (!debts.length) {
      el.innerHTML = `<div class="empty-state">No debts yet, jio your friends out leh...</div>`;
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

    el.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => edit(Number(btn.dataset.index)));
    });

    el.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => remove(Number(btn.dataset.index)));
    });
  }

  function debtRowHTML(d, i) {
    const tier = ageTier(d.createdAt);
    const badgeClass = d.settled
      ? "badge-settled"
      : tier === "old"
        ? "badge-old"
        : tier === "aging"
          ? "badge-aging"
          : "badge-owes";

    const outingDate = new Date(d.createdAt).toLocaleDateString("en-SG", {
      day: "numeric", month: "short", year: "numeric"
    });

    const settledDate = d.settledAt
      ? new Date(d.settledAt).toLocaleDateString("en-SG", {
        day: "numeric", month: "short", year: "numeric"
      })
      : null;

    return `
      <div class="debt-row">
        <div>
          <div class="debt-name">${d.ower} owes ${d.payer}</div>
          <div class="debt-desc">${d.desc} &middot; ${outingDate}</div>
          ${settledDate ? `<div class="debt-desc">Paid on ${settledDate}</div>` : ""}
        </div>
        <div class="debt-row-right">
          <span class="debt-badge ${badgeClass}">${Format.currency(d.amount)}</span>
          ${!d.settled ? `<button class="btn-secondary edit-btn" data-index="${i}" style="font-size: 12px; padding: 5px 10px;">Edit</button>` : ""}
          <button class="btn-secondary settle-btn" data-index="${i}" style="font-size: 12px; padding: 5px 10px;">
            ${d.settled ? "Undo" : "Paid"}
          </button>
          ${d.settled ? `<button class="btn-secondary remove-btn" data-index="${i}" style="font-size: 12px; padding: 5px 10px;">Remove</button>` : ""}
        </div>
      </div>
    `;
  }

  return { render };
})();