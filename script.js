const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
const fechaInicio = new Date(2026, 0, 27, 0, 0, 0);

// ==========================
// Canvas responsive (PC + móvil) sin borrosidad
// ==========================
function resizeCanvasToContainer() {
  const container = document.querySelector(".tree-container");
  if (!container) return { w: 800, h: 900 };

  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";

  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { w: rect.width, h: rect.height };
}

// ==========================
// Árbol (TU forma original)
// ==========================
function drawTree(startX, startY, len, angle, branchWidth) {
  ctx.beginPath();
  ctx.save();

  ctx.strokeStyle = "#4d2911";
  ctx.lineWidth = branchWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.translate(startX, startY);
  ctx.rotate(angle * Math.PI / 180);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -len);
  ctx.stroke();

  if (len < 15) {
    drawHeart(0, -len);
    ctx.restore();
    return;
  }

  drawTree(0, -len, len * 0.75, angle + 22, branchWidth * 0.7);
  drawTree(0, -len, len * 0.75, angle - 22, branchWidth * 0.7);

  ctx.restore();
}

function drawHeart(x, y) {
  const size = 15 + Math.random() * 10;
  const colors = ['#ff007f', '#ff4da6', '#ff80bf', '#e60073'];
  ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.random() * Math.PI);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
  ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
  ctx.fill();

  ctx.restore();
}

// ==========================
// Pétalos (sin duplicarse)
// ==========================
function createPetals() {
  const container = document.getElementById('falling-petals');
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < 40; i++) {
    const petal = document.createElement('div');
    petal.classList.add('petal');

    const size = (Math.random() * 15 + 10) + 'px';
    petal.style.width = size;
    petal.style.height = size;
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = (Math.random() * 3 + 5) + 's';
    petal.style.animationDelay = (Math.random() * 5) + 's';

    container.appendChild(petal);
  }
}

// ==========================
// Contador
// ==========================
function actualizarContador() {
  const ahora = new Date();
  const dif = ahora - fechaInicio;

  const d = Math.floor(dif / (1000 * 60 * 60 * 24));
  const h = Math.floor((dif / (1000 * 60 * 60)) % 24);
  const m = Math.floor((dif / (1000 * 60)) % 60);
  const s = Math.floor((dif / 1000) % 60);

  const el = document.getElementById('contador');
  if (el) {
    el.innerHTML =
      `<span>${d}</span> días<br><span>${h}</span>h : <span>${m}</span>m : <span>${s}</span>s`;
  }
}

// ==========================
// Frases bonitas cayendo
// (✅ SOLO dentro del árbol, y se detienen antes del texto)
// ==========================
const frasesBonitas = [
  "Eres mi lugar favorito. ❤️",
  "Contigo todo es mejor.",
  "Tu sonrisa es mi paz.",
  "Te elijo hoy y siempre.",
  "Eres mi casualidad más bonita.",
  "Mi mundo eres tú.",
  "Eres mi mejor decisión.",
  "Te amo más de lo que las palabras pueden decir.",
  "Eres mi razón bonita cada día.",
  "Si es contigo, es todo.",
  "Tu amor es mi hogar.",
  "Gracias por existir, mi amor.",
  "Tus ojos son mi cielo.",
  "Me haces sentir infinito.",
  "Eres mi primavera favorita. 🌸"
];

let phraseTimer = null;

// Área EXACTA del árbol (solo tree-container)
function getTreeSpawnArea() {
  const tree = document.querySelector('.tree-container');
  if (!tree) return null;

  const r = tree.getBoundingClientRect();

  // Zona de "ramas": parte alta/media del árbol
  const top = r.top + r.height * 0.08;
  const bottom = r.top + r.height * 0.68; // ✅ NO baja al texto en móvil

  return {
    left: r.left + 10,
    right: r.right - 10,
    top,
    bottom,
    stopY: r.top + r.height * 0.95 // ✅ máximo hasta el final del árbol
  };
}

function spawnPhrase() {
  const area = getTreeSpawnArea();
  if (!area) return;

  const container = document.getElementById('falling-phrases');
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'falling-phrase';
  el.textContent = frasesBonitas[Math.floor(Math.random() * frasesBonitas.length)];

  // Posición X dentro del árbol
  const maxW = 280;
  const x = area.left + Math.random() * Math.max(1, (area.right - area.left - maxW));
  el.style.left = x + 'px';

  // Nace desde una zona tipo "ramas"
  const startY = area.top + Math.random() * Math.max(1, (area.bottom - area.top));
  el.style.top = (startY - 40) + 'px';

  // Solo dejamos el sway del CSS (movimiento lateral)
  const dur = (Math.random() * 3 + 7); // 7 a 10 s
  el.style.setProperty('--dur', dur + 's');
  el.style.setProperty('--swayDur', (Math.random() * 2 + 3) + 's');
  el.style.setProperty('--sway', (Math.random() * 55 + 15) + 'px');

  // ✅ Para que NO invada el texto: cae solo hasta stopY (borde inferior del árbol)
  const endY = area.stopY - 20;
  const delta = Math.max(60, endY - startY);

  container.appendChild(el);

  // Animación vertical controlada (no hasta 110vh)
  const anim = el.animate(
    [
      { transform: 'translateY(-30px)', opacity: 0 },
      { transform: 'translateY(0px)', opacity: 0.95, offset: 0.12 },
      { transform: `translateY(${delta}px)`, opacity: 0 }
    ],
    {
      duration: dur * 1000,
      easing: 'linear',
      fill: 'forwards'
    }
  );

  anim.onfinish = () => el.remove();
}

function startFallingPhrases() {
  if (phraseTimer) clearInterval(phraseTimer);

  // Limpia frases viejas al reiniciar (por resize)
  const container = document.getElementById('falling-phrases');
  if (container) container.innerHTML = "";

  spawnPhrase();
  phraseTimer = setInterval(() => {
    if (Math.random() < 0.8) spawnPhrase();
  }, 900);
}

// ==========================
// Inicio (sin duplicar intervalos)
// ==========================
let contadorTimer = null;

function iniciar() {
  const { w, h } = resizeCanvasToContainer();

  ctx.clearRect(0, 0, w, h);

  const startX = w / 2;
  const startY = h * 0.95;

  const len = Math.min(210, h * 0.32);
  const width = Math.min(60, w * 0.12);

  drawTree(startX, startY, len, 0, width);

  createPetals();
  startFallingPhrases();

  if (contadorTimer) clearInterval(contadorTimer);
  actualizarContador();
  contadorTimer = setInterval(actualizarContador, 1000);
}

document.addEventListener("DOMContentLoaded", iniciar);
window.addEventListener("resize", iniciar, { passive: true });
