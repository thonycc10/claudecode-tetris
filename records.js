'use strict';

// ---- Records locales (localStorage) ----
(function () {
  const RECORDS_KEY = 'tetris-records';
  const TOP_N = 5;
  const NAME_MAX = 12;

  const goEl = document.getElementById('records-go');
  const startEl = document.getElementById('records-start');
  const startOverlay = document.getElementById('start-overlay');
  const startBtn = document.getElementById('start-btn');

  let data = load();
  let combo = 0;      // locks consecutivos que limpian líneas
  let bestCombo = 0;  // mejor combo de la partida actual
  let highlightId = null;
  let pendingEntry = null; // récord pendiente de nombre

  function load() {
    const empty = { top: [], bestCombo: 0, maxLines: 0 };
    try {
      const raw = JSON.parse(localStorage.getItem(RECORDS_KEY));
      if (!raw || !Array.isArray(raw.top)) return empty;
      return {
        top: raw.top
          .filter(e => e && Number.isFinite(e.score))
          .map(e => ({ id: String(e.id || ''), name: String(e.name || 'ANÓNIMO').slice(0, NAME_MAX), score: e.score, lines: Number(e.lines) || 0 }))
          .slice(0, TOP_N),
        bestCombo: Number(raw.bestCombo) || 0,
        maxLines: Number(raw.maxLines) || 0,
      };
    } catch (e) {
      return empty;
    }
  }

  function save() {
    try { localStorage.setItem(RECORDS_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function qualifies(score) {
    if (score <= 0) return false;
    return data.top.length < TOP_N || score > data.top[data.top.length - 1].score;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function renderTable() {
    const wrap = el('div');
    const t = el('table', 'rec-table');
    t.appendChild(el('caption', '', 'MEJORES PUNTUACIONES'));
    const head = el('tr');
    ['#', 'Nombre', 'Puntos'].forEach((h, i) => head.appendChild(el('th', i === 2 ? 'num' : '', h)));
    t.appendChild(head);
    if (!data.top.length) {
      const tr = el('tr');
      const td = el('td', '', 'Sin récords aún');
      td.colSpan = 3;
      tr.appendChild(td);
      t.appendChild(tr);
    }
    data.top.forEach((e, i) => {
      const tr = el('tr', e.id && e.id === highlightId ? 'rec-hl' : '');
      tr.appendChild(el('td', '', String(i + 1)));
      tr.appendChild(el('td', '', e.name));
      tr.appendChild(el('td', 'num', e.score.toLocaleString()));
      t.appendChild(tr);
    });
    wrap.appendChild(t);
    wrap.appendChild(el('p', 'rec-stats', `Mejor combo: ${data.bestCombo} · Máx. líneas: ${data.maxLines}`));
    const reset = el('button', 'rec-btn small', 'Borrar récords');
    reset.type = 'button';
    reset.addEventListener('click', () => {
      if (!confirm('¿Borrar todos los récords?')) return;
      data = { top: [], bestCombo: 0, maxLines: 0 };
      highlightId = null;
      save();
      renderStart();
      if (!goEl.classList.contains('hidden')) renderGo(pendingEntry);
    });
    wrap.appendChild(reset);
    return wrap;
  }

  function renderStart() {
    startEl.replaceChildren(renderTable());
  }

  function renderGo(pending) {
    pendingEntry = pending;
    goEl.replaceChildren();
    goEl.classList.remove('hidden');
    if (pending) {
      const form = el('form', 'rec-form');
      const input = el('input');
      input.type = 'text';
      input.maxLength = NAME_MAX;
      input.placeholder = '¡Récord! Tu nombre';
      input.setAttribute('aria-label', 'Nombre');
      input.autocomplete = 'off';
      // las teclas del input no deben llegar al handler del juego
      input.addEventListener('keydown', e => e.stopPropagation());
      const ok = el('button', 'rec-btn small', 'Guardar');
      ok.type = 'submit';
      form.append(input, ok);
      form.addEventListener('submit', e => {
        e.preventDefault();
        submit(pending, input.value);
      });
      goEl.appendChild(form);
      input.focus();
    }
    goEl.appendChild(renderTable());
  }

  function submit(pending, rawName) {
    const name = rawName.trim().slice(0, NAME_MAX) || 'ANÓNIMO';
    const entry = { id: Date.now() + Math.random().toString(36).slice(2, 6), name, score: pending.score, lines: pending.lines };
    data.top.push(entry);
    data.top.sort((a, b) => b.score - a.score);
    data.top = data.top.slice(0, TOP_N);
    highlightId = entry.id;
    save();
    renderGo(null);
    document.getElementById('restart-btn').focus();
  }

  window.Records = {
    reset() {
      combo = 0;
      bestCombo = 0;
      highlightId = null;
      pendingEntry = null;
      goEl.classList.add('hidden');
      goEl.replaceChildren();
    },
    onLock(cleared) {
      if (cleared > 0) {
        combo++;
        if (combo > bestCombo) bestCombo = combo;
      } else {
        combo = 0;
      }
    },
    onGameOver(score, lines) {
      let changed = false;
      if (bestCombo > data.bestCombo) { data.bestCombo = bestCombo; changed = true; }
      if (lines > data.maxLines) { data.maxLines = lines; changed = true; }
      if (changed) save();
      renderGo(qualifies(score) ? { score, lines } : null);
    },
  };

  startBtn.addEventListener('click', () => {
    startOverlay.classList.add('hidden');
    startBtn.blur(); // evita que Space reactive el botón
    init();
  });

  // pantalla de inicio: detener la partida auto-iniciada por game.js
  cancelAnimationFrame(animId);
  gameOver = true; // bloquea teclas (incl. P) hasta pulsar Empezar
  renderStart();
  startOverlay.classList.remove('hidden');
  startBtn.focus();
})();
