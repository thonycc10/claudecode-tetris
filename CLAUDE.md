# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vanilla JS Tetris (HTML5 Canvas). No dependencies, no build, no tests, no linter. README is in Spanish.

## Run

- Open `index.html` directly, or serve: `python3 -m http.server 8000` / `npx serve .`

## Architecture

Three files: `index.html` (DOM: `#board`, `#next-canvas`, HUD ids `score`/`lines`/`level`, `#overlay` w/ `#restart-btn`), `style.css`, `game.js` (all logic, no modules).

`game.js` is a single global-state script:
- Constants at top: `COLS`=10, `ROWS`=20, `BLOCK`=30px, `COLORS`, `PIECES` (7 shapes as matrices), `LINE_SCORES` (score is multiplied by level).
- State vars (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, `dropInterval`, etc.) are module-level `let`s, reset in `init()`.
- Flow: `init()` → `requestAnimationFrame(loop)`; `loop` accumulates `dropAccum` vs `dropInterval` (shrinks with level) → `softDrop` → `lockPiece` (`merge`, `clearLines`, `spawn`) → `endGame` if spawn collides.
- `collide(shape, ox, oy)` is the shared collision check used by movement, rotation (`rotateCW` + wall kicks in `tryRotate`), ghost (`ghostY`) and hard drop.
- Rendering: `draw()` (board, grid, ghost, current piece) and `drawNext()`; `drawBlock` is the shared cell painter.

## Misc

`.agents/`, `.claude/skills/`, `skills-lock.json` hold installed Claude skills (e.g. caveman), not game code.
