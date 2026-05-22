/* ============================================================
   CAMINO A PRIMERA — main.js (Sistema Completo y Automatizado)
   ============================================================ */
'use strict';

let state = {
  profileSetupComplete: false,
  playerName: '', club: '', age: '', position: '', height: '', weight: '', bmi: '', footSide: 'diestro',
  attr1: '', attr2: '',
  history: [],
  objectives: { short: '', mid: '', long: '' },
  targets: { goles: 10, asistencias: 10 } // Valores base iniciales
};

let activeReg = { type: 'Entrenamiento', goles: 0, asistencias: 0 };
let editingLogId = null; // Controla si guardamos un registro nuevo o editamos uno viejo
let activeTargetMetric = null; // Controla cuál meta se está editando en el modal

window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  loadState();

  const h = document.getElementById('height');
  const w = document.getElementById('weight');
  if (h) h.addEventListener('input', calculateBMI);
  if (w) w.addEventListener('input', calculateBMI);
});

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
      document.getElementById('app-nav').classList.add('visible');
      showScreen('dashboard');
      updateDashboardUI();
    }
  } catch (e) {
    console.error("Error cargando LocalStorage: ", e);
  }
}

/* NAVEGACIÓN Y MONTAJE */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
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

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`nav-${tab}`);
  if (btn) btn.classList.add('active');

  if (tab === 'dash') updateDashboardUI();
  if (tab === 'stats') updateStatsUI();
  if (tab === 'settings') loadSettingsFields();
  lucide.createIcons();
}

/* CÁLCULO DE IMC */
function calculateBMI() {
  const h = document.getElementById('height');
  const w = document.getElementById('weight');
  const val = document.getElementById('bmi-value');
  const status = document.getElementById('bmi-status');
  if (!h || !w || !val || !status) return;

  const height = parseFloat(h.value);
  const weight = parseFloat(w.value);
  if (!height || !weight) { val.innerText = '--'; status.innerText = 'Esperando datos...'; return; }

  const m = height / 100;
  const bmi = (weight / (m * m)).toFixed(1);
  state.bmi = bmi;
  val.innerText = bmi;

  let txt = 'Normal';
  if (bmi < 18.5) txt = 'Bajo peso';
  else if (bmi >= 25) txt = 'Peso elevado';
  status.innerText = txt;
}

function setFoot(side) {
  state.footSide = side;
  document.getElementById('foot-right').classList.remove('active');
  document.getElementById('foot-left').classList.remove('active');
  document.getElementById(side === 'diestro' ? 'foot-right' : 'foot-left').classList.add('active');
}

/* PASOS INICIALES */
function validateProfile() {
  const name = document.getElementById('player-name').value.trim();
  const clb = document.getElementById('club-name').value.trim();
  const age = document.getElementById('player-age').value.trim();
  const pos = document.getElementById('position').value;
  const h = document.getElementById('height').value;
  const w = document.getElementById('weight').value;
  const a1 = document.getElementById('attr-1').value;
  const a2 = document.getElementById('attr-2').value;

  if (!name || !clb || !age || !pos || !h || !w || !a1 || !a2) return;

  state.playerName = name; state.club = clb; state.age = age; state.position = pos;
  state.height = h; state.weight = w; state.attr1 = a1; state.attr2 = a2;

  saveState();
  showScreen('objectives');
}

function saveObjectivesAndLaunch() {
  state.objectives.short = document.getElementById('obj-short').value.trim();
  state.objectives.mid = document.getElementById('obj-mid').value.trim();
  state.objectives.long = document.getElementById('obj-long').value.trim();

  if (!state.objectives.short || !state.objectives.mid || !state.objectives.long) return;

  state.profileSetupComplete = true;
  saveState();
  document.getElementById('app-nav').classList.add('visible');
  showScreen('dashboard');
  updateDashboardUI();
}

function fillProfileInputs() {
  if (!state.playerName) return;
  document.getElementById('player-name').value = state.playerName;
  document.getElementById('club-name').value = state.club;
  document.getElementById('player-age').value = state.age;
  document.getElementById('position').value = state.position;
  document.getElementById('height').value = state.height;
  document.getElementById('weight').value = state.weight;
  document.getElementById('attr-1').value = state.attr1;
  document.getElementById('attr-2').value = state.attr2;
  setFoot(state.footSide);
  calculateBMI();
}

/* INTERFAZ DEL DASHBOARD */
function updateDashboardUI() {
  document.getElementById('dash-player-name').innerText = state.playerName || 'Jugador';
  document.getElementById('dash-player-club').innerText = `${state.position} • ${state.club}`;
  document.getElementById('hero-main-objective').innerText = state.objectives.short || 'Sin meta corta fijada';
  
  let tot = { goles: 0, asistencias: 0, partidos: 0, entrenamientos: 0 };
  state.history.forEach(log => {
    if (log.type === 'Partido') { tot.partidos++; tot.goles += log.goles; tot.asistencias += log.asistencias; }
    else if (log.type === 'Entrenamiento') { tot.entrenamientos++; }
  });

  document.getElementById('num-goles').innerText = tot.goles;
  document.getElementById('num-asistencias').innerText = tot.asistencias;
  document.getElementById('num-partidos').innerText = tot.partidos;
  document.getElementById('num-entrenamientos').innerText = tot.entrenamientos;

  document.getElementById('target-sub-goles').innerText = `Meta: ${state.targets.goles}`;
  document.getElementById('target-sub-asistencias').innerText = `Meta: ${state.targets.asistencias}`;

  updateRingProgress('goles', tot.goles, state.targets.goles);
  updateRingProgress('asistencias', tot.asistencias, state.targets.asistencias);

  renderFeed();
}

/* GESTIÓN DE ANILLOS DE PROGRESO (SVG) */
function updateRingProgress(metric, value, target) {
  const ring = document.getElementById(`ring-${metric}`);
  if (!ring) return;
  
  const circumference = 2 * Math.PI * 18; // Radio = 18 => 113.09
  let percent = target > 0 ? value / target : 0;
  if (percent > 1) percent = 1;

  const offset = circumference - (percent * circumference);
  ring.style.strokeDashoffset = offset;

  // Cambiar color por tramos porcentuales
  if (percent >= 1) { ring.style.stroke = 'var(--green)'; }
  else if (percent >= 0.5) { ring.style.stroke = 'var(--yellow)'; }
  else { ring.style.stroke = 'var(--muted)'; }
}

/* MODAL DE METAS INDIVIDUALES */
function openObjectiveModal(metric) {
  activeTargetMetric = metric;
  document.getElementById('obj-modal-title').innerText = `Establecer Meta de ${metric.toUpperCase()}`;
  document.getElementById('obj-modal-label').innerText = `Cantidad total de ${metric} que querés alcanzar:`;
  document.getElementById('obj-modal-input').value = state.targets[metric];
  document.getElementById('objective-modal').classList.add('show');
}

function saveMetricObjective() {
  const val = parseInt(document.getElementById('obj-modal-input').value);
  if (!val || val <= 0) return;
  state.targets[activeTargetMetric] = val;
  saveState();
  updateDashboardUI();
  closeSheet('objective-modal');
}

/* REGISTROS DEL DIARIO (NUEVOS, MODIFICACIONES Y ELIMINACIONES) */
function openRegisterModal() {
  editingLogId = null;
  activeReg = { type: 'Entrenamiento', goles: 0, asistencias: 0 };
  document.getElementById('modal-reg-title').innerText = "Registrar día";
  document.getElementById('modal-reg-toggles').style.display = 'flex';
  document.getElementById('reg-val-goles').innerText = '0';
  document.getElementById('reg-val-asistencias').innerText = '0';
  document.getElementById('reg-reflection').value = '';
  setRegType('Entrenamiento');
  document.getElementById('register-modal').classList.add('show');
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
  const disp = document.getElementById(`reg-val-${field}`);
  if (disp) disp.innerText = activeReg[field];
}

function saveDailyLog() {
  const reflection = document.getElementById('reg-reflection').value.trim();
  if (!reflection) return;

  if (editingLogId !== null) {
    // Modo Edición: Buscamos el elemento existente y lo sobreescribimos
    const index = state.history.findIndex(l => l.id === editingLogId);
    if (index !== -1) {
      state.history[index].goles = activeReg.type === 'Partido' ? activeReg.goles : 0;
      state.history[index].asistencias = activeReg.type === 'Partido' ? activeReg.asistencias : 0;
      state.history[index].reflection = reflection;
    }
  } else {
    // Modo Nuevo: Agregamos registro cronológico inverso
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

  document.getElementById('modal-reg-title').innerText = `Editar ${log.type}`;
  document.getElementById('modal-reg-toggles').style.display = 'none'; // No se puede cambiar el tipo en edición
  
  setRegType(log.type);
  document.getElementById('reg-val-goles').innerText = log.goles;
  document.getElementById('reg-val-asistencias').innerText = log.asistencias;
  document.getElementById('reg-reflection').value = log.reflection;

  document.getElementById('register-modal').classList.add('show');
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
  lucide.createIcons();
}

/* SECCIÓN STATS (PROMEDIOS Y RENDIMIENTO) */
function updateStatsUI() {
  let partidos = state.history.filter(l => l.type === 'Partido');
  let totPartidos = partidos.length;
  let goles = 0, asistencias = 0;

  partidos.forEach(p => { goles += p.goles; asistencias += p.asistencias; });

  const avgGoles = totPartidos > 0 ? (goles / totPartidos).toFixed(2) : "0.00";
  const avgAsist = totPartidos > 0 ? (asistencias / totPartidos).toFixed(2) : "0.00";

  document.getElementById('avg-goles').innerText = avgGoles;
  document.getElementById('avg-asistencias').innerText = avgAsist;

  // Renderizar gráficos de barras usando los últimos 6 partidos (de más viejo a más nuevo)
  let lastMatches = [...partidos].slice(0, 6).reverse();
  
  renderBarChart('chart-goles-bars', lastMatches, 'goles', true);
  renderBarChart('chart-asistencias-bars', lastMatches, 'asistencias', false);
}

function renderBarChart(containerId, matches, metric, isGreen) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (matches.length === 0) { container.innerHTML = `<div style="font-size:0.8rem; color:var(--muted); padding:1rem; text-align:center; width:100%;">Registrá partidos para ver la evolución</div>`; return; }

  let maxVal = Math.max(...matches.map(m => m[metric]), 1); // Evita división por cero si es todo 0
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

/* SECCIÓN AJUSTES (FORMULARIO E INTERFAZ) */
function loadSettingsFields() {
  document.getElementById('edit-club').value = state.club;
  document.getElementById('edit-age').value = state.age;
  document.getElementById('edit-weight').value = state.weight;
  document.getElementById('edit-height').value = state.height;
  document.getElementById('edit-obj-short').value = state.objectives.short;
}

function saveSettingsUpdate() {
  const c = document.getElementById('edit-club').value.trim();
  const a = document.getElementById('edit-age').value.trim();
  const w = document.getElementById('edit-weight').value.trim();
  const h = document.getElementById('edit-height').value.trim();
  const o = document.getElementById('edit-obj-short').value.trim();

  if (!c || !a || !w || !h || !o) return;

  state.club = c; state.age = a; state.weight = w; state.height = h; state.objectives.short = o;
  
  // recalcular IMC interno por si cambiaron altura/peso
  const meters = parseFloat(h) / 100;
  state.bmi = (parseFloat(w) / (meters * meters)).toFixed(1);

  saveState();
  updateDashboardUI();
  showScreen('dashboard');
  
  // Activar botón de inicio en la barra nav
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('nav-dash').classList.add('active');
}

function closeSheet(id) {
  document.getElementById(id).classList.remove('show');
}
