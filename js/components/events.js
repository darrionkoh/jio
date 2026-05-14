const Events = (() => {
    // todays date
    function todayStr() {
        return new Date().toISOString().split("T")[0];
    }
    
    // generates code
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

      <div id="events-list-container"></div>
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
            return alert("HELLO! FILL IN ALL THE FIELDS LAH! (Except description, that one can skip)");
        }

        const { error } = await supabase.from('events').insert([eventData]);
        if (error) {
            alert("Database error!");
        } else {
            saveAndRefresh(eventData);
        }
    };

    const handleJoin = async () => {
        const codeInput = document.getElementById("join-code-input");
        const code = codeInput.value.trim().toUpperCase();
        if (!code) return;

        const { data } = await supabase.from('events').select('*').eq('code', code).single();
        if (data) {
            saveAndRefresh(data);
            codeInput.value = ""; 
        } else {
            alert("Err, cannot find event with that code leh. Confirm again?");
        }
    };

    const saveAndRefresh = (newEvent) => {
        let events = JSON.parse(localStorage.getItem("jio_saved_events") || "[]");
        
        // prevent dupes
        const exists = events.find(e => e.code === newEvent.code);
        if (!exists) {
            events.push(newEvent);
            localStorage.setItem("jio_saved_events", JSON.stringify(events));
        }
        
        renderEventsList(events);
    };

    const checkLocalStorage = () => {
        const events = JSON.parse(localStorage.getItem("jio_saved_events") || "[]");
        if (events.length > 0) renderEventsList(events);
    };

    const renderEventsList = (events) => {
        const listContainer = document.getElementById("events-list-container");
        if (!listContainer) return;

        // sort by most upcoming date
        events.sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.time}`);
            const dateTimeB = new Date(`${b.date}T${b.time}`);
            return dateTimeA - dateTimeB;
        });

        listContainer.innerHTML = events.map(ev => `
            <div class="card event-item" style="text-align: center; border: 2px solid var(--color-blue); margin-bottom: 16px;">
                <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; background: var(--color-blue-light); color: var(--color-blue); font-weight: bold; margin-bottom: 12px;">${ev.code}</div>
                <h2 style="margin: 0 0 5px 0;">${ev.title}</h2>
                <p style="font-size: 12px; font-weight: 600; color: var(--color-blue); margin-bottom: 8px;">Organized by: ${ev.host_name || 'Organizer'}</p>
                <p style="font-size: 14px; opacity: 0.8; margin-bottom: 10px;">${ev.date} @ ${ev.time} | ${ev.location}</p>
                <p style="font-style: italic; font-size: 13px; margin-bottom: 20px;">${ev.description}</p>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn-primary" onclick="Events.downloadICSByData('${encodeURIComponent(JSON.stringify(ev))}')" style="width: 100%;">Add to Calendar</button>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-secondary" onclick="Events.shareEvent('${ev.title}', '${ev.date}', '${ev.time}', '${ev.location}', '${ev.code}')" style="flex: 1;">Share</button>
                        <button class="btn-secondary" onclick="Events.copyCode('${ev.code}')" style="flex: 1;">Copy Code</button>
                    </div>
                    <button onclick="Events.deleteEvent('${ev.code}')" style="width: 100%; margin-top: 12px; background: none; border: none; color: #ff3b30; font-size: 13px; cursor: pointer; text-decoration: underline;">Delete Event</button>
                </div>
            </div>
        `).join('');
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert("Event code copied already! Faster share with your friends: " + code);
    };

    const shareEvent = async (title, date, time, location, code) => {
        const shareMessage = `Eh! Someone invited you to an event: ${title}!\n\n` +
                             `📅 Date: ${date} @ ${time}\n` +
                             `📍 Location: ${location}\n\n` +
                             `To join, add code "${code}" via the Events tab! :\n` +
                             `https://darrion-jio.vercel.app/`;

        if (navigator.share) {
            try {
                await navigator.share({ 
                    title: `Jio: ${title}`, 
                    text: shareMessage 
                });
            } catch (err) {
                console.log("Share cancelled or failed");
            }
        } else {
            navigator.clipboard.writeText(shareMessage);
            alert("Copied event details liao la! Share it with your friends: \n\n" + shareMessage);
        }
    };

    const deleteEvent = async (code) => {
        const userInput = prompt("Double confirm event over already? Type 'DELETE' to remove for everyone.");
        if (userInput === "DELETE") {
            const { error } = await supabase.from('events').delete().eq('code', code);
            if (!error) {
                let events = JSON.parse(localStorage.getItem("jio_saved_events") || "[]");
                events = events.filter(e => e.code !== code);
                localStorage.setItem("jio_saved_events", JSON.stringify(events));
                alert("Event deleted liao!");
                render(); 
            } else {
                alert("Got problem leh, cannot delete!");
            }
        } else if (userInput !== null) {
            alert("Dunno how spell DELETE ah? Event not deleted.");
        }
    };

    const downloadICSByData = (encodedData) => {
        const ev = JSON.parse(decodeURIComponent(encodedData));
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
        link.download = `${ev.title}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return { render, copyCode, shareEvent, deleteEvent, downloadICSByData };
})();