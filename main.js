/* ============================================================
   CAMINO A PRIMERA — main.js (MEJORADO)
   ============================================================ */

'use strict';

// ============================================================
// STATE
// ============================================================
let state = {
    profileSetupComplete: false,

    // Perfil
    playerName: '',
    club: '',
    position: '',
    height: '',
    weight: '',
    bmi: '',

    gender: 'Masculino',
    footSide: 'diestro',
    weightUnit: 'kg',

    // Habilidades
    attr1: '',
    attr2: '',
    attr3: '', // opcional

    // Objetivos
    objShort: '',
    objMid: '',
    objLong: '',
    reflectionGeneral: '',

    // Leyenda
    legendMode: false,

    // Metas
    goals: {
        goles: 5,
        asistencias: 3,
        partidos: 20,
        entrenamientos: 5
    },

    // Historial
    history: []
};

let activeReg = {
    type: 'Entrenamiento',
    goles: 0,
    asistencias: 0
};

let editingLogId = null;
let currentFeedFilter = 'todos';
let confirmResolver = null;

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadState();
    setupBMI();
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

            document
                .getElementById('app-nav')
                .classList.add('visible');

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
// SCREENS
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

    currentEl.classList.remove('active');
    currentEl.classList.add('hidden-left');

    nextEl.classList.remove('hidden-right', 'hidden-left');
    nextEl.classList.add('active');

    currentScreen = next;
}

// ============================================================
// NAVIGATION
// ============================================================
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

    document
        .getElementById(`nav-${tab}`)
        ?.classList.add('active');
}

// ============================================================
// TOAST
// ============================================================
function showNotification(text, type = 'success') {
    const toast = document.getElementById('toast-container');
    const txt = document.getElementById('toast-text');
    const icon = document.getElementById('toast-icon');

    txt.innerText = text;

    if (type === 'error') {
        icon.innerHTML = `<i data-lucide="alert-circle"></i>`;
    } else {
        icon.innerHTML = `<i data-lucide="check-circle"></i>`;
    }

    lucide.createIcons();

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
}

// ============================================================
// BMI
// ============================================================
function setupBMI() {
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');

    if (!heightInput || !weightInput) return;

    heightInput.addEventListener('input', calculateBMI);
    weightInput.addEventListener('input', calculateBMI);
}

function calculateBMI() {
    const h = parseFloat(
        document.getElementById('height').value
    );

    const w = parseFloat(
        document.getElementById('weight').value
    );

    const result = document.getElementById('bmi-result');

    if (!h || !w) {
        result.innerText = '--';
        return;
    }

    const meters = h / 100;

    const bmi = (w / (meters * meters)).toFixed(1);

    state.bmi = bmi;

    let status = '';

    if (bmi < 18.5) {
        status = 'Bajo peso';
    } else if (bmi < 25) {
        status = 'Ideal';
    } else {
        status = 'Elevado';
    }

    result.innerText = `${bmi} • ${status}`;
}

// ============================================================
// PROFILE
// ============================================================
function setFoot(side) {
    state.footSide = side;

    document
        .getElementById('foot-right')
        ?.classList.toggle('active', side === 'diestro');

    document
        .getElementById('foot-left')
        ?.classList.toggle('active', side === 'zurdo');
}

function validateProfile() {

    const playerName = document
        .getElementById('player-name')
        .value.trim();

    const club = document
        .getElementById('club-name')
        .value.trim();

    const position = document
        .getElementById('position')
        .value;

    const height = document
        .getElementById('height')
        .value;

    const weight = document
        .getElementById('weight')
        .value;

    const attr1 = document
        .getElementById('attr-1')
        .value;

    const attr2 = document
        .getElementById('attr-2')
        .value;

    const attr3 = document
        .getElementById('attr-3')
        .value;

    if (
        !playerName ||
        !club ||
        !position ||
        !height ||
        !weight ||
        !attr1 ||
        !attr2
    ) {
        showNotification(
            'Completá todos los datos obligatorios.',
            'error'
        );
        return;
    }

    if (
        attr1 === attr2 ||
        attr1 === attr3 ||
        attr2 === attr3
    ) {
        showNotification(
            'No repitas habilidades.',
            'error'
        );
        return;
    }

    state.playerName = playerName;
    state.club = club;
    state.position = position;
    state.height = height;
    state.weight = weight;

    state.attr1 = attr1;
    state.attr2 = attr2;
    state.attr3 = attr3;

    calculateBMI();

    goTo('profile', 'objectives');
}

// ============================================================
// OBJECTIVES
// ============================================================
function saveObjectivesAndLaunch() {

    const short = document
        .getElementById('obj-short')
        .value.trim();

    const mid = document
        .getElementById('obj-mid')
        .value.trim();

    const long = document
        .getElementById('obj-long')
        .value.trim();

    const reflection = document
        .getElementById('reflection-general')
        .value.trim();

    if (!short || !mid || !long || !reflection) {
        showNotification(
            'Completá tus objetivos.',
            'error'
        );
        return;
    }

    state.objShort = short;
    state.objMid = mid;
    state.objLong = long;
    state.reflectionGeneral = reflection;

    state.profileSetupComplete = true;

    saveState();

    showScreen('dashboard');

    document
        .getElementById('app-nav')
        .classList.add('visible');

    setNavActive('dash');

    updateDashboardUI();
    updateStatsUI();
    updateSettingsUI();

    confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
    });

    showNotification('Perfil creado.');
}

// ============================================================
// DASHBOARD
// ============================================================
function updateDashboardUI() {

    document.getElementById(
        'dash-player-name'
    ).innerText = state.playerName;

    document.getElementById(
        'dash-player-club'
    ).innerText =
        `${state.position} • ${state.club}`;

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

            result.goles += Number(item.goles);
            result.asistencias += Number(item.asistencias);
            result.partidos++;

        } else {

            result.entrenamientos++;

        }
    });

    return result;
}

function updateDonut(id, val, target) {

    const num = document.getElementById(`num-${id}`);
    const goal = document.getElementById(`goal-${id}`);
    const circle = document.getElementById(`donut-${id}`);

    if (!num || !goal || !circle) return;

    num.innerText = val;
    goal.innerText = `/${target}`;

    const circumference = 213.6;

    const percent = Math.min(
        (val / target) * 100,
        100
    );

    const offset =
        circumference -
        (percent / 100) * circumference;

    circle.style.strokeDashoffset = offset;
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
                Registrá tu primer entrenamiento.
            </div>
        `;

        return;
    }

    feed.innerHTML = '';

    [...state.history]
        .reverse()
        .forEach(item => {

            const card = document.createElement('div');

            card.className = 'feed-card';

            card.innerHTML = `
                <div class="feed-card-header">
                    <span class="feed-card-type ${
                        item.type === 'Partido'
                            ? 'match'
                            : 'training'
                    }">
                        ${item.type}
                    </span>

                    <span class="feed-card-date">
                        ${item.date}
                    </span>
                </div>

                ${
                    item.type === 'Partido'
                        ? `
                        <div class="feed-card-stats">
                            <span class="stat-pill green">
                                ${item.goles} Goles
                            </span>

                            <span class="stat-pill purple">
                                ${item.asistencias} Asistencias
                            </span>
                        </div>
                    `
                        : ''
                }

                <p class="feed-card-reflection">
                    "${item.reflection}"
                </p>
            `;

            feed.appendChild(card);
        });
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

    document.getElementById(
        'reg-reflection'
    ).value = '';

    openSheet('register-modal');
}

function setRegType(type) {

    activeReg.type = type;

    document
        .getElementById('reg-training')
        ?.classList.toggle(
            'active',
            type === 'Entrenamiento'
        );

    document
        .getElementById('reg-match')
        ?.classList.toggle(
            'active',
            type === 'Partido'
        );

    document.getElementById(
        'match-fields'
    ).style.display =
        type === 'Partido'
            ? ''
            : 'none';
}

function adjustRegCounter(metric, value) {

    if (metric === 'goles') {

        activeReg.goles = Math.max(
            0,
            activeReg.goles + value
        );

        document.getElementById(
            'reg-val-goles'
        ).innerText = activeReg.goles;

    } else {

        activeReg.asistencias = Math.max(
            0,
            activeReg.asistencias + value
        );

        document.getElementById(
            'reg-val-asistencias'
        ).innerText = activeReg.asistencias;
    }
}

function saveDailyLog() {

    const reflection = document
        .getElementById('reg-reflection')
        .value.trim();

    if (!reflection) {

        showNotification(
            'Escribí una reflexión.',
            'error'
        );

        return;
    }

    const d = new Date();

    state.history.push({
        id: Date.now(),

        type: activeReg.type,

        goles:
            activeReg.type === 'Partido'
                ? activeReg.goles
                : 0,

        asistencias:
            activeReg.type === 'Partido'
                ? activeReg.asistencias
                : 0,

        reflection,

        date: `${d.getDate()}/${d.getMonth() + 1}`
    });

    saveState();

    closeSheet('register-modal');

    updateDashboardUI();

    showNotification('Registro guardado.');
}

// ============================================================
// STATS
// ============================================================
function updateStatsUI() {

    const progress = recalculateProgress();

    document.getElementById(
        'total-goles'
    ).innerText = progress.goles;

    document.getElementById(
        'total-asistencias'
    ).innerText = progress.asistencias;

    document.getElementById(
        'stat-attr-1'
    ).innerText = state.attr1 || '-';

    document.getElementById(
        'stat-attr-2'
    ).innerText = state.attr2 || '-';

    document.getElementById(
        'stat-attr-3'
    ).innerText = state.attr3 || '-';

    document.getElementById(
        'player-imc'
    ).innerText = state.bmi || '--';
}

// ============================================================
// SETTINGS
// ============================================================
function updateSettingsUI() {

    const badge = document.getElementById(
        'legend-badge'
    );

    if (!badge) return;

    if (state.legendMode) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// ============================================================
// SHEETS
// ============================================================
function openSheet(id) {
    document
        .getElementById(id)
        ?.classList.add('show');
}

function closeSheet(id) {
    document
        .getElementById(id)
        ?.classList.remove('show');
}