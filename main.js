/* ============================================================
   CAMINO A PRIMERA — main.js
   ============================================================ */

'use strict';

// ============================================================
// STATE
// ============================================================
let state = {
  profileSetupComplete: false,
  playerName: '',
  club: '',
  position: '',
  height: '',
  weight: '',
  bmi: '',
  footSide: 'Diestro',
  attr1: '',
  attr2: '',
  attr3: '',
  goals: {
    goles: 10,
    asistencias: 5,
    partidos: 20,
    entrenamientos: 6
  },
  history: []
};

let activeReg = {
  type: 'Entrenamiento',
  goles: 0,
  asistencias: 0
};

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  loadState();

  const heightInput = document.getElementById('height');
  const weightInput = document.getElementById('weight');

  if (heightInput) {
    heightInput.addEventListener('input', calculateBMI);
  }

  if (weightInput) {
    weightInput.addEventListener('input', calculateBMI);
  }
});

// ============================================================
// STORAGE
// ============================================================
function saveState() {
  localStorage.setItem('camino_primera_v2', JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem('camino_primera_v2');

  if (!saved) return;

  try {
    state = JSON.parse(saved);

    if (state.profileSetupComplete) {
      fillProfileData();
      showScreen('dashboard');
      document.getElementById('app-nav')?.classList.add('visible');
      updateDashboardUI();
      updateStatsUI();
    }
  } catch (err) {
    console.error(err);
  }
}

// ============================================================
// SCREEN CONTROL
// ============================================================
function showScreen(name) {
  const screens = document.querySelectorAll('.screen');

  screens.forEach(screen => {
    screen.classList.remove('active');
  });

  const target = document.getElementById(`screen-${name}`);

  if (target) {
    target.classList.add('active');
  }
}

function navigate(tab) {
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

// ============================================================
// BMI
// ============================================================
function calculateBMI() {
  const heightInput = document.getElementById('height');
  const weightInput = document.getElementById('weight');
  const bmiValue = document.getElementById('bmi-value');
  const bmiLabel = document.getElementById('bmi-label');

  if (!heightInput || !weightInput || !bmiValue || !bmiLabel) return;

  const height = parseFloat(heightInput.value);
  const weight = parseFloat(weightInput.value);

  if (!height || !weight) {
    bmiValue.innerText = '--';
    bmiLabel.innerText = 'Completá altura y peso';
    return;
  }

  const meters = height / 100;
  const bmi = (weight / (meters * meters)).toFixed(1);

  state.bmi = bmi;

  bmiValue.innerText = bmi;

  let label = 'Normal';

  if (bmi < 18.5) {
    label = 'Bajo peso';
  } else if (bmi >= 25) {
    label = 'Peso elevado';
  }

  bmiLabel.innerText = label;
}

// ============================================================
// PROFILE
// ============================================================
function setFoot(side) {
  state.footSide = side;

  document.getElementById('foot-right')?.classList.remove('active');
  document.getElementById('foot-left')?.classList.remove('active');

  if (side === 'Diestro') {
    document.getElementById('foot-right')?.classList.add('active');
  } else {
    document.getElementById('foot-left')?.classList.add('active');
  }
}

function validateProfile() {
  const playerName = document.getElementById('player-name')?.value.trim();
  const club = document.getElementById('club-name')?.value.trim();
  const position = document.getElementById('position')?.value;
  const height = document.getElementById('height')?.value;
  const weight = document.getElementById('weight')?.value;

  const attr1 = document.getElementById('attr-1')?.value;
  const attr2 = document.getElementById('attr-2')?.value;
  const attr3 = document.getElementById('attr-3')?.value;

  if (!playerName || !club || !position || !height || !weight || !attr1 || !attr2) {
    showNotification('Completá todos los datos obligatorios.', 'error');
    return;
  }

  if (attr1 === attr2 || (attr3 && attr1 === attr3) || (attr3 && attr2 === attr3)) {
    showNotification('No repitas habilidades.', 'error');
    return;
  }

  state.playerName = playerName;
  state.club = club;
  state.position = position;
  state.height = height;
  state.weight = weight;

  state.attr1 = attr1;
  state.attr2 = attr2;
  state.attr3 = attr3 || '—';

  state.profileSetupComplete = true;

  saveState();

  document.getElementById('app-nav')?.classList.add('visible');

  updateDashboardUI();
  updateStatsUI();

  showScreen('dashboard');

  showNotification('Perfil creado correctamente.');
}

function fillProfileData() {
  const ids = {
    'player-name': state.playerName,
    'club-name': state.club,
    'height': state.height,
    'weight': state.weight
  };

  Object.keys(ids).forEach(id => {
    const el = document.getElementById(id);

    if (el) {
      el.value = ids[id];
    }
  });

  const position = document.getElementById('position');

  if (position) {
    position.value = state.position;
  }

  calculateBMI();
}

// ============================================================
// DASHBOARD
// ============================================================
function updateDashboardUI() {
  const playerName = document.getElementById('dash-player-name');
  const playerClub = document.getElementById('dash-player-club');

  if (playerName) {
    playerName.innerText = state.playerName || 'Jugador';
  }

  if (playerClub) {
    playerClub.innerText = `${state.position} • ${state.club}`;
  }

  const progress = recalculateProgress();

  updateDonut('goles', progress.goles, state.goals.goles);
  updateDonut('asistencias', progress.asistencias, state.goals.asistencias);
  updateDonut('partidos', progress.partidos, state.goals.partidos);
  updateDonut('entrenamientos', progress.entrenamientos, state.goals.entrenamientos);

  renderFeed();
}

function recalculateProgress() {
  const result = {
    goles: 0,
    asistencias: 0,
    partidos: 0,
    entrenamientos: 0
  };

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

function updateDonut(id, value, target) {
  const number = document.getElementById(`num-${id}`);
  const goal = document.getElementById(`goal-${id}`);
  const circle = document.getElementById(`donut-${id}`);

  if (!number || !goal || !circle) return;

  number.innerText = value;
  goal.innerText = `/${target}`;

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((value / target) * 100, 100);
  const offset = circumference - (progress / 100) * circumference;

  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = offset;
}

// ============================================================
// REGISTER
// ============================================================
function openRegisterModal() {
  activeReg = {
    type: 'Entrenamiento',
    goles: 0,
    asistencias: 0
  };

  document.getElementById('register-modal')?.classList.add('show');

  document.getElementById('reg-reflection').value = '';
  document.getElementById('reg-val-goles').innerText = '0';
  document.getElementById('reg-val-asistencias').innerText = '0';

  setRegType('Entrenamiento');
}

function closeRegisterModal(e) {
  if (!e || e.target.id === 'register-modal') {
    document.getElementById('register-modal')?.classList.remove('show');
  }
}

function setRegType(type) {
  activeReg.type = type;

  document.getElementById('reg-training')?.classList.remove('active');
  document.getElementById('reg-match')?.classList.remove('active');

  if (type === 'Entrenamiento') {
    document.getElementById('reg-training')?.classList.add('active');
    document.getElementById('match-fields').style.display = 'none';
  } else {
    document.getElementById('reg-match')?.classList.add('active');
    document.getElementById('match-fields').style.display = 'block';
  }
}

function adjustRegCounter(type, amount) {
  if (type === 'goles') {
    activeReg.goles = Math.max(0, activeReg.goles + amount);
    document.getElementById('reg-val-goles').innerText = activeReg.goles;
  }

  if (type === 'asistencias') {
    activeReg.asistencias = Math.max(0, activeReg.asistencias + amount);
    document.getElementById('reg-val-asistencias').innerText = activeReg.asistencias;
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

  closeRegisterModal();

  showNotification('Registro guardado.');
}

// ============================================================
// FEED
// ============================================================
function renderFeed() {
  const feed = document.getElementById('journal-feed');

  if (!feed) return;

  if (state.history.length === 0) {
    feed.innerHTML = `
      <div class="feed-empty">
        Todavía no registraste ningún día.
      </div>
    `;

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

        <span class="feed-card-date">
          ${item.date}
        </span>
      </div>

      ${item.type === 'Partido' ? `
        <div class="feed-card-stats">
          <span class="stat-pill green">⚽ ${item.goles}</span>
          <span class="stat-pill purple">🎯 ${item.asistencias}</span>
        </div>
      ` : ''}

      <p class="feed-card-reflection">
        "${item.reflection}"
      </p>
    `;

    feed.appendChild(card);
  });
}

// ============================================================
// STATS
// ============================================================
function updateStatsUI() {
  const progress = recalculateProgress();

  const goles = document.getElementById('total-goles');
  const asistencias = document.getElementById('total-asistencias');

  if (goles) goles.innerText = progress.goles;
  if (asistencias) asistencias.innerText = progress.asistencias;

  const a1 = document.getElementById('stat-attr-1');
  const a2 = document.getElementById('stat-attr-2');
  const a3 = document.getElementById('stat-attr-3');

  if (a1) a1.innerText = state.attr1 || '-';
  if (a2) a2.innerText = state.attr2 || '-';
  if (a3) a3.innerText = state.attr3 || '-';

  renderPerformanceChart();
}

function renderPerformanceChart() {
  const container = document.getElementById('chart-container');

  if (!container) return;

  const partidos = state.history.filter(item => item.type === 'Partido');

  if (partidos.length === 0) {
    container.innerHTML = '<p style="font-size:.75rem;color:#777">Sin datos todavía.</p>';
    return;
  }

  const goals = partidos.map(item => Number(item.goles));

  const max = Math.max(...goals, 1);

  const width = 320;
  const height = 120;
  const padding = 20;

  const step = goals.length > 1
    ? (width - padding * 2) / (goals.length - 1)
    : 0;

  const points = goals.map((goal, index) => {
    return {
      x: padding + index * step,
      y: height - padding - ((goal / max) * (height - padding * 2))
    };
  });

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <path
        d="${path}"
        fill="none"
        stroke="#34d399"
        stroke-width="3"
        stroke-linecap="round"
      />

      ${points.map(point => `
        <circle
          cx="${point.x}"
          cy="${point.y}"
          r="4"
          fill="#34d399"
        />
      `).join('')}
    </svg>
  `;
}

// ============================================================
// TOAST
// ============================================================
function showNotification(text, type = 'success') {
  const toast = document.getElementById('toast-container');
  const toastText = document.getElementById('toast-text');

  if (!toast || !toastText) return;

  toastText.innerText = text;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}
