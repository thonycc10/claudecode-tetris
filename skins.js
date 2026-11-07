'use strict';

// ---- Skins: { colors, drawBlock }. Persistidas en localStorage ----
const SKIN_KEY = 'tetris-skin';
const skinSelect = document.getElementById('skin-select');

function skinRect(context, px, py, w, h, r) {
  context.beginPath();
  context.moveTo(px + r, py);
  context.lineTo(px + w - r, py);
  context.quadraticCurveTo(px + w, py, px + w, py + r);
  context.lineTo(px + w, py + h - r);
  context.quadraticCurveTo(px + w, py + h, px + w - r, py + h);
  context.lineTo(px + r, py + h);
  context.quadraticCurveTo(px, py + h, px, py + h - r);
  context.lineTo(px, py + r);
  context.quadraticCurveTo(px, py, px + r, py);
  context.closePath();
}

const SKINS = {
  retro: {
    colors: COLORS.slice(),
    drawBlock(context, x, y, i, size, alpha) {
      context.globalAlpha = alpha;
      context.fillStyle = this.colors[i];
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      context.fillStyle = themeColors.highlight;
      context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
    },
  },
  neon: {
    colors: [null, '#00f0ff', '#fff700', '#d400ff', '#39ff14', '#ff1744', '#4d6bff', '#ff8c00'],
    drawBlock(context, x, y, i, size, alpha) {
      const color = this.colors[i];
      const px = x * size + 3, py = y * size + 3, s = size - 6;
      context.globalAlpha = alpha;
      context.shadowColor = color;
      context.shadowBlur = 12;
      context.fillStyle = '#000';
      context.fillRect(px, py, s, s);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.strokeRect(px, py, s, s);
      context.shadowBlur = 0;
      context.globalAlpha = alpha * 0.35;
      context.fillStyle = color;
      context.fillRect(px + 3, py + 3, s - 6, s - 6);
    },
  },
  pastel: {
    colors: [null, '#a8e6ef', '#fff1b8', '#d9b8e6', '#bfe8c4', '#f7bcbc', '#b8c1ee', '#fcd9a8'],
    drawBlock(context, x, y, i, size, alpha) {
      context.globalAlpha = alpha;
      context.fillStyle = this.colors[i];
      skinRect(context, x * size + 1.5, y * size + 1.5, size - 3, size - 3, 8);
      context.fill();
      context.strokeStyle = 'rgba(120,120,140,0.45)'; // visible en claro y oscuro
      context.lineWidth = 1.5;
      context.stroke();
      context.fillStyle = 'rgba(255,255,255,0.35)';
      skinRect(context, x * size + 5, y * size + 5, size - 10, 5, 2.5);
      context.fill();
    },
  },
  pixel: {
    colors: [null, '#3fb5c4', '#e0b030', '#9a4fb0', '#4f9a54', '#c24848', '#4f5fb0', '#d98a2a'],
    drawBlock(context, x, y, i, size, alpha) {
      const px = x * size, py = y * size, u = size / 6; // rejilla 6x6
      context.globalAlpha = alpha;
      context.fillStyle = this.colors[i];
      context.fillRect(px, py, size, size);
      // sombra (borde inferior/derecho) y luz (superior/izquierdo)
      context.fillStyle = 'rgba(0,0,0,0.35)';
      context.fillRect(px, py + size - u, size, u);
      context.fillRect(px + size - u, py, u, size);
      context.fillStyle = 'rgba(255,255,255,0.4)';
      context.fillRect(px, py, size - u, u);
      context.fillRect(px, py, u, size - u);
      // textura de damero
      context.fillStyle = 'rgba(0,0,0,0.15)';
      for (let a = 1; a < 5; a++)
        for (let b = 1; b < 5; b++)
          if ((a + b) % 2) context.fillRect(px + a * u, py + b * u, u, u);
      context.fillStyle = 'rgba(255,255,255,0.5)';
      context.fillRect(px + 2 * u, py + 2 * u, u, u);
    },
  },
};

let activeSkin = SKINS.retro;

function storedSkin() {
  try {
    const v = localStorage.getItem(SKIN_KEY);
    return Object.prototype.hasOwnProperty.call(SKINS, v) ? v : 'retro';
  } catch (e) {
    return 'retro';
  }
}

function applySkin(name) {
  if (!Object.prototype.hasOwnProperty.call(SKINS, name)) name = 'retro';
  activeSkin = SKINS[name];
  canvas.classList.toggle('skin-neon', name === 'neon');
  skinSelect.value = name;
  // el loop no corre en pausa/game over: repintar manualmente
  if (current && next) { draw(); drawNext(); }
}

skinSelect.addEventListener('change', () => {
  try { localStorage.setItem(SKIN_KEY, skinSelect.value); } catch (e) {}
  applySkin(skinSelect.value);
  skinSelect.blur(); // evita que Space abra el select en vez de la caída
});

// teclas con el select enfocado no deben mover la pieza
skinSelect.addEventListener('keydown', e => {
  e.stopPropagation();
  if (e.code === 'Escape' || e.code === 'Enter') skinSelect.blur();
});

applySkin(storedSkin());
