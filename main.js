/* ============================================================
   CAMINO A PRIMERA — main.js (v1.1)
   ============================================================ */
'use strict';

let state = {
  profileSetupComplete: false,
  playerName: '',
  club: '',
  age: '',
  position: '',
  height: '',
  weight: '',
  footSide: 'diestro',
  attr1: '',
  attr2: '',
  attr3: '',
  objectives: { short: '', mid: '', long: '', reflection: '' },
  history: []
};

let activeReg = { type: 'Entrenamiento', goles: 0, asistencias: 0 };
let editingId = null;

/* INIT */
window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  loadDemoData(); // datos iniciales para probar
  renderAll();
});

/* ====================== DATA ====================== */
function loadDemoData() {
  state.playerName = "Agustín";
  state.club = "Villa Dálmine";
  state.position = "Extremo encarador";
  state.height = "178";
  state.weight = "72";
  state.profileSetupComplete = true;
  state.objectives = {
    short: "Ganar titularidad",
    mid: "Jugar regional",
    long: "Debutar profesionalmente"
  };
}

function saveState() { /* sin localStorage */ }

/* ====================== SCREENS ====================== */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
}

function navigate(tab) {
  const map = { dash: 'dashboard', stats: 'stats', settings: 'settings' };
  showScreen(map[tab]);
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
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
  circle.style.strokeDasharray = "264";
  circle.style.strokeDashoffset = offset;

  if (progress < 40) circle.style.stroke = "#888";
  else if (progress < 80) circle.style.stroke = "#fbbf24";
  else circle.style.stroke = "#34d399";

  text.textContent = Math.round(progress) + "%";
}

function calculateProgress() {
  if (!state.objectives.short) return 0;
  let completed = 0;
  if (state.history.length > 0) completed += 40;
  if (state.objectives.mid) completed += 30;
  if (state.objectives.long) completed += 30;
  return Math.min(100, completed);
}

/* ====================== DASHBOARD ====================== */
function updateDashboard() {
  document.getElementById('dash-player-name').textContent = state.playerName || "Jugador";
  document.getElementById('dash-player-club').textContent = `${state.position} • ${state.club}`;
  updateProgressDonut();
  renderFeed();
}

/* ====================== HISTORIAL (Editar + Borrar) ====================== */
function renderFeed() {
  const feed = document.getElementById('journal-feed');
  feed.innerHTML = '';

  if (state.history.length === 0) {
    feed.innerHTML = `<div class="feed-empty">Todavía no hay registros</div>`;
    return;
  }

  state.history.slice().reverse().forEach(item => {
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
  if (confirm("¿Borrar este registro?")) {
    state.history = state.history.filter(i => i.id !== id);
    renderFeed();
    updateDashboard();
    updateStats();
  }
}

function editRecord(id) {
  const item = state.history.find(i => i.id === id);
  if (!item) return;
  
  editingId = id;
  activeReg = { type: item.type, goles: item.goles || 0, asistencias: item.asistencias || 0 };
  
  document.getElementById('reg-reflection').value = item.reflection;
  openRegisterModal();
}

/* ====================== REGISTER ====================== */
function openRegisterModal() {
  document.getElementById('register-modal').classList.add('show');
  setRegType(activeReg.type || 'Entrenamiento');
}

function saveDailyLog() {
  const reflection = document.getElementById('reg-reflection').value.trim();
  if (!reflection) return showNotification('Escribí una reflexión', 'error');

  const date = new Date();

  if (editingId) {
    const item = state.history.find(i => i.id === editingId);
    if (item) {
      item.type = activeReg.type;
      item.goles = activeReg.goles;
      item.asistencias = activeReg.asistencias;
      item.reflection = reflection;
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

  closeSheet('register-modal');
  renderFeed();
  updateDashboard();
  updateStats();
  showNotification('Guardado correctamente');
}

/* ====================== STATS (Barras) ====================== */
function updateStats() {
  // Implementar gráficos de barras simples con divs
  renderBarChart('goals-bar-chart', 'Goles', state.history.filter(h => h.type === 'Partido').map(h => h.goles || 0));
  renderBarChart('assists-bar-chart', 'Asistencias', state.history.filter(h => h.type === 'Partido').map(h => h.asistencias || 0));
}

function renderBarChart(containerId, label, values) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<div style="color:var(--muted);margin-bottom:8px">${label}</div>`;
  // Simple bar implementation...
}

/* ====================== SETTINGS ====================== */
function saveSettings() {
  state.playerName = document.getElementById('edit-name').value.trim() || state.playerName;
  state.height = document.getElementById('edit-height').value;
  state.weight = document.getElementById('edit-weight').value;
  updateDashboard();
  showNotification('Cambios guardados');
}

function resetAllData() {
  if (confirm("¿Estás seguro? Se borrarán TODOS los datos.")) {
    state.history = [];
    renderAll();
    showNotification('Todo reiniciado', 'error');
  }
}

function renderAll() {
  updateDashboard();
  updateStats();
}

/* ====================== HELPERS ====================== */
function showNotification(text, type = 'success') {
  // toast implementation...
  console.log(text);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function closeSheet(id) {
  document.getElementById(id).classList.remove('show');
}
