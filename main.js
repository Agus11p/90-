/* ============================================================
   CAMINO A PRIMERA — main.js
   ============================================================ */
'use strict';

/* ============================================================
   STATE
   ============================================================ */
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
  goals: {
    goles: 10,
    asistencias: 5,
    partidos: 20,
    entrenamientos: 10
  },
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

/* ============================================================
   INIT
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  loadState();

  const height = document.getElementById('height');
  const weight = document.getElementById('weight');
  if (height) height.addEventListener('input', calculateBMI);
  if (weight) weight.addEventListener('input', calculateBMI);
});

/* ============================================================
   STORAGE
   ============================================================ */
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
      document.getElementById('app-nav')?.classList.add('visible');
      showScreen('dashboard');
      updateDashboardUI();
      updateStatsUI();
    }
  } catch (err) {
    console.error(err);
  }
}

/* ============================================================
   SCREEN CONTROL
   ============================================================ */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  const target = document.getElementById(`screen-${name}`);
  if (target) target.classList.add('active');
}

function goTo(from, to) {
  showScreen(to);
  if (window.lucide) lucide.createIcons();
}

function navigate(tab) {
  if (!state.profileSetupComplete) return;

  const map = {
    dash: 'dashboard',
    stats: 'stats',
    settings: 'settings'
  };

  showScreen(map[tab]);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`nav-${tab}`)?.classList.add('active');

  if (tab === 'dash') updateDashboardUI();
  if (tab === 'stats') updateStatsUI();
}

/* ============================================================
   BMI
   ============================================================ */
function calculateBMI() {
  const heightInput = document.getElementById('height');
  const weightInput = document.getElementById('weight');
  const bmiValue = document.getElementById('bmi-value');
  const bmiStatus = document.getElementById('bmi-status');

  if (!heightInput || !weightInput || !bmiValue || !bmiStatus) return;

  const height = parseFloat(heightInput.value);
  const weight = parseFloat(weightInput.value);

  if (!height || !weight) {
    bmiValue.innerText = '--';
    bmiStatus.innerText = 'Esperando datos...';
    return;
  }

  const meters = height / 100;
  const bmi = (weight / (meters * meters)).toFixed(1);
  state.bmi = bmi;
  bmiValue.innerText = bmi;

  let label = 'Normal';
  if (bmi < 18.5) label = 'Bajo peso';
  else if (bmi >= 25) label = 'Peso elevado';

  bmiStatus.innerText = label;
}

/* ============================================================
   PROFILE
   ============================================================ */
function setFoot(side) {
  state.footSide = side;
  document.getElementById('foot-right')?.classList.remove('active');
  document.getElementById('foot-left')?.classList.remove('active');

  if (side === 'diestro') {
    document.getElementById('foot-right')?.classList.add('active');
  } else {
    document.getElementById('foot-left')?.classList.add('active');
  }
}

function validateProfile() {
  const playerName = document.getElementById('player-name')?.value.trim();
  const club = document.getElementById('club-name')?.value.trim();
  const age = document.getElementById('player-age')?.value.trim();
  const position = document.getElementById('position')?.value;
  const height = document.getElementById('height')?.value;
  const weight = document.getElementById('weight')?.value;
  const attr1 = document.getElementById('attr-1')?.value;
  const attr2 = document.getElementById('attr-2')?.value;
  const attr3 = document.getElementById('attr-3')?.value;

  if (!playerName || !club || !age || !position || !height || !weight || !attr1 || !attr2) {
    showNotification('Completá todos los datos obligatorios.', 'error');
    return;
  }

  if (attr1 === attr2 || (attr3 && attr1 === attr3) || (attr3 && attr2 === attr3)) {
    showNotification('No repitas habilidades.', 'error');
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
  state.attr3 = attr3 || '—';

  saveState();
  showScreen('objectives');
  showNotification('Perfil guardado.');
}

function fillProfileData() {
  const ids = {
    'player-name': state.playerName,
    'club-name': state.club,
    'player-age': state.age,
    'height': state.height,
    'weight': state.weight,
    'attr-1': state.attr1,
    'attr-2': state.attr2,
    'attr-3': state.attr3
  };

  Object.keys(ids).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = ids[id];
  });

  const position = document.getElementById('position');
  if (position) position.value = state.position;

  setFoot(state.footSide || 'diestro');
  calculateBMI();
}

/* ============================================================
   OBJECTIVES
   ============================================================ */
function saveObjectivesAndLaunch() {
  const short = document.getElementById('obj-short')?.value.trim();
  const mid = document.getElementById('obj-mid')?.value.trim();
  const long = document.getElementById('obj-long')?.value.trim();
  const reflection = document.getElementById('reflection-general')?.value.trim();

  if (!short || !mid || !long || !reflection) {
    showNotification('Completá todos los objetivos.', 'error');
    return;
  }

  state.objectives = { short, mid, long, reflection };
  state.profileSetupComplete = true;

  saveState();
  document.getElementById('app-nav')?.classList.add('visible');
  updateDashboardUI();
  updateStatsUI();
  showScreen('dashboard');
  showNotification('Perfil completado.');
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function updateDashboardUI() {
  document.getElementById('dash-player-name').innerText = state.playerName || 'Jugador';
  document.getElementById('dash-player-club').innerText = `${state.position} • ${state.club || 'Club'}`;
  document.getElementById('hero-main-objective').innerText = state.objectives.short || 'Convertirte en profesional.';

  const progress = recalculateProgress();
  setText('num-goles', progress.goles);
  setText('num-asistencias', progress.asistencias);
  setText('num-partidos', progress.partidos);
  setText('num-entrenamientos', progress.entrenamientos);

  renderFeed();
}

function recalculateProgress() {
  const result = { goles: 0, asistencias: 0, partidos: 0, entrenamientos: 0 };

  state.history.forEach(item => {
    if (item.type === 'Partido') {
      result.goles += Number(item.goles || 0);
      result.asistencias += Number(item.asistencias || 0);
      result.partidos += 1;
    } else {
      result.entrenamientos += 1;
    }
  });
  return result;
}

/* ============================================================
   REGISTER MODAL
   ============================================================ */
function openRegisterModal() {
  activeReg = { type: 'Entrenamiento', goles: 0, asistencias: 0 };
  document.getElementById('register-modal')?.classList.add('show');
  setRegType('Entrenamiento');
  setText('reg-val-goles', 0);
  setText('reg-val-asistencias', 0);
  document.getElementById('reg-reflection').value = '';
}

function closeRegisterModal(e = null) {
  if (!e || e.target.id === 'register-modal') {
    document.getElementById('register-modal')?.classList.remove('show');
  }
}

function closeSheet(id) {
  document.getElementById(id)?.classList.remove('show');
}

function setRegType(type) {
  activeReg.type = type;
  const training = document.getElementById('reg-training');
  const match = document.getElementById('reg-match');
  const matchFields = document.getElementById('match-fields');

  training?.classList.remove('active');
  match?.classList.remove('active');

  if (type === 'Entrenamiento') {
    training?.classList.add('active');
    if (matchFields) matchFields.style.display = 'none';
  } else {
    match?.classList.add('active');
    if (matchFields) matchFields.style.display = 'block';
  }
}

function adjustRegCounter(type, amount) {
  if (type === 'goles') {
    activeReg.goles = Math.max(0, activeReg.goles + amount);
    setText('reg-val-goles', activeReg.goles);
  }
  if (type === 'asistencias') {
    activeReg.asistencias = Math.max(0, activeReg.asistencias + amount);
    setText('reg-val-asistencias', activeReg.asistencias);
  }
}

function saveDailyLog() {
  const reflection = document.getElementById('reg-reflection')?.value.trim();
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
    reflection,
    date: `${date.getDate()}/${date.getMonth() + 1}`
  });

  saveState();
  updateDashboardUI();
  updateStatsUI();
  closeSheet('register-modal');
  showNotification('Registro guardado.');
}

/* ============================================================
   FEED
   ============================================================ */
function renderFeed() {
  const feed = document.getElementById('journal-feed');
  if (!feed) return;

  if (state.history.length === 0) {
    feed.innerHTML = `<div class="feed-empty">Todavía no registraste días.</div>`;
    return;
  }

  feed.innerHTML = '';
  [...state.history].reverse().forEach(item => {
    const card = document.createElement('div');
    card.className = 'feed-card';
    card.innerHTML = `
      <div class="feed-card-header">
        <span class="feed-card-type ${item.type === 'Partido' ? 'match' : 'training'}">
          ${item.type}
        </span>
        <span class="feed-card-date">${item.date}</span>
      </div>
      ${item.type === 'Partido' ? `
      <div class="feed-card-stats">
        <span class="stat-pill green">⚽ ${item.goles}</span>
        <span class="stat-pill purple">🎯 ${item.asistencias}</span>
      </div>` : ''}
      <p class="feed-card-reflection">"${item.reflection}"</p>
    `;
    feed.appendChild(card);
  });
}

/* ============================================================
   STATS
   ============================================================ */
function updateStatsUI() {
  const progress = recalculateProgress();
  setText('total-goles', progress.goles);
  setText('total-asistencias', progress.asistencias);
  setText('stat-attr-1', state.attr1 || '-');
  setText('stat-attr-2', state.attr2 || '-');
  setText('stat-attr-3', state.attr3 || '-');

  renderPerformanceChart();
}

function renderPerformanceChart() {
  const container = document.getElementById('chart-container');
  if (!container) return;

  const matches = state.history.filter(item => item.type === 'Partido');
  if (matches.length === 0) {
    container.innerHTML = `<div style="color:#777; font-size:.8rem; padding-top:1rem;">Sin datos todavía.</div>`;
    return;
  }

  // ... (el resto del código del chart se mantiene igual)
  const goals = matches.map(item => Number(item.goles));
  const max = Math.max(...goals, 1);
  const width = 320;
  const height = 140;
  const padding = 20;
  const step = goals.length > 1 ? (width - padding * 2) / (goals.length - 1) : 0;

  const points = goals.map((goal, index) => ({
    x: padding + index * step,
    y: height - padding - ((goal / max) * (height - padding * 2))
  }));

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <path d="${path}" fill="none" stroke="#34d399" stroke-width="4" stroke-linecap="round"/>
      ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#34d399"/>`).join('')}
    </svg>
  `;
}

/* ============================================================
   TOAST / NOTIFICATION
   ============================================================ */
function showNotification(text, type = 'success') {
  const toast = document.getElementById('toast-container');
  const toastText = document.getElementById('toast-text');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast || !toastText || !toastIcon) return;

  toastText.innerText = text;

  if (type === 'error') {
    toastIcon.innerHTML = `<i data-lucide="circle-alert" style="color:#ef4444;"></i>`;
  } else {
    toastIcon.innerHTML = `<i data-lucide="badge-check" style="color:#34d399;"></i>`;
  }

  if (window.lucide) lucide.createIcons();

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ============================================================
   HELPERS
   ============================================================ */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}
