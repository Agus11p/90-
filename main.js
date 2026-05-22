/* ============================================================
   CAMINO A PRIMERA — main.js
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
  bmi: '',
  footSide: 'diestro',
  attr1: '',
  attr2: '',
  attr3: '',
  history: [],
  objectives: {
    short: '',
    mid: '',
    long: '',
    reflection: ''
  }
};

let activeReg = {
  type: 'Entrenamiento',
  goles: 0,
  asistencias: 0
};

/* INIT */
window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  loadState();

  const height = document.getElementById('height');
  const weight = document.getElementById('weight');
  if (height) height.addEventListener('input', calculateBMI);
  if (weight) weight.addEventListener('input', calculateBMI);
});

/* STORAGE */
function saveState() {
  localStorage.setItem('camino_a_primera_v3', JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem('camino_a_primera_v3');
  if (!saved) return;
  
  try {
    state = JSON.parse(saved);
    fillProfileData();
    if (state.profileSetupComplete) {
      document.getElementById('app-nav').classList.add('visible');
      showScreen('dashboard');
      updateDashboardUI();
      updateStatsUI();
    }
  } catch (e) {
    console.error(e);
  }
}

/* SCREENS */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  const target = document.getElementById(`screen-${name}`);
  if (target) target.classList.add('active');
}

function goTo(from, to) {
  showScreen(to);
  lucide.createIcons();
}

function navigate(tab) {
  if (!state.profileSetupComplete) return;
  
  const map = { dash: 'dashboard', stats: 'stats', settings: 'settings' };
  showScreen(map[tab]);

  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`nav-${tab}`).classList.add('active');

  if (tab === 'dash') updateDashboardUI();
  if (tab === 'stats') updateStatsUI();
}

/* BMI */
function calculateBMI() {
  const h = document.getElementById('height');
  const w = document.getElementById('weight');
  const val = document.getElementById('bmi-value');
  const status = document.getElementById('bmi-status');

  if (!h || !w || !val || !status) return;

  const height = parseFloat(h.value);
  const weight = parseFloat(w.value);

  if (!height || !weight) {
    val.innerText = '--';
    status.innerText = 'Esperando datos...';
    return;
  }

  const meters = height / 100;
  const bmi = (weight / (meters * meters)).toFixed(1);
  state.bmi = bmi;
  val.innerText = bmi;

  let label = 'Normal';
  if (bmi < 18.5) label = 'Bajo peso';
  else if (bmi >= 25) label = 'Peso elevado';
  status.innerText = label;
}

/* PROFILE */
function setFoot(side) {
  state.footSide = side;
  document.getElementById('foot-right').classList.remove('active');
  document.getElementById('foot-left').classList.remove('active');
  document.getElementById(side === 'diestro' ? 'foot-right' : 'foot-left').classList.add('active');
}

function validateProfile() {
  const playerName = document.getElementById('player-name').value.trim();
  const club = document.getElementById('club-name').value.trim();
  const age = document.getElementById('player-age').value.trim();
  const position = document.getElementById('position').value;
  const height = document.getElementById('height').value;
  const weight = document.getElementById('weight').value;
  const attr1 = document.getElementById('attr-1').value;
  const attr2 = document.getElementById('attr-2').value;

  if (!playerName || !club || !age || !position || !height || !weight || !attr1 || !attr2) {
    showNotification('Completá todos los datos obligatorios.', 'error');
    return;
  }

  state.playerName = playerName;
  state.club = club;
  state.age = age;
  state.position = position;
  state.height = height;
  state.weight = weight;
  state.attr1 = attr1;
  state.attr2 = attr2;
  state.attr3 = document.getElementById('attr-3').value || '—';

  saveState();
  showScreen('objectives');
  showNotification('Perfil guardado.');
}

function fillProfileData() {
  // ... (rellena campos)
  document.getElementById('player-name').value = state.playerName;
  document.getElementById('club-name').value = state.club;
  document.getElementById('player-age').value = state.age;
  document.getElementById('position').value = state.position;
  document.getElementById('height').value = state.height;
  document.getElementById('weight').value = state.weight;
  document.getElementById('attr-1').value = state.attr1;
  document.getElementById('attr-2').value = state.attr2;
  document.getElementById('attr-3').value = state.attr3;
  setFoot(state.footSide);
  calculateBMI();
}

/* OBJECTIVES */
function saveObjectivesAndLaunch() {
  state.objectives.short = document.getElementById('obj-short').value.trim();
  state.objectives.mid = document.getElementById('obj-mid').value.trim();
  state.objectives.long = document.getElementById('obj-long').value.trim();

  if (!state.objectives.short || !state.objectives.mid || !state.objectives.long) {
    showNotification('Completá todos los objetivos.', 'error');
    return;
  }

  state.profileSetupComplete = true;
  saveState();
  document.getElementById('app-nav').classList.add('visible');
  showScreen('dashboard');
  updateDashboardUI();
  showNotification('Perfil completado.');
}

/* DASHBOARD */
function updateDashboardUI() {
  document.getElementById('dash-player-name').innerText = state.playerName || 'Jugador';
  document.getElementById('dash-player-club').innerText = `${state.position} • ${state.club}`;
  document.getElementById('hero-main-objective').innerText = state.objectives.short || 'Convertirte en profesional.';
  renderFeed();
}

/* REGISTER */
function openRegisterModal() {
  activeReg = { type: 'Entrenamiento', goles: 0, asistencias: 0 };
  document.getElementById('register-modal').classList.add('show');
  setRegType('Entrenamiento');
}

function saveDailyLog() {
  const reflection = document.getElementById('reg-reflection').value.trim();
  if (!reflection) {
    showNotification('Escribí una reflexión.', 'error');
    return;
  }

  const date = new Date();
  state.history.push({
    id: Date.now(),
    type: activeReg.type,
    goles: activeReg.goles,
    asistencias: activeReg.asistencias,
    reflection: reflection,
    date: `${date.getDate()}/${date.getMonth()+1}`
  });

  saveState();
  updateDashboardUI();
  closeSheet('register-modal');
  showNotification('Registro guardado.');
}

function renderFeed() {
  const feed = document.getElementById('journal-feed');
  if (!feed) return;
  feed.innerHTML = state.history.length === 0 ? `<div class="feed-empty">Todavía no registraste días.</div>` : 'Historial...';
}

/* HELPERS */
function showNotification(text, type = 'success') {
  console.log(`[${type}] ${text}`);
}

function setRegType(type) {
  activeReg.type = type;
  // toggle buttons...
}

function closeSheet(id) {
  document.getElementById(id).classList.remove('show');
}

console.log("%c✅ Camino a Primera cargado correctamente", "color:#34d399;font-weight:bold");
