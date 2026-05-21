/* ============================================================
   CAMINO A PRIMERA — main.js
   ============================================================ */

'use strict';

// ============================================================
// STATE
// ============================================================
let state = {
    profileSetupComplete: false,

    // PERFIL
    playerName: '',
    club: '',
    position: '',
    height: '',
    weight: '',
    bmi: '',
    bmiStatus: '',

    // CONFIG
    gender: 'Masculino',
    footSide: 'diestro',
    legendMode: false,

    // HABILIDADES
    attr1: '',
    attr2: '',
    attr3: '',

    // OBJETIVOS
    objShort: '',
    objMid: '',
    objLong: '',
    reflectionGeneral: '',

    // METAS
    goals: {
        goles: 5,
        asistencias: 3,
        partidos: 20,
        entrenamientos: 5
    },

    // HISTORIAL
    history: []
};

let activeReg = {
    type: 'Entrenamiento',
    goles: 0,
    asistencias: 0
};

let activeGoalEdit = null;
let editingLogId = null;
let currentFeedFilter = 'todos';
let confirmResolver = null;

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
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
    localStorage.setItem(
        'camino_primera_v2',
        JSON.stringify(state)
    );
}

function loadState() {
    const saved = localStorage.getItem('camino_primera_v2');

    if (!saved) return;

    try {
        state = JSON.parse(saved);

        if (state.profileSetupComplete) {
            showScreen('dashboard');

            const nav = document.getElementById('app-nav');

            if (nav) {
                nav.classList.add('visible');
            }

            setNavActive('dash');

            updateDashboardUI();
            updateStatsUI();
            updateSettingsUI();
        }
    } catch (err) {
        console.error(err);
    }
}

// ============================================================
// SCREEN CONTROL
// ============================================================
let currentScreen = 'welcome';

function showScreen(name) {
    const screens = [
        'welcome',
        'profile',
        'objectives',
        'dashboard',
        'stats',
        'settings'
    ];

    screens.forEach(screen => {
        const el = document.getElementById(`screen-${screen}`);

        if (!el) return;

        if (screen === name) {
            el.classList.remove('hidden-right', 'hidden-left');
            el.classList.add('active');
        } else {
            el.classList.remove('active');
            el.classList.add('hidden-right');
        }
    });

    currentScreen = name;
}

function goTo(current, next) {
    const currentEl = document.getElementById(`screen-${current}`);
    const nextEl = document.getElementById(`screen-${next}`);

    if (!currentEl || !nextEl) return;

    currentEl.classList.remove('active');
    currentEl.classList.add('hidden-left');

    nextEl.classList.remove('hidden-right', 'hidden-left');
    nextEl.classList.add('active');

    currentScreen = next;
}

function navigate(tab) {
    const map = {
        dash: 'dashboard',
        stats: 'stats',
        settings: 'settings'
    };

    showScreen(map[tab]);

    setNavActive(tab);

    if (tab === 'dash') updateDashboardUI();
    if (tab === 'stats') updateStatsUI();
    if (tab === 'settings') updateSettingsUI();
}

function setNavActive(tab) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const active = document.getElementById(`nav-${tab}`);

    if (active) {
        active.classList.add('active');
    }
}

// ============================================================
// NOTIFICATIONS
// ============================================================
function showNotification(text, type = 'success') {
    const container = document.getElementById('toast-container');
    const textEl = document.getElementById('toast-text');
    const iconEl = document.getElementById('toast-icon');

    if (!container || !textEl || !iconEl) return;

    textEl.innerText = text;

    if (type === 'error') {
        iconEl.innerHTML = `<i data-lucide="alert-circle"></i>`;
    } else {
        iconEl.innerHTML = `<i data-lucide="check-circle"></i>`;
    }

    lucide.createIcons();

    container.classList.add('show');

    setTimeout(() => {
        container.classList.remove('show');
    }, 2500);
}

// ============================================================
// BMI
// ============================================================
function calculateBMI() {
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');

    const bmiValueEl = document.getElementById('bmi-value');
    const bmiStatusEl = document.getElementById('bmi-status');

    if (
        !heightInput ||
        !weightInput ||
        !bmiValueEl ||
        !bmiStatusEl
    ) {
        return;
    }

    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);

    if (!height || !weight) {
        bmiValueEl.innerText = '--';
        bmiStatusEl.innerText = 'Esperando datos';
        return;
    }

    const meters = height / 100;

    const bmi = weight / (meters * meters);

    let status = '';

    if (bmi < 18.5) {
        status = 'Bajo peso';
    } else if (bmi < 25) {
        status = 'Óptimo';
    } else if (bmi < 30) {
        status = 'Sobrepeso';
    } else {
        status = 'Elevado';
    }

    bmiValueEl.innerText = bmi.toFixed(1);
    bmiStatusEl.innerText = status;

    state.bmi = bmi.toFixed(1);
    state.bmiStatus = status;
}

// ============================================================
// PROFILE CONTROLS
// ============================================================
function setFoot(side) {
    state.footSide = side;

    const right = document.getElementById('foot-right');
    const left = document.getElementById('foot-left');

    if (right) {
        right.classList.toggle('active', side === 'diestro');
    }

    if (left) {
        left.classList.toggle('active', side === 'zurdo');
    }
}

// ============================================================
// PROFILE VALIDATION
// ============================================================
function validateProfile() {
    const playerName = document.getElementById('player-name');
    const club = document.getElementById('club-name');
    const position = document.getElementById('position');

    const height = document.getElementById('height');
    const weight = document.getElementById('weight');

    const attr1 = document.getElementById('attr-1');
    const attr2 = document.getElementById('attr-2');
    const attr3 = document.getElementById('attr-3');

    if (
        !playerName ||
        !club ||
        !position ||
        !height ||
        !weight ||
        !attr1 ||
        !attr2 ||
        !attr3
    ) {
        showNotification(
            'Faltan elementos del formulario.',
            'error'
        );

        return;
    }

    const nameVal = playerName.value.trim();
    const clubVal = club.value.trim();
    const positionVal = position.value;
    const heightVal = height.value;
    const weightVal = weight.value;

    const a1 = attr1.value;
    const a2 = attr2.value;
    const a3 = attr3.value;

    if (
        !nameVal ||
        !clubVal ||
        !positionVal ||
        !heightVal ||
        !weightVal ||
        !a1 ||
        !a2
    ) {
        showNotification(
            'Completá todos los datos obligatorios.',
            'error'
        );

        return;
    }

    const attrs = [a1, a2];

    if (a3) {
        attrs.push(a3);
    }

    const unique = new Set(attrs);

    if (unique.size !== attrs.length) {
        showNotification(
            'No repitas habilidades.',
            'error'
        );

        return;
    }

    state.playerName = nameVal;
    state.club = clubVal;
    state.position = positionVal;
    state.height = heightVal;
    state.weight = weightVal;

    state.attr1 = a1;
    state.attr2 = a2;
    state.attr3 = a3;

    saveState();

    goTo('profile', 'objectives');
}

// ============================================================
// OBJECTIVES
// ============================================================
function saveObjectivesAndLaunch() {
    const short = document.getElementById('obj-short');
    const mid = document.getElementById('obj-mid');
    const long = document.getElementById('obj-long');
    const reflection = document.getElementById('reflection-general');

    if (
        !short ||
        !mid ||
        !long ||
        !reflection
    ) {
        return;
    }

    const shortVal = short.value.trim();
    const midVal = mid.value.trim();
    const longVal = long.value.trim();
    const reflectionVal = reflection.value.trim();

    if (
        !shortVal ||
        !midVal ||
        !longVal ||
        !reflectionVal
    ) {
        showNotification(
            'Completá todos los objetivos.',
            'error'
        );

        return;
    }

    state.objShort = shortVal;
    state.objMid = midVal;
    state.objLong = longVal;
    state.reflectionGeneral = reflectionVal;

    state.profileSetupComplete = true;

    saveState();

    showScreen('dashboard');

    const nav = document.getElementById('app-nav');

    if (nav) {
        nav.classList.add('visible');
    }

    setNavActive('dash');

    updateDashboardUI();
    updateStatsUI();
    updateSettingsUI();

    confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.7 }
    });

    showNotification('Perfil creado correctamente.');
}

// ============================================================
// DASHBOARD
// ============================================================
function updateDashboardUI() {
    const name = document.getElementById('dash-player-name');
    const club = document.getElementById('dash-player-club');

    if (name) {
        name.innerText = state.playerName || 'Jugador';
    }

    if (club) {
        club.innerText =
            `${state.position} • ${state.club}`;
    }

    const progress = recalculateProgress();

    updateDonut(
        'goles',
        progress.goles,
        state.goals.goles
    );

    updateDonut(
        'asistencias',
        progress.asistencias,
        state.goals.asistencias
    );

    updateDonut(
        'partidos',
        progress.partidos,
        state.goals.partidos
    );

    updateDonut(
        'entrenamientos',
        progress.entrenamientos,
        state.goals.entrenamientos
    );

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
    const numEl = document.getElementById(`num-${id}`);
    const goalEl = document.getElementById(`goal-${id}`);
    const circle = document.getElementById(`donut-${id}`);

    if (!numEl || !goalEl || !circle) return;

    numEl.innerText = value;
    goalEl.innerText = `/${target}`;

    const circumference = 213.6;

    const percent = Math.min(
        (value / target) * 100,
        100
    );

    const offset =
        circumference -
        (percent / 100) * circumference;

    circle.style.strokeDasharray =
        `${circumference} ${circumference}`;

    circle.style.strokeDashoffset = offset;
}

// ============================================================
// FEED
// ============================================================
function renderFeed() {
    const container = document.getElementById('journal-feed');

    if (!container) return;

    if (state.history.length === 0) {
        container.innerHTML = `
            <div class="feed-empty">
                No registraste actividades todavía.
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    [...state.history]
        .reverse()
        .forEach(item => {

            const card = document.createElement('div');

            card.className = 'feed-card';

            card.innerHTML = `
                <div class="feed-card-header">
                    <span class="feed-card-type">
                        ${item.type}
                    </span>

                    <span class="feed-card-date">
                        ${item.date}
                    </span>
                </div>

                <p class="feed-card-reflection">
                    "${item.reflection}"
                </p>
            `;

            container.appendChild(card);
        });
}

// ============================================================
// STATS
// ============================================================
function updateStatsUI() {
    const progress = recalculateProgress();

    const goles = document.getElementById('total-goles');
    const asistencias = document.getElementById('total-asistencias');

    if (goles) {
        goles.innerText = progress.goles;
    }

    if (asistencias) {
        asistencias.innerText = progress.asistencias;
    }

    const bmi = document.getElementById('stats-bmi');

    if (bmi) {
        bmi.innerText =
            state.bmi
                ? `${state.bmi} (${state.bmiStatus})`
                : '--';
    }
}

// ============================================================
// SETTINGS
// ============================================================
function updateSettingsUI() {
    const badge = document.getElementById('legend-badge');

    if (!badge) return;

    if (state.legendMode) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// ============================================================
// REGISTER
// ============================================================
function openRegisterModal() {
    editingLogId = null;

    activeReg = {
        type: 'Entrenamiento',
        goles: 0,
        asistencias: 0
    };

    const reflection = document.getElementById('reg-reflection');

    if (reflection) {
        reflection.value = '';
    }

    openSheet('register-modal');
}

function closeRegisterModal(e) {
    if (
        !e ||
        e.target.id === 'register-modal'
    ) {
        closeSheet('register-modal');
    }
}

function setRegType(type) {
    activeReg.type = type;
}

function adjustRegCounter(metric, value) {
    if (metric === 'goles') {
        activeReg.goles = Math.max(
            0,
            activeReg.goles + value
        );

        const el = document.getElementById('reg-val-goles');

        if (el) {
            el.innerText = activeReg.goles;
        }
    }

    if (metric === 'asistencias') {
        activeReg.asistencias = Math.max(
            0,
            activeReg.asistencias + value
        );

        const el = document.getElementById('reg-val-asistencias');

        if (el) {
            el.innerText = activeReg.asistencias;
        }
    }
}

function saveDailyLog() {
    const reflection =
        document.getElementById('reg-reflection');

    if (!reflection) return;

    const text = reflection.value.trim();

    if (!text) {
        showNotification(
            'Escribí una reflexión.',
            'error'
        );

        return;
    }

    const now = new Date();

    state.history.push({
        id: Date.now(),
        type: activeReg.type,
        goles: activeReg.goles,
        asistencias: activeReg.asistencias,
        reflection: text,
        date:
            `${now.getDate()}/${now.getMonth() + 1}`
    });

    saveState();

    closeSheet('register-modal');

    updateDashboardUI();
    updateStatsUI();

    showNotification('Registro guardado.');
}

// ============================================================
// GOALS
// ============================================================
function editGoal(metric) {
    activeGoalEdit = metric;

    const input = document.getElementById('goal-modal-input');

    if (input) {
        input.value = state.goals[metric];
    }

    openSheet('goal-modal');
}

function closeGoalModal(e) {
    if (
        !e ||
        e.target.id === 'goal-modal'
    ) {
        closeSheet('goal-modal');
    }
}

function saveGoalLimit() {
    const input = document.getElementById('goal-modal-input');

    if (!input) return;

    const value = parseInt(input.value);

    if (!value || value <= 0) {
        showNotification(
            'Ingresá una meta válida.',
            'error'
        );

        return;
    }

    state.goals[activeGoalEdit] = value;

    saveState();

    updateDashboardUI();

    closeSheet('goal-modal');

    showNotification('Meta actualizada.');
}

// ============================================================
// SHEETS
// ============================================================
function openSheet(id) {
    const el = document.getElementById(id);

    if (el) {
        el.classList.add('show');
    }
}

function closeSheet(id) {
    const el = document.getElementById(id);

    if (el) {
        el.classList.remove('show');
    }
}
