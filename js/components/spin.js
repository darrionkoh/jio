const Spin = (() => {
    let options = [];
    let spinning = false;

    const COLORS = [
        "#B5D4F4", "#FFD6A5", "#CAFFBF", "#FFADAD",
        "#FFC6FF", "#A0C4FF", "#BDB2FF", "#FDFFB6",
    ];

    function render() {
        document.getElementById("panel-spin").innerHTML = `
      <div class="card">
        <div class="card-title">Options</div>
        <div class="row">
          <input type="text" id="spin-input" placeholder="Add a place or activity..." />
          <button class="btn-secondary" id="spin-add-btn">Add</button>
        </div>
        <div id="spin-options-list"></div>
      </div>
      <div class="card" style="text-align: center;">
        <canvas id="spin-canvas" width="300" height="300" style="display: block; margin: 0 auto;"></canvas>
        <button class="btn-primary" id="spin-btn" style="margin-top: 1rem;" disabled>
          Add at least 2 options
        </button>
      </div>
      <div id="spin-result-card" class="card" style="display: none; text-align: center;">
        <div class="card-title">The Wheel Has Spoken</div>
        <div id="spin-result" style="font-size: 24px; font-weight: 600; padding: 0.5rem 0;"></div>
      </div>
    `;

        bindEvents();
        drawWheel();
    }


    function bindEvents() {
        document.getElementById("spin-input").addEventListener("keydown", (e) => {
            if (e.key === "Enter") addOption();
        });
        document.getElementById("spin-add-btn").addEventListener("click", addOption);
        document.getElementById("spin-btn").addEventListener("click", spinWheel);
    }

    // food options

    function addOption() {
        const input = document.getElementById("spin-input");
        const val = input.value.trim();
        if (!val || options.includes(val)) return;
        options.push(val);
        input.value = "";
        refreshOptions();
        drawWheel();
        updateSpinBtn();
    }

    function removeOption(index) {
        options.splice(index, 1);
        refreshOptions();
        drawWheel();
        updateSpinBtn();
    }

    function refreshOptions() {
        const el = document.getElementById("spin-options-list");
        el.innerHTML = options
            .map((o, i) => `<span class="person-tag" data-remove="${i}">${o} ×</span>`)
            .join("");
        el.querySelectorAll(".person-tag").forEach((tag) => {
            tag.addEventListener("click", () => removeOption(Number(tag.dataset.remove)));
        });
    }

    function updateSpinBtn() {
        const btn = document.getElementById("spin-btn");
        if (options.length < 2) {
            btn.disabled = true;
            btn.textContent = "Add at least 2 options";
        } else {
            btn.disabled = false;
            btn.textContent = "Spin!";
        }
    }

    //draw wheel
    function drawWheel(highlightIndex = -1) {
        const canvas = document.getElementById("spin-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = cx - 10;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!options.length) {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
            ctx.fillStyle = "#f5f5f4";
            ctx.fill();
            ctx.strokeStyle = "#e5e7eb";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#9ca3af";
            ctx.font = "14px -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Add options above", cx, cy);
            return;
        }

        const slice = (2 * Math.PI) / options.length;

        options.forEach((opt, i) => {
            const start = i * slice - Math.PI / 2;
            const end = start + slice;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, start, end);
            ctx.closePath();
            ctx.fillStyle = highlightIndex === i ? "#378ADD" : COLORS[i % COLORS.length];
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(start + slice / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = highlightIndex === i ? "#ffffff" : "#1a1a1a";
            ctx.font = `${options.length > 6 ? "11" : "13"}px -apple-system, sans-serif`;
            ctx.fillText(opt.length > 14 ? opt.slice(0, 13) + "…" : opt, radius - 12, 0);
            ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, 4);
        ctx.lineTo(cx - 10, 22);
        ctx.lineTo(cx + 10, 22);
        ctx.closePath();
        ctx.fillStyle = "#1a1a1a";
        ctx.fill();
    }

    function redrawRotated(deg) {
        const canvas = document.getElementById("spin-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = cx - 10;
        const slice = (2 * Math.PI) / options.length;
        const offsetRad = (deg * Math.PI) / 180;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        options.forEach((opt, i) => {
            const start = i * slice - Math.PI / 2 + offsetRad;
            const end = start + slice;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, start, end);
            ctx.closePath();
            ctx.fillStyle = COLORS[i % COLORS.length];
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(start + slice / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#1a1a1a";
            ctx.font = `${options.length > 6 ? "11" : "13"}px -apple-system, sans-serif`;
            ctx.fillText(opt.length > 14 ? opt.slice(0, 13) + "…" : opt, radius - 12, 0);
            ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, 4);
        ctx.lineTo(cx - 10, 22);
        ctx.lineTo(cx + 10, 22);
        ctx.closePath();
        ctx.fillStyle = "#1a1a1a";
        ctx.fill();
    }

    function spinWheel() {
        if (spinning || options.length < 2) return;
        spinning = true;

        document.getElementById("spin-result-card").style.display = "none";
        document.getElementById("spin-btn").disabled = true;
        document.getElementById("spin-btn").textContent = "Spinning...";

        const totalRotation = (6 + Math.random() * 4) * 360;
        const duration = 3500;
        const start = performance.now();

        function animate(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentDeg = eased * totalRotation;

            redrawRotated(currentDeg);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                const sliceDeg = 360 / options.length;
                const normalised = (((-totalRotation) % 360) + 360) % 360;
                const winnerIndex = Math.floor(normalised / sliceDeg) % options.length;

                drawWheel(winnerIndex);
                spinning = false;

                document.getElementById("spin-result-card").style.display = "block";
                document.getElementById("spin-result").textContent = options[winnerIndex];
                document.getElementById("spin-btn").disabled = false;
                document.getElementById("spin-btn").textContent = "Spin Again!";
            }
        }

        requestAnimationFrame(animate);
    }

    return { render };
})();