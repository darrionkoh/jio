const Events = (() => {
    function todayStr() {
        return new Date().toISOString().split("T")[0];
    }

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
          <input type="text" id="ev-host" placeholder="Your Name (Organizer)" />
          <input type="text" id="ev-title" placeholder="Event Name (e.g. Dinner @ Orchard)" />
          
          <div style="display: flex; gap: 10px;">
            <input type="date" id="ev-date" class="custom-picker" min="${todayStr()}" required />
            <input type="time" id="ev-time" class="custom-picker" required />
          </div> 

          <input type="text" id="ev-loc" placeholder="Location (e.g. Ion Orchard)" />
          <textarea id="ev-desc" placeholder="Notes (e.g. Meet at Exit B)" style="height: 80px;"></textarea>
          
          <button class="btn-secondary" id="create-event-btn" style="padding: 14px;">Create & Get Code</button>
        </div>
      </div>

      <div id="event-result-card" class="card" style="display: none; text-align: center; border: 2px solid var(--color-blue);">
        <div id="res-code-display" style="display: inline-block; padding: 4px 12px; border-radius: 20px; background: var(--color-blue-light); color: var(--color-blue); font-weight: bold; margin-bottom: 12px;"></div>
        
        <h2 id="res-title" style="margin: 0 0 5px 0;"></h2>
        <p id="res-host" style="font-size: 12px; font-weight: 600; color: var(--color-blue); margin-bottom: 8px;"></p>
        <p id="res-details" style="font-size: 14px; opacity: 0.8; margin-bottom: 10px;"></p>
        <p id="res-desc" style="font-style: italic; font-size: 13px; margin-bottom: 20px;"></p>
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn-primary" id="add-to-cal-btn" style="width: 100%;">Add to Calendar</button>
            <div style="display: flex; gap: 8px;">
                <button class="btn-secondary" id="native-share-btn" style="flex: 1;">Share</button>
                <button class="btn-secondary" id="copy-code-btn" style="flex: 1;">Copy Code</button>
            </div>
            <button id="delete-event-btn" style="width: 100%; margin-top: 12px; background: none; border: none; color: #ff3b30; font-size: 13px; cursor: pointer; text-decoration: underline;">Delete Event</button>
        </div>
      </div>
    `;

        bindEvents();
        checkLocalStorage();
    };

    const bindEvents = () => {
        document.getElementById("create-event-btn").onclick = handleCreate;
        document.getElementById("join-event-btn").onclick = handleJoin;
    };

    const handleCreate = async () => {
        const eventData = {
            host_name: document.getElementById("ev-host").value.trim() || "Someone",
            title: document.getElementById("ev-title").value.trim(),
            date: document.getElementById("ev-date").value,
            time: document.getElementById("ev-time").value,
            location: document.getElementById("ev-loc").value.trim(),
            description: document.getElementById("ev-desc").value.trim(),
            code: generateCode()
        };

        if (!eventData.title || !eventData.date || !eventData.time || !eventData.location) {
            return alert("Error: Please fill in Title, Date, Time, and Location!");
        }

        const { error } = await supabase.from('events').insert([eventData]);
        if (error) {
            alert("Database error!");
        } else {
            saveAndShow(eventData);
        }
    };

    const handleJoin = async () => {
        const codeInput = document.getElementById("join-code-input");
        const code = codeInput.value.trim().toUpperCase();
        const { data } = await supabase.from('events').select('*').eq('code', code).single();
        if (data) saveAndShow(data); else alert("Code not found!");
    };

    const saveAndShow = (ev) => {
        localStorage.setItem("jio_saved_event", JSON.stringify(ev));
        showEventData(ev);
    };

    const checkLocalStorage = () => {
        const saved = localStorage.getItem("jio_saved_event");
        if (saved) showEventData(JSON.parse(saved));
    };

    const showEventData = (ev) => {
        const card = document.getElementById("event-result-card");
        card.style.display = "block";

        document.getElementById("res-code-display").textContent = ev.code;
        document.getElementById("res-title").textContent = ev.title;
        document.getElementById("res-host").textContent = `Organized by: ${ev.host_name || 'Organizer'}`;
        document.getElementById("res-details").textContent = `${ev.date} @ ${ev.time} | ${ev.location}`;
        document.getElementById("res-desc").textContent = ev.description;

        const shareText = `Jio! ${ev.title}\nDate: ${ev.date} @ ${ev.time}\nLocation: ${ev.location}\nCode: ${ev.code}`;

        document.getElementById("copy-code-btn").onclick = () => {
            navigator.clipboard.writeText(ev.code);
            alert("Code copied!");
        };

        document.getElementById("native-share-btn").onclick = async () => {
            if (navigator.share) {
                try {
                    await navigator.share({ title: ev.title, text: shareText, url: window.location.href });
                } catch (err) { console.log("Share cancelled"); }
            } else {
                navigator.clipboard.writeText(shareText);
                alert("Event details copied!");
            }
        };

        document.getElementById("add-to-cal-btn").onclick = () => downloadICS(ev);

        document.getElementById("delete-event-btn").onclick = async () => {
            const userInput = prompt("Is this event over? Type 'DELETE' to confirm and remove it for everyone.");
            if (userInput === "DELETE") {
                const { error } = await supabase.from('events').delete().eq('code', ev.code);
                if (!error) {
                    localStorage.removeItem("jio_saved_event");
                    alert("Event successfully deleted.");
                    render();
                } else {
                    alert("Error deleting event.");
                }
            } else if (userInput !== null) {
                alert("Incorrect confirmation text. Event not deleted.");
            }
        };
    };

    const downloadICS = (ev) => {
        const dateStr = ev.date.replace(/-/g, '');
        const timeStr = ev.time.replace(/:/g, '');
        const icsBody = [
            "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
            `SUMMARY:${ev.title}`,
            `DTSTART:${dateStr}T${timeStr}00`,
            `LOCATION:${ev.location}`,
            `DESCRIPTION:Host: ${ev.host_name}\\nNotes: ${ev.description}`,
            "END:VEVENT", "END:VCALENDAR"
        ].join("\n");

        const uri = "data:text/calendar;charset=utf8," + encodeURIComponent(icsBody);
        const link = document.createElement("a");
        link.href = uri;
        link.download = "event.ics";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return { render };
})();