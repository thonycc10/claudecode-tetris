'use strict';
// Pause menu: Reanudar / Reiniciar / Ver controles / Nivel inicial.
(function () {
  const menu = document.getElementById('pause-menu');
  const sel = document.getElementById('pm-start-level');
  const list = document.getElementById('pm-controls-list');
  const ctlBtn = document.getElementById('pm-controls');

  for (let i = 1; i <= 10; i++) sel.add(new Option(i, i));
  sel.value = startLevel;
  let chosenLevel = startLevel;
  // Selected level applies only when a new game starts, never mid-game.
  const origInit = init;
  init = function () { startLevel = chosenLevel; origInit(); };

  function sync() {
    const open = paused && !gameOver;
    menu.classList.toggle('hidden', !open);
    restartBtn.classList.toggle('hidden', open);
    if (!open) {
      list.classList.add('hidden');
      ctlBtn.setAttribute('aria-expanded', 'false');
    }
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  }

  const origToggle = togglePause;
  togglePause = function () { origToggle(); sync(); };

  document.getElementById('pm-resume').addEventListener('click', () => togglePause());
  document.getElementById('pm-restart').addEventListener('click', () => { init(); sync(); });
  ctlBtn.addEventListener('click', () => {
    const show = !list.classList.toggle('hidden');
    ctlBtn.setAttribute('aria-expanded', String(show));
    ctlBtn.blur();
  });
  sel.addEventListener('change', () => {
    chosenLevel = parseInt(sel.value, 10);
    sel.blur();
  });

  // Swallow Space/Enter while menu open so they never hit focused controls or the game.
  const swallow = e => {
    if (paused && !gameOver && (e.code === 'Space' || e.code === 'Enter')) e.preventDefault();
  };
  document.addEventListener('keydown', swallow, true);
  document.addEventListener('keyup', swallow, true);
})();
