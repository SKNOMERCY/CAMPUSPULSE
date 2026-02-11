const API_URL = "http://127.0.0.1:5000/events";
let allEvents = [];

// ---------------- FETCH EVENTS ----------------
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    allEvents = data;             // all 15 events
    renderEvents(allEvents);      // render all events in cards
    initCalendar(allEvents);      // initialize calendar
  })
  .catch(err => console.error("Backend fetch failed:", err));

// ---------------- APPLY FILTERS ----------------
document.getElementById("applyFilters").addEventListener("click", () => {
  const type = document.getElementById("typeFilter").value;
  const checkedDomains = Array.from(document.querySelectorAll(".domainFilter:checked")).map(cb => cb.value);

  let filtered = [...allEvents];
  if(type) filtered = filtered.filter(e => e.type === type);
  if(checkedDomains.length) filtered = filtered.filter(e => checkedDomains.some(d => e.domain.includes(d)));
  renderEvents(filtered);
});

// ---------------- SHOW RECOMMENDED ----------------
document.getElementById("applyRecommendation").addEventListener("click", () => {
  const selectedInterests = Array.from(document.querySelectorAll(".interest:checked")).map(cb => cb.value);

  if(selectedInterests.length === 0){
    alert("Select at least one interest!");
    return;
  }

  const recommendedEvents = allEvents
    .map(event => {
      let score = 0;
      selectedInterests.forEach(interest => {
        if(event.domain.includes(interest)) score += 50;
      });
      return {...event, relevance_score: score};
    })
    .filter(e => e.relevance_score > 0)
    .sort((a,b) => b.relevance_score - a.relevance_score)
    .slice(0,3);

  renderRecommended(recommendedEvents);
});

// ---------------- RENDER CARDS ----------------
function renderEvents(events){
  const container = document.getElementById("events");
  container.innerHTML = "";
  if(events.length === 0){ container.innerHTML="<p>No events available.</p>"; return; }
  events.forEach(event => container.appendChild(createCard(event)));
}

function renderRecommended(events){
  const container = document.getElementById("recommended");
  container.innerHTML = "";
  if(events.length === 0){ container.innerHTML="<p>No recommendations yet.</p>"; return; }
  events.forEach((event, idx) => container.appendChild(createCard(event,true,idx===0)));
}

// ---------------- CREATE CARD ----------------
function createCard(event, showScore=false, topHighlight=false){
  const card = document.createElement("div");
  card.classList.add("card");
  if(topHighlight){ 
    card.style.background = "#e0f7f5";  // teal highlight
    card.style.border = "3px solid #0f766e"; 
  }
  const badges = event.domain.map(d => `<span class="badge">${d}</span>`).join(" ");
  card.innerHTML = `
    <h3>${event.title}</h3>
    <div class="meta"><b>Type:</b> ${event.type} | <b>Date:</b> ${event.date}</div>
    <div class="badges">${badges}</div>
    <p>${event.description}</p>
    ${showScore ? `<div class="score">Score: ${event.relevance_score}</div>` : ""}
  `;

  // show registered badge if user registered for this event
  if(isRegistered(event.id)){
    const badge = document.createElement("div");
    badge.classList.add("registered-badge");
    badge.innerText = "Registered";
    card.appendChild(badge);
  }

  return card;
}

// ---------------- LOCALSTORAGE UTILS ----------------
function getRegistered(){
  return JSON.parse(localStorage.getItem("registeredEvents") || "[]");
}

function isRegistered(eventId){
  return getRegistered().some(e => e.id === eventId);
}

function registerEvent(event){
  let reg = getRegistered();
  if(!reg.find(e => e.id === event.id)){
    reg.push({id: event.id, title: event.title, date: event.startStr});
    localStorage.setItem("registeredEvents", JSON.stringify(reg));
  }
}

function unregisterEvent(event){
  let reg = getRegistered().filter(e => e.id !== event.id);
  localStorage.setItem("registeredEvents", JSON.stringify(reg));
}

// ---------------- CALENDAR ----------------
function initCalendar(events){
  const calendarEl = document.getElementById("calendar");

  const fcEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    start: e.date,
    allDay: true,
    classNames: [e.type], // class for color
    extendedProps: {description: e.description, type: e.type}
  }));

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 650,
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listWeek' },
    events: fcEvents,
    selectable: true,
    selectMirror: true,

    // MARK RANDOM DATES
    select: function(info){
      const selDate = info.startStr;
      const existing = calendar.getEvents().find(e => e.title==="Marked" && e.startStr===selDate);
      if(!existing){
        calendar.addEvent({
          title: "Marked",
          start: selDate,
          allDay: true,
          classNames: ["Marked"]
        });
      }
      calendar.unselect();
    },

    // EVENT CLICK
    eventClick: function(info){
      if(info.event.title === "Marked"){
        if(confirm(`Remove mark from ${info.event.startStr}?`)) info.event.remove();
      } else {
        // register/unregister
        const registered = isRegistered(info.event.id);
        if(registered){
          unregisterEvent(info.event);
          alert(`Unregistered from ${info.event.title}`);
        } else {
          registerEvent(info.event);
          alert(`Registered for ${info.event.title}`);
        }
        renderEvents(allEvents); // update card badges
      }
    }
  });

  calendar.render();
}