/* ============================================================
   CAMINO A PRIMERA — main.js (Versión Blindada y Completa)
   ============================================================ */
'use strict';

let state = {
  profileSetupComplete: false,
  playerName: '', club: '', age: '', position: '', height: '', weight: '', bmi: '', footSide: 'diestro',
  attr1: '', attr2: '',
  history: [],
  objectives: { short: '', mid: '', long: '' },
  targets: { goles: 10, asistencias: 10 }
};

let activeReg = { type: 'Entrenamiento', goles: 0, asistencias: 0 };
let editingLogId = null; 
let activeTargetMetric = null; 

/* HELPERS DE SEGURIDAD (Evitan que la app se rompa si falta un ID) */
function safeGet(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function safeSet(id, value, prop = 'value') {
  const el = document.getElementById(id);
  if (el) el[prop] = value;
}

function safeInner(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

/* INIT */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  loadState();

  const h = document.getElementById('height');
  const w = document.getElementById('weight');
  if (h) h.addEventListener('input', calculateBMI);
  if (w) w.addEventListener('input', calculateBMI);
});

/* LOCAL STORAGE */
function saveState() {
  localStorage.setItem('camino_a_primera_v4', JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem('camino_a_primera_v4');
  if (!saved) return;
  try {
    state = JSON.parse(saved);
    if (!state.targets) state.targets = { goles: 10, asistencias: 10 };
    
    fillProfileInputs();
    
    if (state.profileSetupComplete) {
      const nav = document.getElementById('app-nav');
      if (nav) nav.classList.add('visible');
      showScreen('dashboard');
      updateDashboardUI();
    }
  } catch (e) {
    console.error("Error cargando LocalStorage: ", e);
  }
}

/* NAVEGACIÓN */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`screen-${name}`);
  if (target) target.classList.add('active');
}

function goTo(from, to) {
  showScreen(to);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function navigate(tab) {
  if (!state.profileSetupComplete) return;
  const map = { dash: 'dashboard', stats: 'stats', settings: 'settings' };
  showScreen(map[tab]);

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`nav-${tab}`);
  if (btn) btn.classList.add('active');

  if (tab === 'dash') updateDashboardUI();
  if (tab === 'stats') updateStatsUI();
  if (tab === 'settings') loadSettingsFields();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* IMC */
function calculateBMI() {
  const height = parseFloat(safeGet('height'));
  const weight = parseFloat(safeGet('weight'));

  if (!height || !weight) {
    safeInner('bmi-value', '--');
    safeInner('bmi-status', 'Esperando datos...');
    return;
  }

  const m = height / 100;
  const bmi = (weight / (m * m)).toFixed(1);
  state.bmi = bmi;
  safeInner('bmi-value', bmi);

  let txt = 'Normal';
  if (bmi < 18.5) txt = 'Bajo peso';
  else if (bmi >= 25) txt = 'Peso elevado';
  safeInner('bmi-status', txt);
}

function setFoot(side) {
  state.footSide = side;
  const rBtn = document.getElementById('foot-right');
  const lBtn = document.getElementById('foot-left');
  if (rBtn) rBtn.classList.remove('active');
  if (lBtn) lBtn.classList.remove('active');
  
  const target = document.getElementById(side === 'diestro' ? 'foot-right' : 'foot-left');
  if (target) target.classList.add('active');
}

/* PASO 1: PERFIL */
function validateProfile() {
  const name = safeGet('player-name');
  const clb = safeGet('club-name');
  const age = safeGet('player-age');
  const pos = safeGet('position');
  const h = safeGet('height');
  const w = safeGet('weight');
  const a1 = safeGet('attr-1');
  const a2 = safeGet('attr-2');

  if (!name || !clb || !age || !pos || !h || !w || !a1 || !a2) {
    console.warn("Faltan campos obligatorios en el perfil.");
    return;
  }

  state.playerName = name; state.club = clb; state.age = age; state.position = pos;
  state.height = h; state.weight = w; state.attr1 = a1; state.attr2 = a2;

  saveState();
  showScreen('objectives');
}

function fillProfileInputs() {
  if (!state.playerName) return;
  safeSet('player-name', state.playerName);
  safeSet('club-name', state.club);
  safeSet('player-age', state.age);
  safeSet('position', state.position);
  safeSet('height', state.height);
  safeSet('weight', state.weight);
  safeSet('attr-1', state.attr1);
  safeSet('attr-2', state.attr2);
  setFoot(state.footSide);
  calculateBMI();
}

/* PASO 2: OBJETIVOS INICIALES */
function saveObjectivesAndLaunch() {
  state.objectives.short = safeGet('obj-short');
  state.objectives.mid = safeGet('obj-mid');
  state.objectives.long = safeGet('obj-long');

  if (!state.objectives.short || !state.objectives.mid || !state.objectives.long) return;

  state.profileSetupComplete = true;
  saveState();
  const nav = document.getElementById('app-nav');
  if (nav) nav.classList.add('visible');
  showScreen('dashboard');
  updateDashboardUI();
}

/* INICIO / DASHBOARD */
function updateDashboardUI() {
  safeInner('dash-player-name', state.playerName || 'Jugador');
  safeInner('dash-player-club', `${state.position || 'Posición'} • ${state.club || 'Club'}`);
  safeInner('hero-main-objective', state.objectives.short || 'Sin meta corta fijada');
  
  let tot = { goles: 0, asistencias: 0, partidos: 0, entrenamientos: 0 };
  state.history.forEach(log => {
    if (log.type === 'Partido') { tot.partidos++; tot.goles += log.goles; tot.asistencias += log.asistencias; }
    else if (log.type === 'Entrenamiento') { tot.entrenamientos++; }
  });

  safeInner('num-goles', tot.goles);
  safeInner('num-asistencias', tot.asistencias);
  safeInner('num-partidos', tot.partidos);
  safeInner('num-entrenamientos', tot.entrenamientos);

  safeInner('target-sub-goles', `Meta: ${state.targets.goles}`);
  safeInner('target-sub-asistencias', `Meta: ${state.targets.asistencias}`);

  updateRingProgress('goles', tot.goles, state.targets.goles);
  updateRingProgress('asistencias', tot.asistencias, state.targets.asistencias);

  renderFeed();
}

/* ANILLOS DE PROGRESO SVG (Gris -> Amarillo -> Verde) */
function updateRingProgress(metric, value, target) {
  const ring = document.getElementById(`ring-${metric}`);
  if (!ring) return;
  
  const circumference = 113.09; // 2 * PI * r (r=18)
  let percent = target > 0 ? value / target : 0;
  if (percent > 1) percent = 1;

  const offset = circumference - (percent * circumference);
  ring.style.strokeDashoffset = offset;

  if (percent >= 1) { ring.style.stroke = 'var(--green)'; }
  else if (percent >= 0.5) { ring.style.stroke = 'var(--yellow)'; }
  else { ring.style.stroke = 'var(--muted)'; }
}

/* METAS MODAL */
function openObjectiveModal(metric) {
  activeTargetMetric = metric;
  safeInner('obj-modal-title', `Establecer Meta de ${metric.toUpperCase()}`);
  safeInner('obj-modal-label', `Cantidad total de ${metric} que querés alcanzar:`);
  safeSet('obj-modal-input', state.targets[metric]);
  
  const modal = document.getElementById('objective-modal');
  if (modal) modal.classList.add('show');
}

function saveMetricObjective() {
  const val = parseInt(safeGet('obj-modal-input'));
  if (!val || val <= 0) return;
  state.targets[activeTargetMetric] = val;
  saveState();
  updateDashboardUI();
  closeSheet('objective-modal');
}

/* HISTORIAL / DIARIO ACTIONS */
function openRegisterModal() {
  editingLogId = null;
  activeReg = { type: 'Entrenamiento', goles: 0, asistencias: 0 };
  safeInner('modal-reg-title', "Registrar día");
  
  const toggles = document.getElementById('modal-reg-toggles');
  if (toggles) toggles.style.display = 'flex';
  
  safeInner('reg-val-goles', '0');
  safeInner('reg-val-asistencias', '0');
  safeSet('reg-reflection', '');
  setRegType('Entrenamiento');
  
  const modal = document.getElementById('register-modal');
  if (modal) modal.classList.add('show');
}

function setRegType(type) {
  activeReg.type = type;
  const trBtn = document.getElementById('reg-training');
  const maBtn = document.getElementById('reg-match');
  const fields = document.getElementById('match-fields');

  if (type === 'Partido') {
    if (trBtn) trBtn.classList.remove('active');
    if (maBtn) maBtn.classList.add('active');
    if (fields) fields.style.display = 'block';
  } else {
    if (maBtn) maBtn.classList.remove('active');
    if (trBtn) trBtn.classList.add('active');
    if (fields) fields.style.display = 'none';
  }
}

function adjustRegCounter(field, amt) {
  if (activeReg[field] === undefined) return;
  activeReg[field] = Math.max(0, activeReg[field] + amt);
  safeInner(`reg-val-${field}`, activeReg[field]);
}

function saveDailyLog() {
  const reflection = safeGet('reg-reflection');
  if (!reflection) return;

  if (editingLogId !== null) {
    const idx = state.history.findIndex(l => l.id === editingLogId);
    if (idx !== -1) {
      state.history[idx].goles = activeReg.type === 'Partido' ? activeReg.goles : 0;
      state.history[idx].asistencias = activeReg.type === 'Partido' ? activeReg.asistencias : 0;
      state.history[idx].reflection = reflection;
    }
  } else {
    const d = new Date();
    state.history.unshift({
      id: Date.now(),
      type: activeReg.type,
      goles: activeReg.type === 'Partido' ? activeReg.goles : 0,
      asistencias: activeReg.type === 'Partido' ? activeReg.asistencias : 0,
      reflection: reflection,
      date: `${d.getDate()}/${d.getMonth() + 1}`
    });
    if (activeReg.type === 'Partido' && typeof confetti === 'function') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#34d399', '#8b5cf6', '#ffffff'] });
    }
  }

  saveState();
  updateDashboardUI();
  closeSheet('register-modal');
}

function editLog(id) {
  const log = state.history.find(l => l.id === id);
  if (!log) return;

  editingLogId = id;
  activeReg.type = log.type;
  activeReg.goles = log.goles;
  activeReg.asistencias = log.asistencias;

  safeInner('modal-reg-title', `Editar ${log.type}`);
  const toggles = document.getElementById('modal-reg-toggles');
  if (toggles) toggles.style.display = 'none';
  
  setRegType(log.type);
  safeInner('reg-val-goles', log.goles);
  safeInner('reg-val-asistencias', log.asistencias);
  safeSet('reg-reflection', log.reflection);

  const modal = document.getElementById('register-modal');
  if (modal) modal.classList.add('show');
}

function deleteLog(id) {
  state.history = state.history.filter(l => l.id !== id);
  saveState();
  updateDashboardUI();
}

function renderFeed() {
  const feed = document.getElementById('journal-feed');
  if (!feed) return;
  if (state.history.length === 0) { feed.innerHTML = `<div class="feed-empty">Todavía no registraste días.</div>`; return; }

  let html = '';
  state.history.forEach(log => {
    const isMatch = log.type === 'Partido';
    const border = isMatch ? 'var(--purple)' : 'var(--green)';
    const statsStr = isMatch ? `<span style="color:var(--white); font-weight:700; margin-left:8px;">⚽ ${log.goles} | 👟 ${log.asistencias}</span>` : '';

    html += `
      <div class="feed-card" style="border-left: 4px solid ${border};">
        <div class="feed-card-header">
          <span style="font-size:0.7rem; font-weight:900; color:${border}; letter-spacing:0.05em; text-transform:uppercase;">${log.type} ${statsStr}</span>
          <div class="feed-card-actions">
            <span style="font-size:0.75rem; color:var(--muted); font-weight:700; margin-right:4px;">${log.date}</span>
            <button class="feed-action-btn edit" onclick="editLog(${log.id})"><i data-lucide="edit-3"></i></button>
            <button class="feed-action-btn delete" onclick="deleteLog(${log.id})"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
        <p style="font-size:0.88rem; color:var(--text); line-height:1.4; font-style:italic;">"${log.reflection}"</p>
      </div>
    `;
  });
  feed.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* STATS SCREEN */
function updateStatsUI() {
  let partidos = state.history.filter(l => l.type === 'Partido');
  let totPartidos = partidos.length;
  let goles = 0, asistencias = 0;

  partidos.forEach(p => { goles += p.goles; asistencias += p.asistencias; });

  const avgGoles = totPartidos > 0 ? (goles / totPartidos).toFixed(2) : "0.00";
  const avgAsist = totPartidos > 0 ? (asistencias / totPartidos).toFixed(2) : "0.00";

  safeInner('avg-goles', avgGoles);
  safeInner('avg-asistencias', avgAsist);

  let lastMatches = [...partidos].slice(0, 6).reverse();
  renderBarChart('chart-goles-bars', lastMatches, 'goles', true);
  renderBarChart('chart-asistencias-bars', lastMatches, 'asistencias', false);
}

function renderBarChart(containerId, matches, metric, isGreen) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (matches.length === 0) { container.innerHTML = `<div style="font-size:0.8rem; color:var(--muted); padding:1rem; text-align:center; width:100%;">Registrá partidos para ver la evolución</div>`; return; }

  let maxVal = Math.max(...matches.map(m => m[metric]), 1); 
  let html = '';

  matches.forEach(m => {
    let pct = (m[metric] / maxVal) * 100;
    let barClass = isGreen ? 'chart-bar green-bar' : 'chart-bar';
    html += `
      <div class="chart-column">
        <div class="chart-bar-wrapper">
          <div class="${barClass}" style="height: ${pct}%">
            <span class="chart-val-pop">${m[metric]}</span>
          </div>
        </div>
        <div class="chart-label">${m.date}</div>
      </div>
    `;
  });
  container.innerHTML = html;
}

/* SETTINGS SCREEN */
function loadSettingsFields() {
  safeSet('edit-club', state.club);
  safeSet('edit-age', state.age);
  safeSet('edit-weight', state.weight);
  safeSet('edit-height', state.height);
  safeSet('edit-obj-short', state.objectives.short);
}

function saveSettingsUpdate() {
  const c = safeGet('edit-club');
  const a = safeGet('edit-age');
  const w = safeGet('edit-weight');
  const h = safeGet('edit-height');
  const o = safeGet('edit-obj-short');

  if (!c || !a || !w || !h || !o) return;

  state.club = c; state.age = a; state.weight = w; state.height = h; state.objectives.short = o;
  
  const m = parseFloat(h) / 100;
  state.bmi = (parseFloat(w) / (m * m)).toFixed(1);

  saveState();
  updateDashboardUI();
  showScreen('dashboard');
  
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navDash = document.getElementById('nav-dash');
  if (navDash) navDash.classList.add('active');
}

function closeSheet(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('show');
}
