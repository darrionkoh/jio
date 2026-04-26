const App = (() => {
  const TABS = ["bill", "gst", "debts", "spin"];

  const COMPONENTS = {
    bill: Bill,
    gst: GST,
    debts: Debts,
    spin: Spin,
  };

  // Switch tabs

  function switchTab(target) {
    // Update tab buttons
    document.querySelectorAll(".tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === target);
    });

    // Update panels
    TABS.forEach((id) => {
      document
        .getElementById(`panel-${id}`)
        .classList.toggle("active", id === target);
    });
  }

  // init app

  function init() {
    // Render all components into their panels
    Object.values(COMPONENTS).forEach((component) => component.render());

    // Bind tab buttons
    document.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    // Start on bill splitter
    switchTab("bill");
  }

  return { init };
})();

// Boot
document.addEventListener("DOMContentLoaded", App.init);
