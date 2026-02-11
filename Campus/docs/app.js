// ---------------- EVENTS ----------------
const baseEvents = [
  {id:1,title:"AI in Healthcare Workshop",type:"Workshop",date:"2026-02-10",domain:["AI","Healthcare"],description:"Hands-on session on AI applications in healthcare",relevance_score:90},
  {id:2,title:"Web Development Bootcamp",type:"Workshop",date:"2026-02-12",domain:["Web Development"],description:"Learn modern frontend and backend web development",relevance_score:85},
  {id:3,title:"Robotics Hackathon",type:"Hackathon",date:"2026-02-15",domain:["Robotics","IoT"],description:"24-hour hackathon on robotics and automation",relevance_score:92},
  {id:4,title:"Cybersecurity Awareness Seminar",type:"Seminar",date:"2026-02-18",domain:["Cybersecurity"],description:"Learn how to protect systems from cyber attacks",relevance_score:80},
  {id:5,title:"Cloud Computing Fundamentals",type:"Workshop",date:"2026-02-20",domain:["Cloud Computing"],description:"Introduction to cloud platforms and deployment",relevance_score:78},
  {id:6,title:"Data Science with Python",type:"Workshop",date:"2026-02-22",domain:["Data Science"],description:"Data analysis and visualization using Python",relevance_score:88},
  {id:7,title:"AI Hackathon",type:"Hackathon",date:"2026-02-25",domain:["AI","Data Science"],description:"Build intelligent solutions using AI models",relevance_score:95},
  {id:8,title:"IoT Smart Campus Seminar",type:"Seminar",date:"2026-02-27",domain:["IoT"],description:"How IoT can improve smart campus infrastructure",relevance_score:82},
  {id:9,title:"Advanced Robotics Workshop",type:"Workshop",date:"2026-03-01",domain:["Robotics"],description:"Hands-on training with robotic systems",relevance_score:86},
  {id:10,title:"Healthcare Data Analytics",type:"Seminar",date:"2026-03-03",domain:["Healthcare","Data Science"],description:"Using data science for healthcare insights",relevance_score:89},
  {id:11,title:"Secure Web Development",type:"Workshop",date:"2026-03-05",domain:["Web Development","Cybersecurity"],description:"Best practices for building secure web apps",relevance_score:91},
  {id:12,title:"Cloud Infrastructure Hackathon",type:"Hackathon",date:"2026-03-08",domain:["Cloud Computing"],description:"Design scalable cloud infrastructure solutions",relevance_score:87},
  {id:13,title:"AI for IoT Devices",type:"Workshop",date:"2026-03-10",domain:["AI","IoT"],description:"Deploy AI models on IoT edge devices",relevance_score:93},
  {id:14,title:"Cybersecurity Capture The Flag",type:"Hackathon",date:"2026-03-12",domain:["Cybersecurity"],description:"Hands-on cybersecurity challenge event",relevance_score:94},
  {id:15,title:"Full Stack Web Seminar",type:"Seminar",date:"2026-03-15",domain:["Web Development"],description:"Overview of full stack web technologies",relevance_score:84},
  {id:16,title:"AI Ethics Workshop",type:"Workshop",date:"2026-03-17",domain:["AI"],description:"Understanding ethical AI practices",relevance_score:88},
  {id:17,title:"Robotics Automation Hackathon",type:"Hackathon",date:"2026-03-20",domain:["Robotics"],description:"Automation challenges in robotics",relevance_score:90},
  {id:18,title:"Cloud Security Seminar",type:"Seminar",date:"2026-03-22",domain:["Cloud Computing","Cybersecurity"],description:"Securing cloud platforms",relevance_score:85},
  {id:19,title:"IoT Smart Home Workshop",type:"Workshop",date:"2026-03-24",domain:["IoT"],description:"Hands-on IoT smart home devices",relevance_score:89},
  {id:20,title:"Data Science Hackathon",type:"Hackathon",date:"2026-03-26",domain:["Data Science"],description:"Compete in data science challenges",relevance_score:92}
];

function loadEvents(){
  const stored = localStorage.getItem('eventsData');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('eventsData', JSON.stringify(baseEvents));
  return [...baseEvents];
}
function setEvents(events){
  localStorage.setItem('eventsData', JSON.stringify(events));
  allEvents = events;
}
function nextEventId(){
  return allEvents.reduce((max, e) => Math.max(max, e.id), 0) + 1;
}
function allocateEventId(preferred){
  const exists = allEvents.some(e => e.id === preferred);
  return exists ? nextEventId() : preferred;
}

let allEvents = loadEvents();

// ---------------- AUTH ----------------
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const loginName = document.getElementById('loginName');
const loginRole = document.getElementById('loginRole');
const identityName = document.getElementById('identityName');
const identityRole = document.getElementById('identityRole');
const logoutBtn = document.getElementById('logoutBtn');
const requestActionSelect = document.getElementById('requestAction');
const themeToggle = document.getElementById('themeToggle');

function getSession(){
  return JSON.parse(localStorage.getItem('campusSession') || 'null');
}
function setSession(session){
  localStorage.setItem('campusSession', JSON.stringify(session));
}
function clearSession(){
  localStorage.removeItem('campusSession');
}
function applyRoleView(role){
  document.getElementById('organiserPortal').classList.toggle('hidden', role !== 'organiser');
  document.getElementById('adminPortal').classList.toggle('hidden', role !== 'admin');
  document.getElementById('studentNotice').classList.toggle('hidden', role !== 'student');
  if (role === 'organiser') setRequestAutoId();
}
function updateIdentity(session){
  identityName.textContent = session?.name || 'Guest';
  identityRole.textContent = session?.role ? session.role.charAt(0).toUpperCase() + session.role.slice(1) : 'Student';
}

function getStudentName(){
  const session = getSession();
  if (!session || session.role !== 'student') return null;
  return session.name || 'Guest';
}

function getRegistrationKey(){
  const studentName = getStudentName();
  return studentName ? `registeredEvents:${studentName}` : null;
}

function applyTheme(theme){
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('theme-dark');
  else root.classList.remove('theme-dark');
  if (themeToggle) themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
}

function initTheme(){
  const stored = localStorage.getItem('theme');
  const theme = stored || 'light';
  applyTheme(theme);
  if (themeToggle) {
    themeToggle.onclick = () => {
      const next = document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
    };
  }
}

loginBtn.onclick = () => {
  const name = loginName.value.trim() || 'Guest';
  const role = loginRole.value;
  const session = { name, role };
  setSession(session);
  updateIdentity(session);
  applyRoleView(role);
  loginModal.style.display = 'none';
  renderOrganiserRequests();
  renderAdminRequests();
  renderEvents(allEvents);
  updateCalendarMarks();
};

logoutBtn.onclick = () => {
  clearSession();
  loginModal.style.display = 'flex';
  updateIdentity(null);
  applyRoleView('student');
  renderEvents(allEvents);
  updateCalendarMarks();
};

// ---------------- REQUESTS ----------------
function getRequests(){ return JSON.parse(localStorage.getItem('eventRequests') || '[]'); }
function setRequests(reqs){ localStorage.setItem('eventRequests', JSON.stringify(reqs)); }
function addRequest(request){
  const reqs = getRequests();
  reqs.unshift(request);
  setRequests(reqs);
}
function updateRequestStatus(id, status){
  const reqs = getRequests().map(r => r.id === id ? { ...r, status } : r);
  setRequests(reqs);
}

function setRequestFormValues(event, action){
  document.getElementById('requestAction').value = action;
  document.getElementById('requestId').value = event.id;
  document.getElementById('requestTitle').value = event.title;
  document.getElementById('requestEventType').value = event.type;
  document.getElementById('requestDate').value = event.date;
  document.getElementById('requestDomain').value = event.domain.join(', ');
  document.getElementById('requestDescription').value = event.description;
  document.getElementById('requestScore').value = event.relevance_score;
}

function resetRequestFormForAdd(){
  document.getElementById('requestTitle').value = '';
  document.getElementById('requestDate').value = '';
  document.getElementById('requestDomain').value = '';
  document.getElementById('requestDescription').value = '';
  document.getElementById('requestScore').value = '';
  setRequestAutoId();
}

function openOrganiserRequestFromCard(event){
  setRequestFormValues(event, 'Edit');
  document.getElementById('organiserPortal').scrollIntoView({ behavior: 'smooth' });
}

const submitRequestBtn = document.getElementById('submitRequest');
submitRequestBtn.onclick = () => {
  const session = getSession();
  if (!session || session.role !== 'organiser') return;

  const action = document.getElementById('requestAction').value;
  const requestedId = parseInt(document.getElementById('requestId').value, 10);
  const title = document.getElementById('requestTitle').value.trim();
  const type = document.getElementById('requestEventType').value;
  const date = document.getElementById('requestDate').value;
  const domainRaw = document.getElementById('requestDomain').value.trim();
  const description = document.getElementById('requestDescription').value.trim();
  const score = parseInt(document.getElementById('requestScore').value, 10);

  const domain = domainRaw.split(',').map(d => d.trim()).filter(Boolean);
  if (!requestedId || Number.isNaN(requestedId)) return;
  if (!title || !type || !date || !domain.length || !description || Number.isNaN(score)) return;

  addRequest({
    id: Date.now(),
    organiser: session.name,
    action,
    requestedEventId: requestedId,
    requestedEvent: { title, type, date, domain, description, relevance_score: score },
    status: 'Pending',
    createdAt: new Date().toISOString()
  });

  resetRequestFormForAdd();
  renderOrganiserRequests();
  renderAdminRequests();
};

function renderOrganiserRequests(){
  const session = getSession();
  const container = document.getElementById('organiserRequests');
  if (!container) return;
  const reqs = getRequests().filter(r => r.organiser === session?.name);
  container.innerHTML = '';
  if (!reqs.length) {
    container.innerHTML = '<div class="meta">No requests yet.</div>';
    return;
  }
  reqs.forEach(req => {
    const item = document.createElement('div');
    item.className = 'request-item';
    const ev = req.requestedEvent;
    item.innerHTML = `
      <div><strong>${req.action}</strong> — ${ev.title} (ID ${req.requestedEventId})</div>
      <div class="meta">${ev.type} | ${ev.date} | ${ev.domain.join(', ')}</div>
      <div class="meta">Score: ${ev.relevance_score}</div>
      <div class="meta">${ev.description}</div>
      <span class="request-status ${req.status.toLowerCase()}">${req.status}</span>
    `;
    container.appendChild(item);
  });
}

function renderAdminRequests(){
  const container = document.getElementById('adminRequests');
  if (!container) return;
  const reqs = getRequests();
  container.innerHTML = '';
  if (!reqs.length) {
    container.innerHTML = '<div class="meta">No pending requests.</div>';
    return;
  }
  reqs.forEach(req => {
    const item = document.createElement('div');
    item.className = 'request-item';
    const statusClass = req.status.toLowerCase();
    const ev = req.requestedEvent;
    item.innerHTML = `
      <div><strong>${req.action}</strong> — ${ev.title} (ID ${req.requestedEventId})</div>
      <div class="meta">Requested by ${req.organiser}</div>
      <div class="meta">${ev.type} | ${ev.date} | ${ev.domain.join(', ')}</div>
      <div class="meta">Score: ${ev.relevance_score}</div>
      <div class="meta">${ev.description}</div>
      <span class="request-status ${statusClass}">${req.status}</span>
    `;

    if (req.status === 'Pending') {
      const actions = document.createElement('div');
      actions.className = 'request-actions';
      const approveBtn = document.createElement('button');
      approveBtn.className = 'success';
      approveBtn.textContent = 'Approve';
      approveBtn.onclick = () => {
        updateRequestStatus(req.id, 'Approved');
        if (req.action === 'Add') {
          const newId = allocateEventId(req.requestedEventId);
          const newEvent = { id: newId, ...req.requestedEvent };
          allEvents = [...allEvents, newEvent];
        }
        if (req.action === 'Edit') {
          const updatedId = req.requestedEventId;
          allEvents = allEvents.map(ev => ev.id === updatedId ? { id: updatedId, ...req.requestedEvent } : ev);
        }
        if (req.action === 'Remove') {
          const removeId = req.requestedEventId;
          allEvents = allEvents.filter(ev => ev.id !== removeId);
          removeRegisteredEvent(removeId);
        }
        setEvents(allEvents);
        renderEvents(allEvents);
        syncCalendarEvents();
        renderAdminRequests();
        renderOrganiserRequests();
      };
      const rejectBtn = document.createElement('button');
      rejectBtn.className = 'danger';
      rejectBtn.textContent = 'Reject';
      rejectBtn.onclick = () => {
        updateRequestStatus(req.id, 'Rejected');
        renderAdminRequests();
        renderOrganiserRequests();
      };
      actions.appendChild(approveBtn);
      actions.appendChild(rejectBtn);
      item.appendChild(actions);
    }

    container.appendChild(item);
  });
}

function setRequestAutoId(){
  const input = document.getElementById('requestId');
  if (input) input.value = nextEventId();
}

// ---------------- UTILITY ----------------
function getRegistered(){
  const key = getRegistrationKey();
  if (!key) return [];
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function isRegistered(id){ return getRegistered().some(e=>e.id===id); }
function registerEvent(event){ 
  const key = getRegistrationKey();
  if (!key) return;
  let reg=getRegistered(); 
  if(!reg.find(e=>e.id===event.id)) reg.push({id:event.id,title:event.title,date:event.date});
  localStorage.setItem(key,JSON.stringify(reg)); 
}
function unregisterEvent(event){
  const key = getRegistrationKey();
  if (!key) return;
  let reg=getRegistered();
  reg=reg.filter(e=>e.id!==event.id);
  localStorage.setItem(key,JSON.stringify(reg));
}
function removeRegisteredEvent(id){
  const key = getRegistrationKey();
  if (!key) return;
  let reg=getRegistered();
  reg=reg.filter(e=>e.id!==id);
  localStorage.setItem(key,JSON.stringify(reg));
}

// ---------------- CREATE CARD ----------------
function createCard(event, showScore=false, topHighlight=false){
  const card=document.createElement("div"); 
  card.classList.add("card", `type-${event.type}`);
  if(topHighlight) card.classList.add("top");
  const badges=event.domain.map(d=>`<span class="badge">${d}</span>`).join(" ");
  card.innerHTML=`
    <h3>${event.title}</h3>
    <div class="meta"><b>Type:</b> ${event.type} | <b>Date:</b> ${event.date}</div>
    <div class="badges">${badges}</div>
    <p>${event.description}</p>
    ${showScore?`<div class="score">Score: ${event.relevance_score}</div>`:""}
  `;
  if(isRegistered(event.id)){
    const badge=document.createElement("div");
    badge.classList.add("registered-badge");
    badge.innerText="Registered";
    const session = getSession();
    if (session?.role === 'student') card.appendChild(badge);
  }
  card.onclick=()=>{
    const session = getSession();
    if (session?.role === 'organiser') {
      openOrganiserRequestFromCard(event);
      return;
    }
    openRegistrationModal(event);
  };
  return card;
}

// ---------------- RENDER ----------------
function renderEvents(events){
  const container=document.getElementById("events");
  container.innerHTML="";
  events.forEach(ev=>{
    container.appendChild(createCard(ev));
  });
}
function renderRecommended(selectedInterests){
  const container=document.getElementById("recommended");
  container.innerHTML="";
  allEvents.forEach(ev=>{
    const match=ev.domain.filter(d=>selectedInterests.includes(d)).length;
    ev.relevance_score=match*25;
  });
  const topEvents=[...allEvents].sort((a,b)=>b.relevance_score-a.relevance_score).slice(0,5);
  topEvents.forEach((ev,i)=>{
    container.appendChild(createCard(ev,true,i<3));
  });
}

// ---------------- MODAL ----------------
function openRegistrationModal(event){
  const session = getSession();
  if (!session || session.role !== 'student') return;
  document.getElementById('modalTitle').innerText=event.title;
  document.getElementById('modalDescription').innerText=event.description;
  const btn=document.getElementById('registerBtn');
  const registered=isRegistered(event.id);
  btn.innerText=registered?"Unregister":"Register";
  btn.onclick=()=>{
    if(registered) unregisterEvent(event);
    else registerEvent(event);
    closeModal();
    renderEvents(allEvents);
    updateCalendarMarks();
  };
  document.getElementById('registrationModal').style.display='flex';
}
function closeModal(){ document.getElementById('registrationModal').style.display='none'; }

// ---------------- FILTERS ----------------
document.getElementById("applyFilters").onclick=()=>{
  const type=document.getElementById("typeFilter").value;
  const filtered=type?allEvents.filter(e=>e.type===type):allEvents;
  renderEvents(filtered);
};

// ---------------- RECOMMENDED ----------------
document.getElementById("applyRecommendation").onclick=()=>{
  const selected=[...document.querySelectorAll(".interest:checked")].map(c=>c.value);
  renderRecommended(selected);
};

// ---------------- HERO ACTIONS ----------------
document.getElementById('scrollFilters').onclick=()=>{
  document.getElementById('filters').scrollIntoView({ behavior: 'smooth' });
};
document.getElementById('scrollCalendar').onclick=()=>{
  document.getElementById('calendarSection').scrollIntoView({ behavior: 'smooth' });
};

// ---------------- CALENDAR ----------------
let calendar;
function syncCalendarEvents(){
  if (!calendar) return;
  calendar.removeAllEvents();
  calendar.addEventSource(allEvents.map(ev=>({id:ev.id,title:ev.title,start:ev.date,className:ev.type})));
}

document.addEventListener('DOMContentLoaded',()=>{
  calendar=new FullCalendar.Calendar(document.getElementById('calendar'),{
    initialView:'dayGridMonth',
    height:600,
    events:allEvents.map(ev=>({id:ev.id,title:ev.title,start:ev.date,className:ev.type})),
    eventClick: info=>openRegistrationModal(allEvents.find(e=>e.id==info.event.id))
  });
  calendar.render();
});

function updateCalendarMarks(){
  calendar.getEvents().forEach(e=>{
    const reg=isRegistered(e.id);
    e.setProp('backgroundColor',reg? '#115e59': (e.extendedProps.className==='Hackathon'? '#7c3aed': e.extendedProps.className==='Workshop'? '#0f766e':'#d97706'));
  });
}

// ---------------- INITIAL RENDER ----------------
renderEvents(allEvents);
initTheme();

// ---------------- INIT SESSION ----------------
const existingSession = getSession();
if (existingSession) {
  updateIdentity(existingSession);
  applyRoleView(existingSession.role);
  loginModal.style.display = 'none';
} else {
  applyRoleView('student');
}
setRequestAutoId();
if (requestActionSelect) {
  requestActionSelect.onchange = () => {
    if (requestActionSelect.value === 'Add') resetRequestFormForAdd();
  };
}
renderOrganiserRequests();
renderAdminRequests();
