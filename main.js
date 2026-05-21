// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
let state = {
    profileSetupComplete: false,
    user: {
        name: "",
        position: "",
        club: ""
    },
    streak: 0,
    dailyProgress: 0, // Porcentaje de 0 a 100
    weeklyHistory: [20, 45, 28, 60, 55, 70, 0] // Datos de lunes a domingo para el gráfico
};

// ==========================================
// INICIALIZACIÓN (Al cargar el DOM)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    loadState();
});

// Cargar datos desde LocalStorage si existen
function loadState() {
    const savedState = localStorage.getItem("caminoAPrimera_state");
    if (savedState) {
        state = JSON.parse(savedState);
    }

    if (state.profileSetupComplete) {
        // Si el usuario ya se registró, salteamos la bienvenida
        document.getElementById("screen-welcome").classList.remove("active");
        document.getElementById("app-container").classList.add("app-layout-visible"); // Ajuste de clase contenedora si aplica
        
        // Forzar la vista de la pestaña de inicio
        switchTab("home");
        updateUI();
    } else {
        // Si no hay perfil, nos aseguramos de mostrar la bienvenida
        document.getElementById("screen-welcome").classList.add("active");
        document.getElementById("app-container").style.display = "none";
    }
}

// Guardar el estado actual en LocalStorage
function saveState() {
    localStorage.setItem("caminoAPrimera_state", JSON.stringify(state));
}

// ==========================================
// CONTROL DE MODALES (Bottom Sheets)
// ==========================================
function openRegisterModal() {
    const modal = document.getElementById("register-modal");
    modal.classList.add("active");
}

function closeRegisterModal(event) {
    // Si viene de un click directo en el overlay oscuro, se cierra
    const modal = document.getElementById("register-modal");
    modal.classList.remove("active");
}

// ==========================================
// REGISTRO DE USUARIO
// ==========================================
function handleRegister(event) {
    event.preventDefault();

    // Capturar datos del formulario
    const nameInput = document.getElementById("reg-name").value.trim();
    const positionInput = document.getElementById("reg-position").value;
    const clubInput = document.getElementById("reg-club").value.trim();

    if (!nameInput || !positionInput || !clubInput) return;

    // Actualizar el estado
    state.user.name = nameInput;
    state.user.position = positionInput;
    state.user.club = clubInput;
    state.profileSetupComplete = true;
    state.streak = 1; // Arranca con el primer día de racha
    state.dailyProgress = 0;

    saveState();

    // Transición visual de pantallas
    document.getElementById("screen-welcome").classList.remove("active");
    document.getElementById("register-modal").classList.remove("active");
    
    // Mostramos el contenedor de la app principal
    const appContainer = document.getElementById("app-container");
    appContainer.style.display = "flex"; 

    switchTab("home");
    updateUI();
}

// ==========================================
// NAVEGACIÓN ENTRE TABS
// ==========================================
function switchTab(tabId) {
    // 1. Ocultar todas las pantallas internas de la app
    const screens = ["home", "training", "profile"];
    screens.forEach(id => {
        const screenEl = document.getElementById(`screen-${id}`);
        if (screenEl) screenEl.classList.remove("active");
    });

    // 2. Mostrar la pantalla seleccionada
    const activeScreen = document.getElementById(`screen-${tabId}`);
    if (activeScreen) activeScreen.classList.add("active");

    // 3. Actualizar estado visual de los botones de la barra de navegación
    const navItems = document.querySelectorAll(".bottom-nav .nav-item");
    navItems.forEach(item => item.classList.remove("active"));

    // Mapeo simple para identificar cuál botón activar según el id de la pantalla
    const indexMap = { "home": 0, "training": 1, "profile": 2 };
    if (navItems[indexMap[tabId]]) {
        navItems[indexMap[tabId]].classList.add("active");
    }
}

// ==========================================
// ACTUALIZACIÓN DE LA INTERFAZ DE USUARIO (UI)
// ==========================================
function updateUI() {
    // Header superior
    document.getElementById("header-username").textContent = state.user.name || "Jugador";
    document.getElementById("streak-count").textContent = state.streak;
    
    // Nivel basado en la racha (ejemplo simple: cada 5 días sube un nivel)
    const currentLevel = Math.max(1, Math.floor(state.streak / 5) + 1);
    document.getElementById("header-level").textContent = `Nivel ${currentLevel}`;

    // Pantalla de Perfil
    document.getElementById("profile-name-display").textContent = state.user.name;
    document.getElementById("profile-position").textContent = state.user.position;
    document.getElementById("profile-club").textContent = state.user.club;

    // Renderizar los gráficos con los datos actuales
    updateDonutChart(state.dailyProgress);
    renderLineChart();
}

// ==========================================
// LÓGICA DE GRÁFICOS DINÁMICOS (SVG)
// ==========================================

// 1. Gráfico circular de Progreso Diario
function updateDonutChart(percentage) {
    const circleFill = document.querySelector(".circle-fill");
    const percentageText = document.getElementById("chart-percentage");
    
    if (!circleFill || !percentageText) return;

    // El radio del círculo en el HTML es 34. La circunferencia es 2 * PI * r 
    const radius = 34;
    const circumference = 2 * Math.PI * radius; // Aprox 213.63

    // Configurar las propiedades base del SVG para el cálculo del trazo
    circleFill.style.strokeDasharray = circumference;

    // Calcular el desplazamiento (offset) inverso para rellenar la barra
    const offset = circumference - (percentage / 100) * circumference;
    circleFill.style.strokeDashoffset = offset;

    // Actualizar el texto del centro
    percentageText.textContent = `${percentage}%`;
}

// 2. Gráfico de líneas (Evolución Semanal) usando SVG dinámico
function renderLineChart() {
    const container = document.getElementById("performance-graph-container");
    if (!container) return;

    const data = state.weeklyHistory;
    const width = 320;
    const height = 120;
    const padding = 20;

    // Calcular las posiciones de los puntos (X, Y) dentro del contenedor SVG
    const points = data.map((value, index) => {
        const x = padding + (index * (width - padding * 2) / (data.length - 1));
        // Invertimos la Y porque en SVG el 0,0 es la esquina superior izquierda
        const y = (height - padding) - (value * (height - padding * 2) / 100);
        return { x, y };
    });

    // Construir la cadena de comandos del Path SVG
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    // Estructura interna del componente visual gráfico
    const svgHTML = `
        <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
            <!-- Líneas de cuadrícula de fondo -->
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--border-color, #222)" stroke-width="1" />
            <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="var(--border-color, #222)" stroke-width="1" stroke-dasharray="4" />
            
            <!-- Línea de datos (Evolución) -->
            <path d="${pathD}" fill="none" stroke="url(#gradient-line)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            
            <!-- Puntos de datos individuales -->
            ${points.map((p, i) => `
                <circle cx="${p.x}" cy="${p.y}" r="4" fill="${i === data.length - 1 ? 'var(--primary-color, #00ff66)' : '#fff'}" />
            `).join('')}
            
            <!-- Gradiente lineal para la línea (Mapea con los estilos del CSS si usás variables) -->
            <defs>
                <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#8b5cf6" /> <!-- Violeta -->
                    <stop offset="100%" stop-color="#00ff66" /> <!-- Verde flúor -->
                </linearGradient>
            </defs>
        </svg>
    `;

    container.innerHTML = svgHTML;
}

// ==========================================
// SIMULACIÓN DE ACCIONES DE ENTRENAMIENTO
// ==========================================
function startTraining(type) {
    // Al iniciar/completar un entrenamiento, subimos el progreso del día
    // Sumamos un 50% por cada entrenamiento hecho (máximo 100%)
    state.dailyProgress = Math.min(100, state.dailyProgress + 50);

    // Si completó la barra al 100%, actualizamos la posición del domingo en el gráfico histórico
    if (state.dailyProgress === 100) {
        state.weeklyHistory[state.weeklyHistory.length - 1] = 100;
    } else {
        state.weeklyHistory[state.weeklyHistory.length - 1] = state.dailyProgress;
    }

    saveState();
    updateUI();

    // Feedback visual rápido
    alert(`¡Entrenamiento de ${type.toUpperCase()} completado! Tu progreso diario subió.`);
    
    // Volvemos automáticamente a la pantalla de inicio para ver el impacto en los gráficos
    switchTab("home");
}
