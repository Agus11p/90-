/* ============================================================
   CAMINO A PRIMERA — main.js (v1.1)
   ============================================================ */
'use strict';

let state = {
  profileSetupComplete: true,
  playerName: "Agustín",
  club: "Villa Dálmine",
  position: "Extremo encarador",
  height: "178",
  weight: "72",
  objectives: {
    short: "Ganar titularidad",
    mid: "Jugar regional",
    long: "Debutar profesionalmente"
  },
  history: []
};

let activeReg = { type: 'Entrenamiento', goles: 0, asistencias: 0 };
let editingId = null;

/* INIT */
window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  renderAll();
});

/* ====================== NAV & SCREENS ====================== */
function goTo(from, to) {
  showScreen(to);
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  const target = document.getElementById(`screen-${name}`);
  if (target) target.classList.add('active');
}

function navigate(tab) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`nav-${tab}`).classList.add('active');
  
  if (tab === 'dash') updateDashboard();
  if (tab === 'stats') updateStats();
}

/* ====================== PROGRESS DONUT ====================== */
function updateProgressDonut() {
  const progress = calculateProgress();
  const circle = document.getElementById('progress-circle');
  const text = document.getElementById('progress-text');

  const offset = 264 - (264 * progress / 100);
  circle.setAttribute('stroke-dashoffset', offset);

  if (progress < 40) circle.setAttribute('stroke', '#888888');
  else if (progress < 80) circle.setAttribute('stroke', '#fbbf24');
  else circle.setAttribute('stroke', '#34d399');

  text.textContent = Math.round(progress) + "%";
}

function calculateProgress() {
  let score = 0;
  if (state.history.length >= 3) score += 40;
  if (state.objectives.short) score += 20;
  if (state.objectives.mid) score += 20;
  if (state.objectives.long) score += 20;
  return Math.min(100, score);
}

/* ====================== DASHBOARD ====================== */
function updateDashboard() {
  document.getElementById('dash-player-name').textContent = state.playerName || "Jugador";
  updateProgressDonut();
  renderFeed();
}

/* ====================== HISTORIAL ====================== */
function renderFeed() {
  const feed = document.getElementById('journal-feed');
  feed.innerHTML = '';

  if (state.history.length === 0) {
    feed.innerHTML = `<div class="feed-empty">Todavía no registraste nada</div>`;
    return;
  }

  [...state.history].reverse().forEach(item => {
    const card = document.createElement('div');
    card.className = 'feed-card';
    card.innerHTML = `
      <div class="feed-card-header">
        <span class="feed-card-type ${item.type === 'Partido' ? 'match' : 'training'}">${item.type}</span>
        <span class="feed-card-date">${item.date}</span>
      </div>
      ${item.type === 'Partido' ? `
      <div class="feed-card-stats">
        <span class="stat-pill green">⚽ ${item.goles}</span>
        <span class="stat-pill purple">🎯 ${item.asistencias}</span>
      </div>` : ''}
      <p class="feed-card-reflection">"${item.reflection}"</p>
      
      <button class="edit-btn" onclick="editRecord(${item.id})">✏️</button>
      <button class="delete-btn" onclick="deleteRecord(${item.id})">🗑</button>
    `;
    feed.appendChild(card);
  });
}

function deleteRecord(id) {
  if (confirm("¿Eliminar este registro?")) {
    state.history = state.history.filter(i => i.id !== id);
    renderFeed();
    updateProgressDonut();
  }
}

function editRecord(id) {
  const record = state.history.find(r => r.id === id);
  if (!record) return;

  editingId = id;
  activeReg.type = record.type;
  activeReg.goles = record.goles || 0;
  activeReg.asistencias = record.asistencias || 0;

  openRegisterModal();
  document.getElementById('reg-reflection').value = record.reflection || '';
}

/* ====================== REGISTER MODAL ====================== */
function openRegisterModal() {
  document.getElementById('register-modal').classList.add('show');
  setRegType(activeReg.type);
}

function closeRegisterModal(e) {
  if (!e || e.target.id === 'register-modal') {
    document.getElementById('register-modal').classList.remove('show');
    editingId = null;
  }
}

function setRegType(type) {
  activeReg.type = type;
  // toggle buttons logic...
}

function saveDailyLog() {
  const reflection = document.getElementById('reg-reflection').value.trim();
  if (!reflection) {
    showNotification("Escribí una reflexión", "error");
    return;
  }

  const date = new Date();

  if (editingId) {
    const item = state.history.find(i => i.id === editingId);
    if (item) {
      item.reflection = reflection;
      item.type = activeReg.type;
      item.goles = activeReg.goles;
      item.asistencias = activeReg.asistencias;
    }
    editingId = null;
  } else {
    state.history.push({
      id: Date.now(),
      type: activeReg.type,
      goles: activeReg.goles,
      asistencias: activeReg.asistencias,
      reflection: reflection,
      date: `${date.getDate()}/${date.getMonth()+1}`
    });
  }

  document.getElementById('register-modal').classList.remove('show');
  renderFeed();
  updateProgressDonut();
  showNotification("Registro guardado");
}

/* ====================== NOTIFICATION ====================== */
function showNotification(text, type = "success") {
  console.log(`[${type.toUpperCase()}] ${text}`);
  // Podés mejorar el toast después
}

/* ====================== HELPERS ====================== */
function renderAll() {
  updateDashboard();
}

console.log("%c✅ Camino a Primera v1.1 cargado correctamente", "color:#34d399;font-weight:bold");
