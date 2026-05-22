/* ============================================================
   CAMINO A PRIMERA — main.js (v1.1 FIX)
   ============================================================ */
'use strict';

let state = {
  profileSetupComplete: true,
  playerName: "Agustín",
  club: "Villa Dálmine",
  position: "Extremo encarador",
  height: "178",
  weight: "72",
  objectives: { short: "Ganar titularidad", mid: "Jugar regional", long: "Debutar profesionalmente" },
  history: []
};

let activeReg = { type: 'Entrenamiento', goles: 0, asistencias: 0 };
let editingId = null;

/* INIT */
window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  updateDashboard();
});

/* ====================== NAV ====================== */
function goTo(from, to) {
  showScreen(to);
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(`screen-${name}`);
  if (screen) screen.classList.add('active');
}

function navigate(tab) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`nav-${tab}`).classList.add('active');
  if (tab === 'dash') updateDashboard();
}

/* ====================== DASHBOARD ====================== */
function updateDashboard() {
  const nameEl = document.getElementById('dash-player-name');
  if (nameEl) nameEl.textContent = state.playerName || "Jugador";

  updateProgressDonut();
  renderFeed();
}

function updateProgressDonut() {
  const circle = document.getElementById('progress-circle');
  const text = document.getElementById('progress-text');
  if (!circle || !text) return;

  const progress = 65; // valor temporal
  const offset = 264 - (264 * progress / 100);
  circle.setAttribute('stroke-dashoffset', offset);
  text.textContent = progress + "%";
}

/* ====================== FEED ====================== */
function renderFeed() {
  const feed = document.getElementById('journal-feed');
  if (!feed) return;
  
  feed.innerHTML = state.history.length === 0 
    ? `<div class="feed-empty">Todavía no hay registros</div>` 
    : '';
}

/* ====================== NOTIFICATION ====================== */
function showNotification(text) {
  console.log("✅", text);
}

/* ====================== REGISTER ====================== */
function openRegisterModal() {
  console.log("Abrir modal de registro");
  // Agregar modal completo después si querés
}

console.log("%c✅ App cargada correctamente", "color:#34d399; font-weight:bold");
