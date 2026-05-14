const App = (() => {
  const FEATURES = ["bill", "gst", "debts", "spin", "events"];

  const DOM = {
    launcher: null,
    backBtn: null,
    subtitle: null,
    panels: {}
  };

  const init = () => {
    DOM.launcher = document.getElementById("launcher");
    DOM.backBtn = document.getElementById("back-btn");
    DOM.subtitle = document.getElementById("app-subtitle");

    FEATURES.forEach(id => {
      DOM.panels[id] = document.getElementById(`panel-${id}`);
    });

    try {
      if (typeof Bill !== 'undefined') Bill.render();
      if (typeof GST !== 'undefined') GST.render();
      if (typeof Debts !== 'undefined') Debts.render();
      if (typeof Spin !== 'undefined') Spin.render();
      if (typeof Events !== 'undefined') Events.render();
    } catch (error) {
      console.error("Module Error:", error.message);
    }

    bindEvents();

    const lastTab = sessionStorage.getItem("last_tab");
    if (lastTab && FEATURES.includes(lastTab)) {
      showFeature(lastTab);
    } else {
      goHome();
    }
  };

  const bindEvents = () => {
    document.querySelectorAll(".feature-card").forEach(card => {
      card.addEventListener("click", () => {
        const target = card.getAttribute("data-tab");
        if (target) showFeature(target);
      });
    });

    if (DOM.backBtn) {
      DOM.backBtn.addEventListener("click", goHome);
    }
  };

  const showFeature = (targetId) => {
    sessionStorage.setItem("last_tab", targetId);

    if (DOM.launcher) DOM.launcher.style.display = "none";
    if (DOM.subtitle) DOM.subtitle.style.display = "none";
    if (DOM.backBtn) DOM.backBtn.style.display = "block";

    FEATURES.forEach(id => {
      const panel = DOM.panels[id];
      if (panel) {
        panel.style.display = (id === targetId) ? "block" : "none";
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    sessionStorage.removeItem("last_tab");

    if (DOM.launcher) DOM.launcher.style.display = "grid";
    if (DOM.subtitle) DOM.subtitle.style.display = "block";
    if (DOM.backBtn) DOM.backBtn.style.display = "none";

    FEATURES.forEach(id => {
      const panel = DOM.panels[id];
      if (panel) panel.style.display = "none";
    });
  };

  return { init };
})();

document.addEventListener("DOMContentLoaded", App.init);