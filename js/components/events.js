const Events = (() => {
    // generate random 4-digit JIO-XXXX code
    const generateCode = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let result = "";
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `JIO-${result}`;
    };

    const render = () => {
        const container = document.getElementById("panel-events");
        if (!container) return;

        container.innerHTML = `
      <div class="card">
        <div class="card-title">Join an Event</div>
        <div style="display: flex; gap: 10px;">
          <input type="text" id="join-code-input" placeholder="JIO-XXXX" style="text-transform: uppercase; flex: 2;" />
          <button class="btn-primary" id="join-event-btn" style="flex: 1;">Join</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Create New Event</div>
        <div class="form-group" style="display: flex; flex-direction: column; gap: 12px;">
          <input type="text" id="ev-title" placeholder="Event Name (e.g. Dinner @ JB)" />
          
          <div style="display: flex; gap: 10px;">
            <input type="date" id="ev-date" />
            <input type="time" id="ev-time" />
          </div>

          <input type="text" id="ev-loc" placeholder="Location (e.g. Mid Valley)" />
          
          <textarea id="ev-desc" placeholder="Notes (e.g. Meet at Exit B)"></textarea>
          
          <button class="btn-secondary" id="create-event-btn" style="padding: 14px;">Create & Get Code</button>
        </div>
      </div>

      <!-- Detail Card (Result) -->
      <div id="event-result-card" class="card" style="display: none; text-align: center; border: 2px solid var(--color-blue);">
        <div class="badge-owes" id="res-code-display" style="display: inline-block; padding: 4px 12px; border-radius: 20px; background: var(--color-blue-light); color: var(--color-blue); font-weight: bold; margin-bottom: 12px;"></div>
        <h2 id="res-title" style="margin: 0 0 5px 0;"></h2>
        <p id="res-details" style="font-size: 14px; opacity: 0.8; margin-bottom: 10px;"></p>
        <p id="res-desc" style="font-style: italic; font-size: 13px; margin-bottom: 20px;"></p>
        <button class="btn-primary" id="add-to-cal-btn" style="width: 100%;">Add to Calendar</button>
      </div>
    `;

        bindEvents();
    };

    const bindEvents = () => {
        document.getElementById("create-event-btn").addEventListener("click", handleCreate);
        document.getElementById("join-event-btn").addEventListener("click", handleJoin);
    };

    const handleCreate = async () => {
        const eventData = {
            title: document.getElementById("ev-title").value.trim(),
            date: document.getElementById("ev-date").value,
            time: document.getElementById("ev-time").value,
            location: document.getElementById("ev-loc").value.trim(),
            description: document.getElementById("ev-desc").value.trim(),
            code: generateCode()
        };

        if (!eventData.title || !eventData.date || !eventData.time) {
            return alert("Wait! Give us at least a title, date, and time.");
        }

        // save data
        const { error } = await supabase
            .from('events')
            .insert([eventData]);

        if (error) {
            console.error("Supabase Error:", error);
            alert("Failed to save event. Check your internet or Supabase setup!");
        } else {
            showEventData(eventData);
            document.getElementById("ev-title").value = "";
            document.getElementById("ev-desc").value = "";
        }
    };

    const handleJoin = async () => {
        const code = document.getElementById("join-code-input").value.trim().toUpperCase();
        if (!code) return;

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('code', code)
            .single();

        if (data) {
            showEventData(data);
        } else {
            alert("No event found with that code. Try again!");
        }
    };

    const showEventData = (ev) => {
        const card = document.getElementById("event-result-card");
        document.getElementById("res-code-display").textContent = ev.code;
        document.getElementById("res-title").textContent = ev.title;
        document.getElementById("res-details").textContent = `${ev.date} at ${ev.time} | ${ev.location}`;
        document.getElementById("res-desc").textContent = ev.description || "No extra notes.";

        card.style.display = "block";
        card.scrollIntoView({ behavior: 'smooth' });

        document.getElementById("add-to-cal-btn").onclick = () => downloadICS(ev);
    };

    const downloadICS = (ev) => {
        // Format: YYYYMMDDTHHMMSS
        const dateStr = ev.date.replace(/-/g, '');
        const timeStr = ev.time.replace(/:/g, '');

        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "BEGIN:VEVENT",
            `SUMMARY:${ev.title}`,
            `DTSTART:${dateStr}T${timeStr}00`,
            `LOCATION:${ev.location}`,
            `DESCRIPTION:${ev.description || ''} (Invite Code: ${ev.code})`,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\n");

        const blob = new Blob([icsContent], { type: "text/calendar" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${ev.title}.ics`;
        link.click();
    };

    return { render };
})();