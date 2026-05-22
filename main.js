// --- ESTADO GLOBAL ---
let state = {
  profile: {
    name: '', club: '', age: '', position: '',
    height: '', weight: '', foot: 'diestro',
    attr1: '', attr2: ''
  },
  objectives: { short: [], medium: [], long: [] },
  metrics: { goles: { target: 10, current: 0 }, asistencias: { target: 10, current: 0 } },
  logs: []
};

const safeGet = (id) => document.getElementById(id) || { value: '', innerText: '', style: {} };

// --- INICIALIZACIÓN Y LOGIN ---
window.onload = () => {
  lucide.createIcons();
  loadState();
  
  const welcomeTitle = safeGet('welcome-title');
  const welcomeSubtitle = safeGet('welcome-subtitle');
  const welcomeBtn = safeGet('welcome-btn');

  // Lógica de Ingreso (Verifica si ya existe el nombre)
  if (state.profile.name) {
    welcomeTitle.innerHTML = `¡Hola, <br><span class="texto-verde">${state.profile.name}</span>!`;
    welcomeSubtitle.innerText = "¿Listo para seguir sumando estadísticas hoy?";
    welcomeBtn.innerHTML = `INGRESAR <i data-lucide="arrow-right"></i>`;
    
    welcomeBtn.onclick = () => {
      document.getElementById('screen-welcome').classList.remove('active');
      navigate('dash'); 
    };
  } else {
    // Usuario nuevo, lo mandamos a crear el perfil
    welcomeBtn.onclick = () => goTo('welcome', 'profile');
  }
  
  setupBMI();
};

function loadState() {
  const saved = localStorage.getItem('caminoPrimeraState');
  if (saved) {
    let parsed = JSON.parse(saved);
    if (!parsed.objectives.short || !Array.isArray(parsed.objectives.short)) {
      parsed.objectives = { short: [], medium: [], long: [] };
    }
    state = parsed;
    fillProfileData();
  }
}

function saveState() { localStorage.setItem('caminoPrimeraState', JSON.stringify(state)); }

// --- NAVEGACIÓN ---
function goTo(fromId, toId) {
  document.getElementById(`screen-${fromId}`).classList.remove('active');
  document.getElementById(`screen-${toId}`).classList.add('active');
}

function navigate(tab) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${tab}`).classList.add('active');
  
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`nav-${tab}`).classList.add('active');
  
  document.getElementById('app-nav').style.display = 'flex';
  
  if (tab === 'dash') renderDashboard();
  if (tab === 'objectives') renderObjectives();
  if (tab === 'stats') renderStats();
  if (tab === 'settings') fillSettings();
}

// --- PERFIL (Paso 1) ---
function setFoot(foot) {
  state.profile.foot = foot;
  safeGet('foot-right').classList.toggle('active', foot === 'diestro');
  safeGet('foot-left').classList.toggle('active', foot === 'zurdo');
}

function validateProfile() {
  state.profile.name = safeGet('player-name').value.trim();
  state.profile.club = safeGet('club-name').value.trim();
  state.profile.age = safeGet('player-age').value;
  state.profile.position = safeGet('position').value;
  state.profile.height = safeGet('height').value;
  state.profile.weight = safeGet('weight').value;
  state.profile.attr1 = safeGet('attr-1').value;
  state.profile.attr2 = safeGet('attr-2').value;

  if (!state.profile.name || !state.profile.club) {
    alert("Completá tu nombre y club para continuar."); return;
  }
  
  saveState();
  goTo('profile', 'objectives');
}

function setupBMI() {
  const hInput = safeGet('height'); const wInput = safeGet('weight');
  const calculate = () => {
    let h = parseFloat(hInput.value) / 100; let w = parseFloat(wInput.value);
    if (h > 0 && w > 0) {
      let bmi = (w / (h * h)).toFixed(1);
      safeGet('bmi-value').innerText = bmi;
      safeGet('bmi-status').innerText = bmi < 18.5 ? "Bajo peso" : (bmi < 25 ? "Peso ideal" : "Sobrepeso");
    }
  };
  if(hInput.addEventListener) { hInput.addEventListener('input', calculate); wInput.addEventListener('input', calculate); }
}

function fillProfileData() {
  safeGet('player-name').value = state.profile.name; safeGet('club-name').value = state.profile.club;
  safeGet('player-age').value = state.profile.age; safeGet('position').value = state.profile.position;
  safeGet('height').value = state.profile.height; safeGet('weight').value = state.profile.weight;
  safeGet('attr-1').value = state.profile.attr1; safeGet('attr-2').value = state.profile.attr2;
  setFoot(state.profile.foot || 'diestro');
}

// --- OBJETIVOS DINÁMICOS ---
function openAddObjModal(type) {
  safeGet('new-obj-type').value = type; safeGet('new-obj-text').value = '';
  safeGet('add-obj-modal').classList.add('active');
}

function saveNewDynamicObjective() {
  const type = safeGet('new-obj-type').value; const text = safeGet('new-obj-text').value.trim();
  if (!text) { alert("Escribí una meta."); return; }
  
  state.objectives[type].push({ id: Date.now().toString(), text: text, completed: false });
  saveState(); closeSheet('add-obj-modal');
  
  if (document.getElementById('screen-objectives').classList.contains('active') && !document.getElementById('app-nav').style.display) {
     navigate('dash');
  } else { renderObjectives(); }
}

function toggleObjective(type, id) {
  let obj = state.objectives[type].find(o => o.id === id);
  if (obj) {
    obj.completed = !obj.completed; saveState(); renderObjectives();
    if (obj.completed) triggerConfetti();
  }
}

function deleteObjective(type, id) {
  if (confirm("¿Borrar esta meta?")) {
    state.objectives[type] = state.objectives[type].filter(o => o.id !== id);
    saveState(); renderObjectives();
  }
}

function renderObjectives() {
  const types = [{ key: 'short', id: 'list-obj-short' }, { key: 'medium', id: 'list-obj-medium' }, { key: 'long', id: 'list-obj-long' }];
  types.forEach(t => {
    const container = safeGet(t.id); container.innerHTML = '';
    if (state.objectives[t.key].length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:1rem;">No hay metas.</p>`; return;
    }
    state.objectives[t.key].forEach(obj => {
      let div = document.createElement('div');
      div.className = `obj-item ${obj.completed ? 'completed' : ''}`;
      div.innerHTML = `
        <div class="obj-content" onclick="toggleObjective('${t.key}', '${obj.id}')">
          <div class="obj-check"><i data-lucide="check" style="width:14px;height:14px"></i></div>
          <div class="obj-text">${obj.text}</div>
        </div>
        <button class="obj-delete" onclick="deleteObjective('${t.key}', '${obj.id}')"><i data-lucide="trash-2" style="width:16px;height:16px"></i></button>
      `;
      container.appendChild(div);
    });
  });
  lucide.createIcons();
}

// --- DASHBOARD (Círculos y Logros) ---
function getGradientColor(percent) {
  let p = Math.max(0, Math.min(1, percent)); let r, g, b;
  if (p <= 0.5) {
    let f = p * 2; r = Math.round(68 + (255 - 68) * f); g = Math.round(68 + (204 - 68) * f); b = Math.round(68 + (0 - 68) * f);
  } else {
    let f = (p - 0.5) * 2; r = Math.round(255 + (0 - 255) * f); g = Math.round(204 + (204 - 204) * f); b = Math.round(0 + (102 - 0) * f);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

function updateRing(id, current, target) {
  let ring = safeGet(`ring-${id}`); let max = Math.max(current, target);
  let percentage = max === 0 ? 0 : Math.min(current / target, 1);
  ring.style.strokeDashoffset = 213 - (213 * percentage);
  ring.style.stroke = getGradientColor(percentage);
  safeGet(`num-${id}`).innerText = current; safeGet(`target-sub-${id}`).innerText = `Meta: ${target}`;
}

function renderDashboard() {
  safeGet('dash-player-name').innerText = state.profile.name;
  safeGet('dash-player-club').innerText = `${state.profile.position} • ${state.profile.club}`;
  
  let goles = 0; let asistencias = 0; let entrenamientos = 0; let partidos = 0;
  let hatTricks = 0; let pokers = 0; let repokers = 0; let asistidor = 0; let socioIdeal = 0;

  state.logs.forEach(l => {
    if (l.type === 'Partido') {
      partidos++; goles += l.goles; asistencias += l.asistencias;
      if (l.goles >= 5) repokers++; else if (l.goles === 4) pokers++; else if (l.goles === 3) hatTricks++;
      if (l.asistencias >= 3) asistidor++;
      if (l.goles >= 1 && l.asistencias >= 1) socioIdeal++;
    } else { entrenamientos++; }
  });

  updateRing('goles', goles, state.metrics.goles.target);
  updateRing('asistencias', asistencias, state.metrics.asistencias.target);
  safeGet('num-partidos').innerText = partidos; safeGet('num-entrenamientos').innerText = entrenamientos;

  let achText = [];
  if (hatTricks) achText.push(`${hatTricks} Hat-trick${hatTricks>1?'s':''}`);
  if (pokers) achText.push(`${pokers} Póker`);
  if (repokers) achText.push(`${repokers} Repóker`);
  if (asistidor) achText.push(`${asistidor} Asistidor Estrella`);
  if (socioIdeal) achText.push(`${socioIdeal} Socio Ideal`);
  
  const achContainer = safeGet('achievements-list');
  achContainer.innerHTML = achText.length > 0 ? achText.map(a => `<span class="badge-achievement">${a}</span>`).join('') : '<span class="badge-empty">Aún no hay medallas.</span>';

  let feed = safeGet('journal-feed'); feed.innerHTML = '';
  if (state.logs.length === 0) {
    feed.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">Sin registros. ¡Arrancá hoy!</p>`;
  } else {
    [...state.logs].reverse().forEach(l => {
      let d = new Date(l.date); let dateStr = d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
      let statsHtml = l.type === 'Partido' ? `<div class="log-stats">⚽ ${l.goles} Goles | 🎯 ${l.asistencias} Asist.</div>` : '';
      feed.innerHTML += `
        <div class="log-card">
          <div class="log-top"><span class="log-type ${l.type.toLowerCase()}">${l.type.toUpperCase()}</span><span class="log-date">${dateStr}</span></div>
          ${statsHtml}
          ${l.reflection ? `<div class="log-reflection">"${l.reflection}"</div>` : ''}
        </div>`;
    });
  }
}

// --- REGISTRO DIARIO ---
let currentRegType = 'Entrenamiento'; let tempRegStats = { goles: 0, asistencias: 0 };
function openRegisterModal() { setRegType('Entrenamiento'); safeGet('reg-reflection').value = ''; safeGet('register-modal').classList.add('active'); }
function closeSheet(id) { safeGet(id).classList.remove('active'); }
function setRegType(type) {
  currentRegType = type; safeGet('reg-training').classList.toggle('active', type === 'Entrenamiento'); safeGet('reg-match').classList.toggle('active', type === 'Partido');
  safeGet('match-fields').style.display = type === 'Partido' ? 'block' : 'none';
  tempRegStats = { goles: 0, asistencias: 0 }; safeGet('reg-val-goles').innerText = '0'; safeGet('reg-val-asistencias').innerText = '0';
}
function adjustRegCounter(metric, amount) {
  tempRegStats[metric] = Math.max(0, tempRegStats[metric] + amount); safeGet(`reg-val-${metric}`).innerText = tempRegStats[metric];
}
function saveDailyLog() {
  let log = { id: Date.now(), date: new Date().toISOString(), type: currentRegType, reflection: safeGet('reg-reflection').value.trim() };
  if (currentRegType === 'Partido') { log.goles = tempRegStats.goles; log.asistencias = tempRegStats.asistencias; }
  state.logs.push(log); saveState(); closeSheet('register-modal'); renderDashboard();
  if (currentRegType === 'Partido' && (log.goles > 0 || log.asistencias > 0)) triggerConfetti();
}

// --- MODIFICAR METAS NUMÉRICAS ---
let editingMetric = '';
function openObjectiveModal(metric) { editingMetric = metric; safeGet('obj-modal-title').innerText = `Meta de ${metric === 'goles' ? 'Goles' : 'Asistencias'}`; safeGet('obj-modal-input').value = state.metrics[metric].target; safeGet('objective-modal').classList.add('active'); }
function saveMetricObjective() {
  let val = parseInt(safeGet('obj-modal-input').value);
  if (val > 0) { state.metrics[editingMetric].target = val; saveState(); closeSheet('objective-modal'); renderDashboard(); }
}

// --- ESTADÍSTICAS ---
function renderStats() {
  let partidos = 0; let goles = 0; let asistencias = 0; let ultimosPartidos = [];
  state.logs.forEach(l => { if (l.type === 'Partido') { partidos++; goles += l.goles; asistencias += l.asistencias; ultimosPartidos.push(l); } });
  safeGet('avg-goles').innerText = partidos > 0 ? (goles / partidos).toFixed(1) : '0.0'; safeGet('avg-asistencias').innerText = partidos > 0 ? (asistencias / partidos).toFixed(1) : '0.0';
  let toShow = ultimosPartidos.slice(-5); renderBarChart('chart-goles-bars', toShow, 'goles'); renderBarChart('chart-asistencias-bars', toShow, 'asistencias');
}
function renderBarChart(containerId, data, metric) {
  let container = safeGet(containerId); container.innerHTML = '';
  if (data.length === 0) { container.innerHTML = '<div style="width:100%; text-align:center; color:var(--text-muted); font-size:0.8rem;">Faltan partidos</div>'; return; }
  let maxVal = Math.max(...data.map(d => d[metric]), 1);
  data.forEach((d, i) => {
    let heightPercent = (d[metric] / maxVal) * 100;
    container.innerHTML += `<div class="chart-bar-wrap"><span style="font-size:0.7rem; color:var(--primary); font-weight:bold;">${d[metric]}</span><div class="bar" style="height:${heightPercent}%"></div><div class="bar-label">P${i+1}</div></div>`;
  });
}

// --- AJUSTES ---
function fillSettings() { safeGet('edit-club').value = state.profile.club; safeGet('edit-position').value = state.profile.position; safeGet('edit-age').value = state.profile.age; safeGet('edit-weight').value = state.profile.weight; safeGet('edit-height').value = state.profile.height; }
function saveSettingsUpdate() { state.profile.club = safeGet('edit-club').value; state.profile.position = safeGet('edit-position').value; state.profile.age = safeGet('edit-age').value; state.profile.weight = safeGet('edit-weight').value; state.profile.height = safeGet('edit-height').value; saveState(); alert("Actualizado"); }
function triggerConfetti() { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#ffcc00', '#ffffff'] }); }
