
// ---------------- DATABASE + REALTIME LAYER ----------------
const STORAGE_KEYS = {
  events: 'eventsData',
  clubs: 'clubsData',
  requests: 'eventRequests',
  session: 'campusSession',
  theme: 'theme',
  notifications: 'notificationsData',
  feedback: 'feedbackData',
  registrations: 'registrationsData',
  realtime: 'campusRealtimeMessage',
  assistantSession: 'assistantSessionId'
};

const AI_API_BASE = 'http://127.0.0.1:8000';

const BASE_EVENTS = [
  {id:1,title:'AI in Healthcare Workshop',type:'Workshop',date:'2026-02-10',domain:['AI','Healthcare'],description:'Hands-on session on AI applications in healthcare',relevance_score:90},
  {id:2,title:'Web Development Bootcamp',type:'Workshop',date:'2026-02-12',domain:['Web Development'],description:'Learn modern frontend and backend web development',relevance_score:85},
  {id:3,title:'Robotics Hackathon',type:'Hackathon',date:'2026-02-15',domain:['Robotics','IoT'],description:'24-hour hackathon on robotics and automation',relevance_score:92},
  {id:4,title:'Cybersecurity Awareness Seminar',type:'Seminar',date:'2026-02-18',domain:['Cybersecurity'],description:'Learn how to protect systems from cyber attacks',relevance_score:80},
  {id:5,title:'Cloud Computing Fundamentals',type:'Workshop',date:'2026-02-20',domain:['Cloud Computing'],description:'Introduction to cloud platforms and deployment',relevance_score:78},
  {id:6,title:'Data Science with Python',type:'Workshop',date:'2026-02-22',domain:['Data Science'],description:'Data analysis and visualization using Python',relevance_score:88},
  {id:7,title:'AI Hackathon',type:'Hackathon',date:'2026-02-25',domain:['AI','Data Science'],description:'Build intelligent solutions using AI models',relevance_score:95},
  {id:8,title:'IoT Smart Campus Seminar',type:'Seminar',date:'2026-02-27',domain:['IoT'],description:'How IoT can improve smart campus infrastructure',relevance_score:82},
  {id:9,title:'Advanced Robotics Workshop',type:'Workshop',date:'2026-03-01',domain:['Robotics'],description:'Hands-on training with robotic systems',relevance_score:86},
  {id:10,title:'Healthcare Data Analytics',type:'Seminar',date:'2026-03-03',domain:['Healthcare','Data Science'],description:'Using data science for healthcare insights',relevance_score:89},
  {id:11,title:'Secure Web Development',type:'Workshop',date:'2026-03-05',domain:['Web Development','Cybersecurity'],description:'Best practices for building secure web apps',relevance_score:91},
  {id:12,title:'Cloud Infrastructure Hackathon',type:'Hackathon',date:'2026-03-08',domain:['Cloud Computing'],description:'Design scalable cloud infrastructure solutions',relevance_score:87},
  {id:13,title:'AI for IoT Devices',type:'Workshop',date:'2026-03-10',domain:['AI','IoT'],description:'Deploy AI models on IoT edge devices',relevance_score:93},
  {id:14,title:'Cybersecurity Capture The Flag',type:'Hackathon',date:'2026-03-12',domain:['Cybersecurity'],description:'Hands-on cybersecurity challenge event',relevance_score:94},
  {id:15,title:'Full Stack Web Seminar',type:'Seminar',date:'2026-03-15',domain:['Web Development'],description:'Overview of full stack web technologies',relevance_score:84},
  {id:16,title:'AI Ethics Workshop',type:'Workshop',date:'2026-03-17',domain:['AI'],description:'Understanding ethical AI practices',relevance_score:88},
  {id:17,title:'Robotics Automation Hackathon',type:'Hackathon',date:'2026-03-20',domain:['Robotics'],description:'Automation challenges in robotics',relevance_score:90},
  {id:18,title:'Cloud Security Seminar',type:'Seminar',date:'2026-03-22',domain:['Cloud Computing','Cybersecurity'],description:'Securing cloud platforms',relevance_score:85},
  {id:19,title:'IoT Smart Home Workshop',type:'Workshop',date:'2026-03-24',domain:['IoT'],description:'Hands-on IoT smart home devices',relevance_score:89},
  {id:20,title:'Data Science Hackathon',type:'Hackathon',date:'2026-03-26',domain:['Data Science'],description:'Compete in data science challenges',relevance_score:92}
];

const BASE_CLUBS = [
  {
    name: 'AI Society',
    focus_area: 'Artificial intelligence, machine learning, and responsible AI projects',
    description: 'The club runs weekly hands-on sessions, peer study circles, and semester-long project pods for students interested in applied AI.',
    meeting_schedule: 'Every Wednesday at 5:30 PM in Innovation Lab 2',
    location: 'Innovation Lab 2',
    faculty_coordinator: 'Dr. Meera Nair',
    student_leads: ['Ananya Rao', 'Rahul Menon'],
    membership: 'Open to all departments. First-year students can join without prior coding experience.',
    recent_activities: ['Hosted a GenAI bootcamp with 180 participants', 'Built a smart attendance prototype for the campus incubator'],
    contact_email: 'aisociety@campuspulse.edu'
  },
  {
    name: 'Robotics Club',
    focus_area: 'Embedded systems, robotics design, and autonomous systems',
    description: 'Members build line followers, drones, and mobile robots for inter-college competitions and internal demos.',
    meeting_schedule: 'Every Friday at 4:00 PM in the Mechatronics Workshop',
    location: 'Mechatronics Workshop',
    faculty_coordinator: 'Prof. Arvind Iyer',
    student_leads: ['Sneha Kulkarni', 'Vikram S'],
    membership: 'Open to students from engineering departments after a short orientation session.',
    recent_activities: ['Won second place in the South Zone Robo Race', 'Conducted a soldering and sensor integration workshop'],
    contact_email: 'robotics@campuspulse.edu'
  },
  {
    name: 'Entrepreneurship Cell',
    focus_area: 'Startup ideation, venture building, and founder mentoring',
    description: 'The cell connects students with mentors, startup founders, and pitch events throughout the academic year.',
    meeting_schedule: 'Alternate Saturdays at 11:00 AM in the Incubation Hub',
    location: 'Incubation Hub',
    faculty_coordinator: 'Dr. Kavitha Raman',
    student_leads: ['Ishaan Patel', 'Madhuri Sen'],
    membership: 'Open campus-wide for students interested in startups, product building, and business strategy.',
    recent_activities: ['Ran a founder AMA series with alumni entrepreneurs', 'Organized a campus startup validation sprint'],
    contact_email: 'ecell@campuspulse.edu'
  }
];

const db = {
  async read(key, fallback){
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(key, JSON.stringify(fallback));
      return structuredClone(fallback);
    } catch {
      return structuredClone(fallback);
    }
  },
  async write(key, value){
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  },
  // Optional backend hook: if your API exists, replace internals to use fetch.
};

let realtimeSocket = null;
let realtimeChannel = null;
function initRealtime(){
  try {
    realtimeChannel = new BroadcastChannel('campuspulse_events_channel');
    realtimeChannel.onmessage = (event) => handleRealtimeMessage(event.data, true);
  } catch {
    realtimeChannel = null;
  }

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.realtime && event.newValue) {
      handleRealtimeMessage(JSON.parse(event.newValue), true);
    }
  });

  try {
    realtimeSocket = new WebSocket('ws://localhost:8080/events');
    realtimeSocket.onmessage = (event) => {
      try {
        handleRealtimeMessage(JSON.parse(event.data), true);
      } catch {
        // Ignore malformed payload
      }
    };
  } catch {
    realtimeSocket = null;
  }
}

function emitRealtime(type, payload){
  const message = { type, payload, at: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.realtime, JSON.stringify(message));
  if (realtimeChannel) realtimeChannel.postMessage(message);
  if (realtimeSocket && realtimeSocket.readyState === WebSocket.OPEN) {
    realtimeSocket.send(JSON.stringify(message));
  }
}

async function handleRealtimeMessage(message, external){
  if (!message || !external) return;
  if (message.type === 'events_updated') {
    await loadEvents();
    renderEverything();
  }
  if (message.type === 'new_notification') {
    renderNotifications();
  }
}

// ---------------- STATE ----------------
let allEvents = [];
let allClubs = [];
let calendar = null;
const assistantState = {
  sessionId: getAssistantSessionId(),
  messages: [],
  typing: false,
  backend: null,
  widgetOpen: false
};

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
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || 'null');
}

function setSession(session){
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

function clearSession(){
  localStorage.removeItem(STORAGE_KEYS.session);
}

function updateIdentity(session){
  identityName.textContent = session?.name || 'Guest';
  identityRole.textContent = session?.role ? `${session.role[0].toUpperCase()}${session.role.slice(1)}` : 'Student';
}

function applyRoleView(role){
  document.getElementById('organiserPortal').classList.toggle('hidden', role !== 'organiser');
  document.getElementById('adminPortal').classList.toggle('hidden', role !== 'admin');
  document.getElementById('studentNotice').classList.toggle('hidden', role !== 'student');
  document.getElementById('analyticsDashboard').classList.toggle('hidden', role !== 'admin');
  if (role === 'organiser') setRequestAutoId();
}

function getStudentName(){
  const session = getSession();
  return session && session.role === 'student' ? session.name : null;
}

function applyTheme(theme){
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('theme-dark');
  else root.classList.remove('theme-dark');
  if (themeToggle) themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
}

function initTheme(){
  const theme = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
  applyTheme(theme);
  themeToggle.onclick = () => {
    const next = document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEYS.theme, next);
    applyTheme(next);
  };
}

// ---------------- EVENTS + REQUESTS ----------------
async function loadEvents(){
  const events = await db.read(STORAGE_KEYS.events, BASE_EVENTS);
  allEvents = events;
  return events;
}

async function loadClubs(){
  const clubs = await db.read(STORAGE_KEYS.clubs, BASE_CLUBS);
  allClubs = Array.isArray(clubs) && clubs.length ? clubs : structuredClone(BASE_CLUBS);

  try {
    const response = await fetch('../backend/data/clubs.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load clubs: ${response.status}`);
    const payload = await response.json();
    const nextClubs = Array.isArray(payload.clubs) && payload.clubs.length ? payload.clubs : structuredClone(BASE_CLUBS);
    allClubs = nextClubs;
    await db.write(STORAGE_KEYS.clubs, nextClubs);
  } catch {
    // Keep cached or bundled campus data when the JSON file is unavailable.
  }

  return allClubs;
}

async function saveEvents(events){
  allEvents = events;
  await db.write(STORAGE_KEYS.events, events);
  emitRealtime('events_updated', { count: events.length });
}

function nextEventId(){
  return allEvents.reduce((max, event) => Math.max(max, event.id), 0) + 1;
}

function allocateEventId(preferred){
  const exists = allEvents.some((event) => event.id === preferred);
  return exists ? nextEventId() : preferred;
}

function getRequests(){
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.requests) || '[]');
}

function setRequests(requests){
  localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(requests));
}

function addRequest(request){
  const requests = getRequests();
  requests.unshift(request);
  setRequests(requests);
}

function updateRequestStatus(id, status){
  const requests = getRequests().map((request) => request.id === id ? { ...request, status } : request);
  setRequests(requests);
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

function setRequestAutoId(){
  const input = document.getElementById('requestId');
  if (input) input.value = nextEventId();
}
function renderOrganiserRequests(){
  const session = getSession();
  const container = document.getElementById('organiserRequests');
  if (!container) return;
  const requests = getRequests().filter((request) => request.organiser === session?.name);
  container.innerHTML = '';
  if (!requests.length) {
    container.innerHTML = '<div class="meta">No requests yet.</div>';
    return;
  }
  requests.forEach((request) => {
    const event = request.requestedEvent;
    const item = document.createElement('div');
    item.className = 'request-item';
    item.innerHTML = `
      <div><strong>${escapeHtml(request.action)}</strong> - ${escapeHtml(event.title)} (ID ${request.requestedEventId})</div>
      <div class="meta">${escapeHtml(event.type)} | ${escapeHtml(event.date)} | ${escapeHtml(event.domain.join(', '))}</div>
      <div class="meta">Score: ${event.relevance_score}</div>
      <span class="request-status ${request.status.toLowerCase()}">${escapeHtml(request.status)}</span>
    `;
    container.appendChild(item);
  });
}

function renderAdminRequests(){
  const container = document.getElementById('adminRequests');
  if (!container) return;
  const requests = getRequests();
  container.innerHTML = '';
  if (!requests.length) {
    container.innerHTML = '<div class="meta">No pending requests.</div>';
    return;
  }

  requests.forEach((request) => {
    const event = request.requestedEvent;
    const item = document.createElement('div');
    item.className = 'request-item';
    item.innerHTML = `
      <div><strong>${escapeHtml(request.action)}</strong> - ${escapeHtml(event.title)} (ID ${request.requestedEventId})</div>
      <div class="meta">Requested by ${escapeHtml(request.organiser)}</div>
      <div class="meta">${escapeHtml(event.type)} | ${escapeHtml(event.date)} | ${escapeHtml(event.domain.join(', '))}</div>
      <span class="request-status ${request.status.toLowerCase()}">${escapeHtml(request.status)}</span>
    `;

    if (request.status === 'Pending') {
      const actions = document.createElement('div');
      actions.className = 'request-actions';

      const approveBtn = document.createElement('button');
      approveBtn.className = 'success';
      approveBtn.textContent = 'Approve';
      approveBtn.onclick = async () => {
        updateRequestStatus(request.id, 'Approved');

        if (request.action === 'Add') {
          const newId = allocateEventId(request.requestedEventId);
          allEvents = [...allEvents, { id: newId, ...event }];
        }
        if (request.action === 'Edit') {
          allEvents = allEvents.map((existing) => existing.id === request.requestedEventId ? { id: request.requestedEventId, ...event } : existing);
        }
        if (request.action === 'Remove') {
          allEvents = allEvents.filter((existing) => existing.id !== request.requestedEventId);
          removeRegisteredEvent(request.requestedEventId);
        }

        await saveEvents(allEvents);
        pushNotification(`Request approved: ${event.title}`, { role: 'organiser' });
        renderEverything();
      };

      const rejectBtn = document.createElement('button');
      rejectBtn.className = 'danger';
      rejectBtn.textContent = 'Reject';
      rejectBtn.onclick = () => {
        updateRequestStatus(request.id, 'Rejected');
        pushNotification(`Request rejected: ${event.title}`, { role: 'organiser' });
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

// ---------------- REGISTRATION ----------------
function getRegistrationMap(){
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.registrations) || '{}');
}

function setRegistrationMap(map){
  localStorage.setItem(STORAGE_KEYS.registrations, JSON.stringify(map));
}

function getRegistered(){
  const student = getStudentName();
  if (!student) return [];
  const map = getRegistrationMap();
  return map[student] || [];
}

function isRegistered(id){
  return getRegistered().some((event) => event.id === Number(id));
}

function registerEvent(event){
  const student = getStudentName();
  if (!student) return;
  const map = getRegistrationMap();
  const current = map[student] || [];
  if (!current.some((entry) => entry.id === event.id)) {
    current.push({ id: event.id, title: event.title, date: event.date, type: event.type, domain: event.domain });
  }
  map[student] = current;
  setRegistrationMap(map);
  pushNotification(`You registered for ${event.title}`, { user: student });
  emitRealtime('new_notification', { user: student });
}

function unregisterEvent(event){
  const student = getStudentName();
  if (!student) return;
  const map = getRegistrationMap();
  const current = map[student] || [];
  map[student] = current.filter((entry) => entry.id !== event.id);
  setRegistrationMap(map);
  pushNotification(`You unregistered from ${event.title}`, { user: student });
}

function removeRegisteredEvent(eventId){
  const map = getRegistrationMap();
  const entries = Object.keys(map);
  entries.forEach((student) => {
    map[student] = (map[student] || []).filter((entry) => entry.id !== Number(eventId));
  });
  setRegistrationMap(map);
}

// ---------------- NOTIFICATIONS ----------------
function getNotifications(){
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '[]');
}

function setNotifications(items){
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(items));
}

function pushNotification(text, scope = {}){
  const notifications = getNotifications();
  notifications.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    text,
    scope,
    createdAt: new Date().toISOString(),
    readBy: []
  });
  setNotifications(notifications);
  emitRealtime('new_notification', scope);
  renderNotifications();
}

function getVisibleNotifications(){
  const session = getSession();
  if (!session) return [];
  const notifications = getNotifications();
  return notifications.filter((notification) => {
    if (!notification.scope || (!notification.scope.role && !notification.scope.user)) return true;
    if (notification.scope.user && notification.scope.user === session.name) return true;
    if (notification.scope.role && notification.scope.role === session.role) return true;
    return false;
  });
}
function isRead(notification, userName){
  return (notification.readBy || []).includes(userName);
}

function renderNotifications(){
  const list = document.getElementById('notificationsList');
  const counter = document.getElementById('notificationCount');
  const session = getSession();
  if (!list || !counter || !session) {
    if (counter) counter.textContent = '0';
    return;
  }

  const visible = getVisibleNotifications();
  const unread = visible.filter((notification) => !isRead(notification, session.name));
  counter.textContent = String(unread.length);

  list.innerHTML = '';
  if (!visible.length) {
    list.innerHTML = '<div class="meta">No notifications.</div>';
    return;
  }

  visible.slice(0, 25).forEach((notification) => {
    const item = document.createElement('div');
    item.className = 'request-item';
    if (!isRead(notification, session.name)) item.classList.add('unread');
    item.innerHTML = `
      <div>${escapeHtml(notification.text)}</div>
      <div class="meta">${escapeHtml(new Date(notification.createdAt).toLocaleString())}</div>
    `;
    item.onclick = () => markNotificationRead(notification.id);
    list.appendChild(item);
  });
}

function markNotificationRead(id){
  const session = getSession();
  if (!session) return;
  const notifications = getNotifications().map((notification) => {
    if (notification.id !== id) return notification;
    const readBy = notification.readBy || [];
    if (!readBy.includes(session.name)) readBy.push(session.name);
    return { ...notification, readBy };
  });
  setNotifications(notifications);
  renderNotifications();
}

function markAllNotificationsRead(){
  const session = getSession();
  if (!session) return;
  const notifications = getNotifications().map((notification) => {
    const readBy = notification.readBy || [];
    if (!readBy.includes(session.name)) readBy.push(session.name);
    return { ...notification, readBy };
  });
  setNotifications(notifications);
  renderNotifications();
}

// ---------------- FEEDBACK + SENTIMENT ----------------
const POSITIVE_TERMS = ['great', 'excellent', 'useful', 'amazing', 'good', 'helpful', 'fantastic', 'insightful'];
const NEGATIVE_TERMS = ['bad', 'poor', 'boring', 'confusing', 'waste', 'disappointing', 'slow', 'hard'];

function analyzeSentiment(text){
  const normalized = text.toLowerCase();
  let score = 0;
  POSITIVE_TERMS.forEach((term) => { if (normalized.includes(term)) score += 1; });
  NEGATIVE_TERMS.forEach((term) => { if (normalized.includes(term)) score -= 1; });
  const label = score > 0 ? 'Positive' : score < 0 ? 'Negative' : 'Neutral';
  return { score, label };
}

function getFeedback(){
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.feedback) || '[]');
}

function setFeedback(items){
  localStorage.setItem(STORAGE_KEYS.feedback, JSON.stringify(items));
}

function renderFeedbackEventOptions(){
  const select = document.getElementById('feedbackEventId');
  if (!select) return;
  select.innerHTML = allEvents.map((event) => `<option value="${event.id}">${escapeHtml(event.title)}</option>`).join('');
}

function submitFeedback(){
  const session = getSession();
  if (!session) return;

  const eventId = Number(document.getElementById('feedbackEventId').value);
  const text = document.getElementById('feedbackText').value.trim();
  if (!eventId || !text) return;

  const event = allEvents.find((item) => item.id === eventId);
  if (!event) return;

  const sentiment = analyzeSentiment(text);
  const feedback = getFeedback();
  feedback.unshift({
    id: Date.now(),
    eventId,
    eventTitle: event.title,
    user: session.name,
    text,
    sentiment,
    createdAt: new Date().toISOString()
  });
  setFeedback(feedback);
  document.getElementById('feedbackText').value = '';
  pushNotification(`New ${sentiment.label.toLowerCase()} feedback on ${event.title}`, { role: 'admin' });
  renderFeedback();
  renderAnalytics();
}

function renderFeedback(){
  const container = document.getElementById('feedbackList');
  if (!container) return;
  const feedback = getFeedback();
  container.innerHTML = '';
  if (!feedback.length) {
    container.innerHTML = '<div class="meta">No feedback yet.</div>';
    return;
  }

  feedback.slice(0, 20).forEach((entry) => {
    const item = document.createElement('div');
    item.className = 'request-item';
    item.innerHTML = `
      <div><strong>${escapeHtml(entry.eventTitle)}</strong> - ${escapeHtml(entry.sentiment.label)} (${entry.sentiment.score})</div>
      <div class="meta">${escapeHtml(entry.user)}: ${escapeHtml(entry.text)}</div>
      <div class="meta">${escapeHtml(new Date(entry.createdAt).toLocaleString())}</div>
    `;
    container.appendChild(item);
  });
}

// ---------------- AI RECOMMENDATIONS ----------------
function getDomainAffinity(studentName){
  const map = getRegistrationMap();
  const registered = map[studentName] || [];
  const counts = {};
  registered.forEach((entry) => {
    (entry.domain || []).forEach((domain) => {
      counts[domain] = (counts[domain] || 0) + 1;
    });
  });
  return counts;
}

function getDomainSentimentBoost(){
  const feedback = getFeedback();
  const scoreMap = {};
  feedback.forEach((entry) => {
    const event = allEvents.find((item) => item.id === entry.eventId);
    if (!event) return;
    event.domain.forEach((domain) => {
      scoreMap[domain] = (scoreMap[domain] || 0) + entry.sentiment.score;
    });
  });
  return scoreMap;
}

function getAiRecommendations(selectedInterests){
  const session = getSession();
  if (!session) return [];

  const affinity = getDomainAffinity(session.name);
  const sentimentBoost = getDomainSentimentBoost();

  return allEvents
    .map((event) => {
      const interestScore = event.domain.filter((domain) => selectedInterests.includes(domain)).length * 24;
      const historyScore = event.domain.reduce((sum, domain) => sum + ((affinity[domain] || 0) * 10), 0);
      const sentimentScore = event.domain.reduce((sum, domain) => sum + ((sentimentBoost[domain] || 0) * 2), 0);
      const score = event.relevance_score + interestScore + historyScore + sentimentScore;
      return { ...event, ai_score: score };
    })
    .sort((a, b) => b.ai_score - a.ai_score)
    .slice(0, 5);
}

function escapeHtml(value){
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getAssistantSessionId(){
  const existing = localStorage.getItem(STORAGE_KEYS.assistantSession);
  if (existing) return existing;
  const created = `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(STORAGE_KEYS.assistantSession, created);
  return created;
}
// ---------------- UI ----------------
function createCard(event, showScore = false, topHighlight = false){
  const card = document.createElement('div');
  card.classList.add('card', `type-${event.type}`);
  if (topHighlight) card.classList.add('top');

  const session = getSession();
  const badges = event.domain.map((domain) => `<span class="badge">${escapeHtml(domain)}</span>`).join(' ');
  card.innerHTML = `
    <div class="card-topline">
      <span class="type-pill">${escapeHtml(event.type)}</span>
      <span class="date-pill">${escapeHtml(event.date)}</span>
    </div>
    <h3>${escapeHtml(event.title)}</h3>
    <div class="meta">${escapeHtml(event.domain.join(', '))}</div>
    <div class="badges">${badges}</div>
    <p>${escapeHtml(event.description)}</p>
    ${showScore ? `<div class="score">AI Score: ${Math.round(event.ai_score || event.relevance_score)}</div>` : ''}
    <div class="card-footer">
      <span class="meta">Tap to ${session?.role === 'organiser' ? 'request changes' : session?.role === 'admin' ? 'manage this event' : 'register'}</span>
    </div>
  `;

  if (isRegistered(event.id) && session?.role === 'student') {
    const badge = document.createElement('div');
    badge.className = 'registered-badge';
    badge.innerText = 'Registered';
    card.appendChild(badge);
  }

  card.onclick = () => {
    const current = getSession();
    if (current?.role === 'organiser') {
      openOrganiserRequestFromCard(event);
      return;
    }
    if (current?.role === 'admin') {
      populateAdminEventForm(event);
      document.getElementById('adminPortal').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    openRegistrationModal(event);
  };

  return card;
}

function createClubCard(club){
  const card = document.createElement('div');
  card.className = 'club-card';
  const activities = (club.recent_activities || [])
    .slice(0, 2)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
  const leads = Array.isArray(club.student_leads) ? club.student_leads.join(', ') : '';

  card.innerHTML = `
    <div class="card-topline">
      <span class="type-pill">Club</span>
      <span class="date-pill">${escapeHtml(club.location || 'Campus')}</span>
    </div>
    <h3>${escapeHtml(club.name || 'Campus Club')}</h3>
    <div class="meta">${escapeHtml(club.focus_area || '')}</div>
    <p>${escapeHtml(club.description || '')}</p>
    <div class="club-meta">
      <div><strong>Meet:</strong> ${escapeHtml(club.meeting_schedule || 'Schedule TBA')}</div>
      <div><strong>Faculty:</strong> ${escapeHtml(club.faculty_coordinator || 'TBA')}</div>
      <div><strong>Leads:</strong> ${escapeHtml(leads || 'TBA')}</div>
    </div>
    <ul class="club-activity-list">${activities}</ul>
    <div class="club-footer">
      <span class="badge">${escapeHtml(club.membership || 'Open to students')}</span>
      <a class="club-link" href="mailto:${escapeHtml(club.contact_email || '')}">Contact</a>
    </div>
  `;

  return card;
}

function renderEvents(events){
  const container = document.getElementById('events');
  container.innerHTML = '';
  if (!events.length) {
    container.innerHTML = '<div class="empty-state">No events matched your current filters.</div>';
    return;
  }
  events.forEach((event) => container.appendChild(createCard(event)));
}

function renderRecommended(selectedInterests){
  const container = document.getElementById('recommended');
  const recommended = getAiRecommendations(selectedInterests);
  container.innerHTML = '';
  if (!recommended.length) {
    container.innerHTML = '<div class="empty-state">Login as a student to see personalized recommendations.</div>';
    return;
  }
  recommended.forEach((event, index) => container.appendChild(createCard(event, true, index < 3)));
}

function renderClubs(){
  const container = document.getElementById('clubs');
  if (!container) return;
  container.innerHTML = '';
  if (!allClubs.length) {
    container.innerHTML = '<div class="empty-state">No clubs available right now.</div>';
    return;
  }
  allClubs.forEach((club) => container.appendChild(createClubCard(club)));
}

function getSelectedInterests(){
  return [...document.querySelectorAll('.interest:checked')].map((checkbox) => checkbox.value);
}

function getFilteredEvents(){
  const type = document.getElementById('typeFilter')?.value || '';
  return type ? allEvents.filter((event) => event.type === type) : allEvents;
}

function syncFilterUi(){
  const type = document.getElementById('typeFilter')?.value || '';
  const selectedInterests = getSelectedInterests();
  const filteredEvents = getFilteredEvents();

  document.querySelectorAll('.filter-pill').forEach((button) => {
    const active = button.dataset.filterType === type;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const typeSummary = document.getElementById('filterTypeSummary');
  const interestSummary = document.getElementById('interestSummary');
  const resultCount = document.getElementById('filterResultCount');

  if (typeSummary) {
    typeSummary.textContent = type ? `${type} events selected` : 'Showing all event types';
  }
  if (interestSummary) {
    interestSummary.textContent = `${selectedInterests.length} ${selectedInterests.length === 1 ? 'interest' : 'interests'} selected`;
  }
  if (resultCount) {
    resultCount.textContent = `${filteredEvents.length} ${filteredEvents.length === 1 ? 'event' : 'events'} in view`;
  }
}

function renderFilteredEvents(){
  const filteredEvents = getFilteredEvents();
  renderEvents(filteredEvents);
  syncFilterUi();
}

function openRegistrationModal(event){
  const session = getSession();
  if (!session || session.role !== 'student') return;

  document.getElementById('modalTitle').innerText = event.title;
  document.getElementById('modalDescription').innerText = event.description;

  const button = document.getElementById('registerBtn');
  const registered = isRegistered(event.id);
  button.innerText = registered ? 'Unregister' : 'Register';

  button.onclick = () => {
    if (registered) unregisterEvent(event);
    else registerEvent(event);
    closeModal();
    renderEverything();
  };

  document.getElementById('registrationModal').style.display = 'flex';
}

function closeModal(){
  document.getElementById('registrationModal').style.display = 'none';
}

// ---------------- CALENDAR + SMART INTEGRATION ----------------
function buildCalendarEvents(){
  return allEvents.map((event) => ({
    id: String(event.id),
    title: event.title,
    start: event.date,
    classNames: [event.type]
  }));
}

function syncCalendarEvents(){
  if (!calendar) return;
  calendar.removeAllEvents();
  calendar.addEventSource(buildCalendarEvents());
  updateCalendarMarks();
}

function updateCalendarMarks(){
  if (!calendar) return;
  calendar.getEvents().forEach((entry) => {
    const registered = isRegistered(entry.id);
    if (registered) {
      entry.setProp('backgroundColor', '#115e59');
      return;
    }
    const className = Array.isArray(entry.classNames) && entry.classNames.length ? entry.classNames[0] : '';
    if (className === 'Hackathon') {
      entry.setProp('backgroundColor', '#7c3aed');
      entry.setProp('borderColor', '#7c3aed');
    }
    if (className === 'Workshop') {
      entry.setProp('backgroundColor', '#0891b2');
      entry.setProp('borderColor', '#0891b2');
    }
    if (className === 'Seminar') {
      entry.setProp('backgroundColor', '#f59e0b');
      entry.setProp('borderColor', '#f59e0b');
    }
  });
}

function formatIcsDate(dateString){
  return `${dateString.replaceAll('-', '')}T090000`;
}

function exportRegisteredToIcs(){
  const registered = getRegistered();
  if (!registered.length) return;

  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CampusPulse//EN'];
  registered.forEach((eventRef) => {
    const event = allEvents.find((item) => item.id === eventRef.id);
    if (!event) return;
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@campuspulse`);
    lines.push(`DTSTAMP:${formatIcsDate(event.date)}`);
    lines.push(`DTSTART:${formatIcsDate(event.date)}`);
    lines.push(`SUMMARY:${event.title}`);
    lines.push(`DESCRIPTION:${event.description}`);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'campus-events.ics';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function openGoogleCalendar(){
  const registered = getRegistered();
  if (!registered.length) return;
  const event = allEvents.find((item) => item.id === registered[0].id);
  if (!event) return;

  const start = `${event.date.replaceAll('-', '')}T090000`;
  const end = `${event.date.replaceAll('-', '')}T110000`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description
  });
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
}

// ---------------- ANALYTICS ----------------
function getRegistrationMetrics(){
  const map = getRegistrationMap();
  const users = Object.keys(map);
  const totalRegistrations = users.reduce((sum, name) => sum + (map[name] || []).length, 0);
  const uniqueStudents = users.filter((name) => (map[name] || []).length > 0).length;

  const eventCounts = {};
  users.forEach((name) => {
    (map[name] || []).forEach((entry) => {
      eventCounts[entry.id] = (eventCounts[entry.id] || 0) + 1;
    });
  });

  let mostPopular = 'N/A';
  let maxCount = 0;
  Object.keys(eventCounts).forEach((id) => {
    if (eventCounts[id] > maxCount) {
      maxCount = eventCounts[id];
      const found = allEvents.find((event) => event.id === Number(id));
      mostPopular = found ? found.title : 'N/A';
    }
  });

  return { totalRegistrations, uniqueStudents, mostPopular };
}

function getSentimentMetrics(){
  const feedback = getFeedback();
  const counts = { Positive: 0, Neutral: 0, Negative: 0 };
  feedback.forEach((entry) => {
    counts[entry.sentiment.label] = (counts[entry.sentiment.label] || 0) + 1;
  });
  return counts;
}
function renderAnalytics(){
  const cards = document.getElementById('analyticsCards');
  const breakdown = document.getElementById('analyticsBreakdown');
  if (!cards || !breakdown) return;

  const registrations = getRegistrationMetrics();
  const sentiment = getSentimentMetrics();

  cards.innerHTML = `
    <div class="analytic-card"><div class="meta">Total Events</div><strong>${allEvents.length}</strong></div>
    <div class="analytic-card"><div class="meta">Total Registrations</div><strong>${registrations.totalRegistrations}</strong></div>
    <div class="analytic-card"><div class="meta">Active Students</div><strong>${registrations.uniqueStudents}</strong></div>
    <div class="analytic-card"><div class="meta">Most Popular</div><strong>${registrations.mostPopular}</strong></div>
  `;

  const sentimentTotal = sentiment.Positive + sentiment.Neutral + sentiment.Negative || 1;
  const posPercent = Math.round((sentiment.Positive / sentimentTotal) * 100);
  const neuPercent = Math.round((sentiment.Neutral / sentimentTotal) * 100);
  const negPercent = Math.round((sentiment.Negative / sentimentTotal) * 100);

  breakdown.innerHTML = `
    <div class="bar-row"><span>Positive (${posPercent}%)</span><div class="bar"><div class="fill pos" style="width:${posPercent}%"></div></div></div>
    <div class="bar-row"><span>Neutral (${neuPercent}%)</span><div class="bar"><div class="fill neu" style="width:${neuPercent}%"></div></div></div>
    <div class="bar-row"><span>Negative (${negPercent}%)</span><div class="bar"><div class="fill neg" style="width:${negPercent}%"></div></div></div>
  `;
}

// ---------------- ADMIN DIRECT MANAGEMENT ----------------
function getAdminFormPayload(){
  const idRaw = document.getElementById('adminEventId').value;
  const id = idRaw ? Number(idRaw) : nextEventId();
  const title = document.getElementById('adminEventTitle').value.trim();
  const type = document.getElementById('adminEventType').value;
  const date = document.getElementById('adminEventDate').value;
  const domain = document.getElementById('adminEventDomain').value.split(',').map((d) => d.trim()).filter(Boolean);
  const description = document.getElementById('adminEventDescription').value.trim();
  const score = Number(document.getElementById('adminEventScore').value || 0);

  if (!title || !date || !domain.length || !description) return null;
  return { id, title, type, date, domain, description, relevance_score: score };
}

function populateAdminEventForm(event){
  document.getElementById('adminEventId').value = event.id;
  document.getElementById('adminEventTitle').value = event.title;
  document.getElementById('adminEventType').value = event.type;
  document.getElementById('adminEventDate').value = event.date;
  document.getElementById('adminEventDomain').value = event.domain.join(', ');
  document.getElementById('adminEventDescription').value = event.description;
  document.getElementById('adminEventScore').value = event.relevance_score;
}

function clearAdminForm(){
  document.getElementById('adminEventId').value = '';
  document.getElementById('adminEventTitle').value = '';
  document.getElementById('adminEventDate').value = '';
  document.getElementById('adminEventDomain').value = '';
  document.getElementById('adminEventDescription').value = '';
  document.getElementById('adminEventScore').value = '';
}

async function upsertAdminEvent(){
  const payload = getAdminFormPayload();
  if (!payload) return;

  const exists = allEvents.some((event) => event.id === payload.id);
  if (exists) allEvents = allEvents.map((event) => event.id === payload.id ? payload : event);
  else allEvents = [...allEvents, payload];

  await saveEvents(allEvents);
  pushNotification(`Admin ${exists ? 'updated' : 'created'}: ${payload.title}`, { role: 'student' });
  renderEverything();
}

async function deleteAdminEvent(){
  const id = Number(document.getElementById('adminEventId').value);
  if (!id) return;
  allEvents = allEvents.filter((event) => event.id !== id);
  removeRegisteredEvent(id);
  await saveEvents(allEvents);
  pushNotification(`Event removed (ID ${id})`, {});
  clearAdminForm();
  renderEverything();
}

// ---------------- ASSISTANT + HERO ----------------
function formatAssistantText(text){
  return escapeHtml(text).replaceAll('\n', '<br>');
}

function addAssistantMessage(role, text, sources = []){
  assistantState.messages.push({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    text,
    sources
  });
  renderAssistantMessages();
}

function seedAssistantMessages(){
  if (assistantState.messages.length) return;
  addAssistantMessage(
    'assistant',
    'Ask about events, clubs, placements, or campus policies. I will answer from the campus knowledge base and cite my sources.'
  );
}

function setAssistantTyping(value){
  assistantState.typing = value;
  renderAssistantMessages();
}

function renderAssistantThread(container){
  if (!container) return;
  container.innerHTML = '';

  assistantState.messages.forEach((message) => {
    const row = document.createElement('div');
    row.className = `message-row ${message.role}`;

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${message.role}`;
    bubble.innerHTML = `<div class="message-copy">${formatAssistantText(message.text)}</div>`;

    if (message.sources && message.sources.length) {
      const sources = document.createElement('div');
      sources.className = 'message-sources';
      sources.innerHTML = message.sources.map((source) => `<span>${escapeHtml(source)}</span>`).join('');
      bubble.appendChild(sources);
    }

    row.appendChild(bubble);
    container.appendChild(row);
  });

  if (assistantState.typing) {
    const typing = document.createElement('div');
    typing.className = 'message-row assistant';
    typing.innerHTML = `
      <div class="message-bubble assistant">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    container.appendChild(typing);
  }

  container.scrollTop = container.scrollHeight;
}

function renderAssistantMessages(){
  renderAssistantThread(document.getElementById('assistantMessages'));
  renderAssistantThread(document.getElementById('chatMessages'));

  const preview = document.getElementById('assistantSourcesPreview');
  if (!preview) return;
  const latestSources = [...assistantState.messages]
    .reverse()
    .find((message) => message.role === 'assistant' && message.sources?.length)?.sources || [];
  preview.textContent = latestSources.length ? latestSources.join(' | ') : 'Sources will appear here after the first response.';
}

function updateAssistantStatus(){
  const badge = document.getElementById('assistantStatusBadge');
  const heroBadge = document.getElementById('heroAssistantStatus');
  const heroMeta = document.getElementById('heroAssistantMeta');
  const modeText = document.getElementById('assistantModeText');
  const chatStatusText = document.getElementById('chatStatusText');
  const launcherDot = document.getElementById('chatLauncherDot');

  const health = assistantState.backend;
  const online = Boolean(health);
  const label = online ? 'Backend online' : 'Backend offline';
  const mode = online
    ? `${health.answer_mode} mode | embeddings: ${health.embedding_provider || 'unknown'}`
    : 'Waiting for backend connection';
  const heroCopy = online
    ? `Assistant ready${health.initialized ? ' with indexed campus data.' : ', but knowledge base needs initialization.'}`
    : 'Start the FastAPI backend to enable grounded campus Q&A.';

  [badge, heroBadge].forEach((element) => {
    if (!element) return;
    element.textContent = label;
    element.classList.toggle('online', online);
    element.classList.toggle('offline', !online);
  });

  if (modeText) modeText.textContent = mode;
  if (heroMeta) heroMeta.textContent = heroCopy;
  if (chatStatusText) chatStatusText.textContent = label;
  if (launcherDot) launcherDot.classList.toggle('online', online);
}

async function refreshAssistantHealth(){
  try {
    const response = await fetch(`${AI_API_BASE}/health`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    assistantState.backend = await response.json();
  } catch {
    assistantState.backend = null;
  }

  updateAssistantStatus();
  updateHeroStats();
}

async function initializeAssistantKnowledgeBase(){
  const button = document.getElementById('assistantInitBtn');
  if (button) {
    button.disabled = true;
    button.textContent = 'Initializing...';
  }

  try {
    const response = await fetch(`${AI_API_BASE}/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rebuild: false })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.detail || 'Initialization failed.');
    addAssistantMessage(
      'assistant',
      `Knowledge base ready with ${payload.chunks_indexed} chunks using ${payload.provider || 'local'} embeddings.`,
      payload.index_path ? [payload.index_path] : []
    );
    await refreshAssistantHealth();
  } catch (error) {
    addAssistantMessage('assistant', error.message || 'Unable to initialize the knowledge base.');
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Initialize KB';
    }
  }
}

async function sendAssistantQuery(rawQuery){
  const query = rawQuery.trim();
  if (!query) return;

  addAssistantMessage('user', query);
  setAssistantTyping(true);

  if (!assistantState.backend) await refreshAssistantHealth();

  if (!assistantState.backend) {
    setAssistantTyping(false);
    addAssistantMessage('assistant', 'The backend is offline. Start FastAPI on http://127.0.0.1:8000 and try again.');
    return;
  }

  try {
    const response = await fetch(`${AI_API_BASE}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        session_id: assistantState.sessionId,
        top_k: 4
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.detail || 'Unable to get an answer right now.');
    addAssistantMessage('assistant', payload.answer || "I don't have enough information.", payload.sources || []);
  } catch (error) {
    assistantState.backend = null;
    updateAssistantStatus();
    addAssistantMessage('assistant', error.message || 'Unable to get an answer right now.');
  } finally {
    setAssistantTyping(false);
  }
}

function setChatWidgetOpen(open){
  assistantState.widgetOpen = open;
  document.getElementById('chatWidget').classList.toggle('hidden', !open);
}

function updateHeroStats(){
  const uniqueDomains = new Set(allEvents.flatMap((event) => event.domain || []));
  const registrations = getRegistered().length;

  document.getElementById('heroUpcomingCount').textContent = String(allEvents.length);
  document.getElementById('heroDomainCount').textContent = String(uniqueDomains.size);
  document.getElementById('heroClubCount').textContent = String(allClubs.length);
  document.getElementById('heroRegistrationCount').textContent = String(registrations);
}

// ---------------- BINDINGS ----------------
function bindUiEvents(){
  loginBtn.onclick = () => {
    const name = loginName.value.trim() || 'Guest';
    const role = loginRole.value;
    const session = { name, role, token: `session-${Date.now()}` };

    setSession(session);
    updateIdentity(session);
    applyRoleView(role);
    loginModal.style.display = 'none';
    renderEverything();
    pushNotification(`${name} signed in as ${role}`, { role: 'admin' });
  };

  logoutBtn.onclick = () => {
    clearSession();
    loginModal.style.display = 'flex';
    updateIdentity(null);
    applyRoleView('student');
    renderEverything();
  };

  document.getElementById('submitRequest').onclick = () => {
    const session = getSession();
    if (!session || session.role !== 'organiser') return;

    const action = document.getElementById('requestAction').value;
    const requestedId = Number(document.getElementById('requestId').value);
    const title = document.getElementById('requestTitle').value.trim();
    const type = document.getElementById('requestEventType').value;
    const date = document.getElementById('requestDate').value;
    const domain = document.getElementById('requestDomain').value.split(',').map((value) => value.trim()).filter(Boolean);
    const description = document.getElementById('requestDescription').value.trim();
    const score = Number(document.getElementById('requestScore').value);

    if (!requestedId || !title || !date || !domain.length || !description || Number.isNaN(score)) return;

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
    pushNotification(`New organiser request from ${session.name}`, { role: 'admin' });
    renderOrganiserRequests();
    renderAdminRequests();
  };

  requestActionSelect.onchange = () => {
    if (requestActionSelect.value === 'Add') resetRequestFormForAdd();
  };

  document.getElementById('applyFilters').onclick = () => {
    renderFilteredEvents();
  };

  document.getElementById('applyRecommendation').onclick = () => {
    renderRecommended(getSelectedInterests());
  };

  document.querySelectorAll('.filter-pill').forEach((button) => {
    button.onclick = () => {
      document.getElementById('typeFilter').value = button.dataset.filterType || '';
      renderFilteredEvents();
    };
  });

  document.getElementById('typeFilter').onchange = () => {
    syncFilterUi();
  };

  document.querySelectorAll('.interest').forEach((checkbox) => {
    checkbox.onchange = () => {
      syncFilterUi();
    };
  });

  document.getElementById('scrollAssistant').onclick = () => {
    document.getElementById('assistantSection').scrollIntoView({ behavior: 'smooth' });
  };

  document.getElementById('scrollFilters').onclick = () => {
    document.getElementById('filters').scrollIntoView({ behavior: 'smooth' });
  };

  document.getElementById('scrollCalendar').onclick = () => {
    document.getElementById('calendarSection').scrollIntoView({ behavior: 'smooth' });
  };

  document.getElementById('submitFeedbackBtn').onclick = submitFeedback;
  document.getElementById('exportIcsBtn').onclick = exportRegisteredToIcs;
  document.getElementById('googleCalendarBtn').onclick = openGoogleCalendar;

  const notificationDrawer = document.getElementById('notificationsDrawer');
  document.getElementById('notificationsBtn').onclick = () => {
    notificationDrawer.classList.toggle('hidden');
  };
  document.getElementById('markNotificationsRead').onclick = markAllNotificationsRead;

  document.getElementById('adminCreateEventBtn').onclick = upsertAdminEvent;
  document.getElementById('adminDeleteEventBtn').onclick = deleteAdminEvent;
  document.getElementById('adminResetFormBtn').onclick = clearAdminForm;

  document.getElementById('assistantRefreshBtn').onclick = refreshAssistantHealth;
  document.getElementById('assistantInitBtn').onclick = initializeAssistantKnowledgeBase;
  document.getElementById('assistantForm').onsubmit = async (event) => {
    event.preventDefault();
    const input = document.getElementById('assistantInput');
    const query = input.value;
    input.value = '';
    await sendAssistantQuery(query);
  };

  document.getElementById('chatLauncher').onclick = () => {
    setChatWidgetOpen(!assistantState.widgetOpen);
  };
  document.getElementById('chatClose').onclick = () => {
    setChatWidgetOpen(false);
  };
  document.getElementById('chatForm').onsubmit = async (event) => {
    event.preventDefault();
    const input = document.getElementById('chatInput');
    const query = input.value;
    input.value = '';
    await sendAssistantQuery(query);
  };
}

function renderEverything(){
  renderFilteredEvents();
  renderRecommended(getSelectedInterests());
  renderClubs();
  renderOrganiserRequests();
  renderAdminRequests();
  renderFeedbackEventOptions();
  renderFeedback();
  renderNotifications();
  renderAnalytics();
  syncCalendarEvents();
  updateHeroStats();
  syncFilterUi();
  setRequestAutoId();
}

// ---------------- BOOT ----------------
async function init(){
  seedAssistantMessages();
  await loadEvents();
  await loadClubs();
  initTheme();
  initRealtime();
  bindUiEvents();

  calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
    initialView: 'dayGridMonth',
    height: 640,
    events: buildCalendarEvents(),
    eventClick: (info) => openRegistrationModal(allEvents.find((event) => event.id === Number(info.event.id)))
  });
  calendar.render();

  const existingSession = getSession();
  if (existingSession) {
    updateIdentity(existingSession);
    applyRoleView(existingSession.role);
    loginModal.style.display = 'none';
  } else {
    applyRoleView('student');
    loginModal.style.display = 'flex';
  }

  renderAssistantMessages();
  renderEverything();
  await refreshAssistantHealth();
  setInterval(refreshAssistantHealth, 30000);
}

init();
