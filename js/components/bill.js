const Bill = (() => {
  let people = [];
  let items = [];
  let gstOn = true;
  let svcOn = true;

  // render component

  function render() {
    document.getElementById("panel-bill").innerHTML = `
      <div class="card">
        <div class="card-title">People</div>
        <div class="row">
          <input type="text" id="bill-person-input" placeholder="Add a name..." />
          <button class="btn-secondary" id="bill-add-person-btn">Add</button>
        </div>
        <div id="bill-people-list"></div>
      </div>

      <div class="card">
        <div class="card-title">Items</div>
        <div id="bill-items-list"></div>
        <button class="btn-secondary" id="bill-add-item-btn" style="width: 100%; margin-top: 4px;">
          + Add Item
        </button>
      </div>

      <div class="card">
        <div class="card-title">Charges</div>
        <div class="toggle-row">
          <button class="toggle-btn on" id="tog-svc">+ Service Charge (10%)</button>
          <button class="toggle-btn on" id="tog-gst">+ GST (9%)</button>
        </div>
        <div id="bill-breakdown" class="breakdown-box" style="display: none;"></div>
      </div>

      <div class="card" id="bill-results-card" style="display: none;">
        <div class="card-title">Each Person Pays</div>
        <div id="bill-results"></div>
      </div>
    `;

    bindEvents();
    refreshPeople();
    refreshItems();
  }

  // bind events

  function bindEvents() {
    document
      .getElementById("bill-person-input")
      .addEventListener("keydown", (e) => {
        if (e.key === "Enter") addPerson();
      });

    document
      .getElementById("bill-add-person-btn")
      .addEventListener("click", addPerson);

    document
      .getElementById("bill-add-item-btn")
      .addEventListener("click", addItem);

    document.getElementById("tog-gst").addEventListener("click", () => {
      gstOn = !gstOn;
      document.getElementById("tog-gst").classList.toggle("on", gstOn);
      calculate();
    });

    document.getElementById("tog-svc").addEventListener("click", () => {
      svcOn = !svcOn;
      document.getElementById("tog-svc").classList.toggle("on", svcOn);
      calculate();
    });
  }

  // add, remove, refresh people

  function addPerson() {
    const input = document.getElementById("bill-person-input");
    const name = input.value.trim();
    if (!name || people.includes(name)) return;
    people.push(name);
    input.value = "";
    refreshPeople();
    refreshItems();
    calculate();
  }

  function removePerson(index) {
    const name = people[index];
    people.splice(index, 1);
    items.forEach((item) => {
      item.assignees = item.assignees.filter((a) => a !== name);
    });
    refreshPeople();
    refreshItems();
    calculate();
  }

  function refreshPeople() {
    const el = document.getElementById("bill-people-list");
    el.innerHTML = people
      .map(
        (p, i) =>
          `<span class="person-tag" data-remove="${i}">${p} ×</span>`
      )
      .join("");

    el.querySelectorAll(".person-tag").forEach((tag) => {
      tag.addEventListener("click", () =>
        removePerson(Number(tag.dataset.remove))
      );
    });
  }

  //add items, remove items, toggle assignees

  function addItem() {
    items.push({ name: "", price: 0, assignees: [] });
    refreshItems();
  }

  function removeItem(index) {
    items.splice(index, 1);
    refreshItems();
    calculate();
  }

  function toggleAssignee(itemIndex, person) {
    const item = items[itemIndex];
    const idx = item.assignees.indexOf(person);
    if (idx > -1) {
      item.assignees.splice(idx, 1);
    } else {
      item.assignees.push(person);
    }
    refreshItems();
    calculate();
  }

  function refreshItems() {
    const el = document.getElementById("bill-items-list");
    if (!items.length) {
      el.innerHTML = "";
      return;
    }

    el.innerHTML = items
      .map(
        (item, i) => `
        <div class="item-row" data-index="${i}" style="margin-bottom: 14px; padding-bottom: 14px; border-bottom: 0.5px solid var(--color-border);">
          <div class="row">
            <input type="text" class="item-name" placeholder="Item name" value="${item.name}" data-index="${i}" />
            <input type="number" class="item-price" placeholder="$0.00" value="${item.price || ""}" data-index="${i}" style="width: 90px;" />
            <button class="btn-danger item-remove" data-index="${i}">×</button>
          </div>
          <div style="margin-top: 6px; line-height: 2.2;">
            ${people.length
            ? people
              .map(
                (p) =>
                  `<span class="person-tag ${item.assignees.includes(p) ? "selected" : ""}" data-item="${i}" data-person="${p}">${p}</span>`
              )
              .join("")
            : `<span class="hint">Add people above to assign items</span>`
          }
          </div>
        </div>
      `
      )
      .join("");

    el.querySelectorAll(".item-name").forEach((input) => {
      input.addEventListener("input", () => {
        items[Number(input.dataset.index)].name = input.value;
      });
    });

    el.querySelectorAll(".item-price").forEach((input) => {
      input.addEventListener("input", () => {
        items[Number(input.dataset.index)].price =
          parseFloat(input.value) || 0;
        calculate();
      });
    });

    el.querySelectorAll(".item-remove").forEach((btn) => {
      btn.addEventListener("click", () => removeItem(Number(btn.dataset.index)));
    });

    el.querySelectorAll(".person-tag[data-item]").forEach((tag) => {
      tag.addEventListener("click", () =>
        toggleAssignee(Number(tag.dataset.item), tag.dataset.person)
      );
    });
  }

  // calculation logic

  function calculate() {
    const resCard = document.getElementById("bill-results-card");
    const breakdown = document.getElementById("bill-breakdown");
    const resEl = document.getElementById("bill-results");

    if (!people.length || !items.length) {
      resCard.style.display = "none";
      breakdown.style.display = "none";
      return;
    }

    const totals = {};
    people.forEach((p) => (totals[p] = 0));

    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.price;
      const assigned = item.assignees.length ? item.assignees : people;
      const share = item.price / assigned.length;
      assigned.forEach((p) => {
        if (totals[p] !== undefined) totals[p] += share;
      });
    });

    const svc = svcOn ? subtotal * 0.1 : 0;
    const gst = gstOn ? (subtotal + svc) * 0.09 : 0;
    const total = subtotal + svc + gst;
    const multiplier = subtotal > 0 ? total / subtotal : 1;

    // breakdown
    breakdown.style.display = "block";
    breakdown.innerHTML = `
      <div class="result-row"><span>Subtotal</span><span>${Format.currency(subtotal)}</span></div>
      ${svcOn ? `<div class="result-row"><span>Service Charge (10%)</span><span>${Format.currency(svc)}</span></div>` : ""}
      ${gstOn ? `<div class="result-row"><span>GST (9%)</span><span>${Format.currency(gst)}</span></div>` : ""}
      <div class="result-row total"><span>Total</span><span>${Format.currency(total)}</span></div>
    `;

    // amount per person
    resCard.style.display = "block";
    resEl.innerHTML =
      people
        .map((p) => {
          const amount = totals[p] * multiplier;
          return `
          <div class="person-split">
            <div class="person-split-left">
              <div class="avatar">${Format.initials(p)}</div>
              <span>${p}</span>
            </div>
            <span style="font-weight: 600; font-size: 16px;">${Format.currency(amount)}</span>
          </div>
        `;
        })
        .join("") +
      `<div class="result-row total" style="margin-top: 8px;"><span>Total</span><span>${Format.currency(total)}</span></div>`;
  }


  return { render };
})();
