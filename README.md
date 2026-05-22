# 90+
# Camino a Primera ⚽📱

Una aplicación web progresiva y minimalista diseñada para que futbolistas en formación puedan registrar sus entrenamientos, hacer un seguimiento estricto de sus estadísticas en partidos, establecer metas a corto/mediano/largo plazo y desbloquear medallas exclusivas basadas en su rendimiento en la cancha.

---

## 🔥 Características Principales

*   **Ficha Profesional Personalizada:** Registro de datos físicos (altura, peso, edad), posición específica en el campo, pierna hábil y cálculo automático del Índice de Masa Corporal (IMC).
*   **Gestión de Historial Completa:** Permite registrar cada día de actividad distinguiendo entre *Entrenamiento* y *Partido*. Cada tarjeta del historial incluye opciones para **Editar** los datos ingresados o **Borrar** el registro de forma definitiva.
*   **Sistema de Medallas Avanzado:** Lógica automatizada para la asignación de logros según los goles anotados en un solo partido:
    *   **3 goles:** Hat-trick
    *   **4 o 5 goles:** Póker
    *   **6 o 7 goles:** Doble Hat-trick
    *   **8 goles:** Doble Póker
    *   **9 goles:** Triple Hat-trick
    *   **10 o 11 goles:** Doble Póker
    *   **12 o más goles:** 4 Hat-tricks
    *   *Logros especiales:* Asistidor Estrella (3+ asistencias) y Socio Ideal (goles y asistencias combinados).
*   **Anillos de Progreso Dinámicos:** Indicadores visuales que cambian de color (de rojo/amarillo a verde esmeralda) a medida que el jugador se acerca a sus metas de goles y asistencias de la temporada.
*   **Control de Objetivos Dinámicos:** Secciones separadas para planificar metas a Corto, Mediano y Largo Plazo con un sistema interactivo de *Checklist* y efectos visuales de celebración al completarlos.
*   **Estadísticas e Histograma:** Gráficos de barras nativos en CSS para evaluar la consistencia del rendimiento en los últimos 5 partidos disputados.
*   **Persistencia Local Total:** Todos los datos se guardan de forma automática en el dispositivo a través de `localStorage`.

---

## 🛠️ Tecnologías Utilizadas

*   **HTML5:** Estructura semántica adaptada para simular una interfaz de aplicación nativa.
*   **CSS3:** Diseño responsivo (Mobile-First), variables globales, efectos de desenfoque de fondo (*backdrop-filter*) y luces ambientales estéticas.
*   **JavaScript (Vanilla JS):** Arquitectura basada en un estado global único (`state`) para manejar la lógica de la app sin dependencias pesadas.
*   **Lucide Icons:** Pack de iconos vectoriales modernos y estilizados.
*   **Canvas Confetti:** Librería ligera para los efectos de celebración al alcanzar objetivos o registrar partidos destacados.

---

## 📂 Estructura del Proyecto

```text
├── index.html        # Estructura principal y contenedores de las pantallas.
├── styles.css        # Estilos visuales, modo oscuro y diseño responsivo móvil.
├── main.js           # Lógica del estado, motor de estadísticas y medallas.
└── README.md         # Documentación del proyecto.
