/* ============================================================
   CAMINO A PRIMERA — main.js (Versión Optimizada)
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
      // updateStatsUI(); // Descomentar cuando implementes la pantalla de stats
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
  const activeBtn = document.getElementById(`nav-${tab}`);
  if (activeBtn) activeBtn.classList.add('active');

  if (tab === 'dash') updateDashboardUI();
  // if (tab === 'stats') updateStatsUI(); // Descomentar cuando implementes stats
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
  const rightBtn = document.getElementById('foot-right');
  const leftBtn = document.getElementById('foot-left');
  
  if (rightBtn) rightBtn.classList.remove('active');
  if (leftBtn) leftBtn.classList.remove('active');
  
  const targetBtn = document.getElementById(side === 'diestro' ? 'foot-right' : 'foot-left');
  if (targetBtn) targetBtn.classList.add('active');
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
  if (!state.playerName) return;
  
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
  
  // Calcular globales sumando el historial
  let totales = { goles: 0, asistencias: 0, partidos: 0, entrenamientos: 0 };
  state.history.forEach(log => {
    if (log.type === 'Partido') {
      totales.partidos++;
      totales.goles += log.goles || 0;
      totales.asistencias += log.asistencias || 0;
    } else if (log.type === 'Entrenamiento') {
      totales.entrenamientos++;
    }
  });

  // Renderizar contadores en las cajitas del dashboard
  document.getElementById('num-goles').innerText = totales.goles;
  document.getElementById('num-asistencias').innerText = totales.asistencias;
  document.getElementById('num-partidos').innerText = totales.partidos;
  document.getElementById('num-entrenamientos').innerText = totales.entrenamientos;

  renderFeed();
}

/* REGISTER MODAL ACTIONS */
function openRegisterModal() {
  activeReg = { type: 'Entrenamiento', goles: 0, asistencias: 0 };
  
  // Resetear inputs del modal visualmente
  document.getElementById('reg-val-goles').innerText = '0';
  document.getElementById('reg-val-asistencias').innerText = '0';
  document.getElementById('reg-reflection').value = '';
  
  document.getElementById('register-modal').classList.add('show');
  setRegType('Entrenamiento');
}

function setRegType(type) {
  activeReg.type = type;
  
  const trBtn = document.getElementById('reg-training');
  const maBtn = document.getElementById('reg-match');
  const matchFields = document.getElementById('match-fields');

  if (type === 'Partido') {
    if (trBtn) trBtn.classList.remove('active');
    if (maBtn) maBtn.classList.add('active');
    if (matchFields) matchFields.style.display = 'block';
  } else {
    if (maBtn) maBtn.classList.remove('active');
    if (trBtn) trBtn.classList.add('active');
    if (matchFields) matchFields.style.display = 'none';
  }
}

function adjustRegCounter(field, amount) {
  if (activeReg[field] === undefined) return;
  // Math.max evita que el número baje de cero
  activeReg[field] = Math.max(0, activeReg[field] + amount);
  
  const display = document.getElementById(`reg-val-${field}`);
  if (display) display.innerText = activeReg[field];
}

function saveDailyLog() {
  const reflection = document.getElementById('reg-reflection').value.trim();
  if (!reflection) {
    showNotification('Escribí una reflexión.', 'error');
    return;
  }

  const date = new Date();
  state.history.unshift({ // unshift lo agrega al inicio para que el historial sea cronológico inverso
    id: Date.now(),
    type: activeReg.type,
    goles: activeReg.type === 'Partido' ? activeReg.goles : 0,
    asistencias: activeReg.type === 'Partido' ? activeReg.asistencias : 0,
    reflection: reflection,
    date: `${date.getDate()}/${date.getMonth() + 1}`
  });

  // Tirar papelitos si se registra un partido
  if (activeReg.type === 'Partido' && typeof confetti === 'function') {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#34d399', '#8b5cf6', '#ffffff'] });
  }

  saveState();
  updateDashboardUI();
  closeSheet('register-modal');
  showNotification('Registro guardado exitosamente.');
}

function renderFeed() {
  const feed = document.getElementById('journal-feed');
  if (!feed) return;
  
  if (state.history.length === 0) {
    feed.innerHTML = `<div class="feed-empty">Todavía no registraste días.</div>`;
    return;
  }

  // Arma las tarjetas del historial con tus clases y estilos
  let html = '';
  state.history.forEach(log => {
    const isMatch = log.type === 'Partido';
    const badgeColor = isMatch ? 'var(--purple)' : 'var(--green)';
    const statsDetail = isMatch ? `<span style="color:var(--white); font-size:0.8rem; font-weight:700; margin-left:8px;">⚽ ${log.goles} | 👟 ${log.asistencias}</span>` : '';

    html += `
      <div class="mini-stat-card" style="margin-bottom: 0.75rem; background: rgba(255,255,255,0.02); border-left: 4px solid ${badgeColor}; padding: 1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <span style="font-size:0.7rem; font-weight:900; color:${badgeColor}; letter-spacing:0.05em; text-transform:uppercase;">${log.type} ${statsDetail}</span>
          <span style="font-size:0.75rem; color:var(--muted); font-weight:700;">${log.date}</span>
        </div>
        <p style="font-size:0.88rem; color:var(--text); line-height:1.4; font-style:italic;">"${log.reflection}"</p>
      </div>
    `;
  });
  
  feed.innerHTML = html;
}

/* HELPERS */
function showNotification(text, type = 'success') {
  console.log(`[${type.toUpperCase()}] ${text}`);
  // Aquí podrías enlazarlo a tu contenedor HTML de toasts si querés que aparezca flotando en la pantalla
}

function closeRegisterModal() {
  closeSheet('register-modal');
}

function closeSheet(id) {
  document.getElementById(id).classList.remove('show');
}

console.log("%c✅ Camino a Primera cargado correctamente", "color:#34d399;font-weight:bold");
