// main.js

const SIZE = 7;
let board = [];
let scores  = { red: 0, blue: 0 };
let current = 'red';
let phase   = 'place'; // 'place' | 'slide' | 'gameOver'
let playerNames = { red: 'Red', blue: 'Blue' };

const REMOVED_CELLS = [
  [0,0],[0,1],[0,2],
  [1,0],[1,1],
  [2,0],
  [4,6],
  [5,5],[5,6],
  [6,4],[6,5],[6,6]
];

function isRemovedCell(r, c) {
  return REMOVED_CELLS.some(([rr,cc]) => rr === r && cc === c);
}

// Map from "r,c" -> cell DOM element (built once, reused forever)
const cellEls = new Map();

// ── Bootstrap ────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  // Start screen → name modal
  document.getElementById('play-btn').addEventListener('click', () => {
    document.getElementById('start-screen').hidden = true;
    document.getElementById('name-modal').hidden   = false;
    document.getElementById('name-red').focus();
  });

  // Name modal: Enter key navigation
  document.getElementById('name-red').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('name-blue').focus();
  });
  document.getElementById('name-blue').addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmNames();
  });
  document.getElementById('confirm-names-btn').addEventListener('click', confirmNames);

  // "New Game" from win overlay → back to name modal
  document.getElementById('again-btn').addEventListener('click', () => {
    const overlay = document.getElementById('overlay');
    overlay.hidden = true;
    overlay.className = '';
    overlay.querySelector('#confetti-area').innerHTML = '';

    document.getElementById('game-screen').hidden  = true;
    document.getElementById('name-modal').hidden   = false;
    // Pre-fill names so returning players don't have to retype
    const rInput = document.getElementById('name-red');
    const bInput = document.getElementById('name-blue');
    rInput.value = playerNames.red  === 'Red'  ? '' : playerNames.red;
    bInput.value = playerNames.blue === 'Blue' ? '' : playerNames.blue;
    rInput.focus();
  });

  // Direction controls
  document.querySelectorAll('#controls button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (phase === 'slide') doSlide(btn.dataset.dir);
    });
  });

  // Keyboard shortcuts
  const keyMap = { W:'nw', E:'ne', A:'w', D:'e', Z:'sw', X:'se' };
  window.addEventListener('keydown', e => {
    if (phase !== 'slide') return;
    const dir = keyMap[e.key.toUpperCase()];
    if (dir) doSlide(dir);
  });
});

// ── Name confirmation ────────────────────────────────────────

function confirmNames() {
  playerNames.red  = document.getElementById('name-red').value.trim()  || 'Red';
  playerNames.blue = document.getElementById('name-blue').value.trim() || 'Blue';

  document.getElementById('name-modal').hidden  = true;
  document.getElementById('game-screen').hidden = false;

  initState();
  buildGrid();       // build DOM once
  renderHolders();
  renderPanels();
}

// ── State ────────────────────────────────────────────────────

function initState() {
  board   = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  scores  = { red: 0, blue: 0 };
  current = 'red';
  phase   = 'place';
}

// ── Grid (built once, updated incrementally) ─────────────────

function buildGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  cellEls.clear();

  const cellSize = 50;
  const gap      = 20;
  const rowShift = cellSize * 0.75;

  for (let r = 0; r < SIZE; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    rowEl.style.marginLeft = `${r * rowShift}px`;

    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement('div');

      if (isRemovedCell(r, c)) {
        cell.className  = 'cell empty';
        cell.style.cssText =
          `width:${cellSize}px;height:${cellSize}px;margin:${gap/2}px;visibility:hidden`;
        rowEl.appendChild(cell);
        continue;
      }

      cell.className  = 'cell';
      cell.dataset.r  = r;
      cell.dataset.c  = c;
      cell.style.cssText = `width:${cellSize}px;height:${cellSize}px;margin:${gap/2}px`;
      cell.addEventListener('click', handleCellClick);

      cellEls.set(`${r},${c}`, cell);
      rowEl.appendChild(cell);
    }
    grid.appendChild(rowEl);
  }
}

// Place stone — only touches the one clicked cell, no full re-render
function handleCellClick() {
  const r = parseInt(this.dataset.r);
  const c = parseInt(this.dataset.c);
  if (phase !== 'place' || board[r][c] !== null) return;

  board[r][c] = current;
  phase = 'slide';

  addDot(this, current, true);  // animated
  renderPanels();
}

function addDot(cell, color, animated) {
  const dot = document.createElement('div');
  dot.className = `dot ${color}${animated ? ' animate' : ''}`;
  cell.appendChild(dot);
}

// After a slide: only update cells whose content changed.
// Stones that didn't move are untouched — no flicker, no re-animation.
function updateGridAfterSlide(oldBoard) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (isRemovedCell(r, c)) continue;
      const cell    = cellEls.get(`${r},${c}`);
      const oldVal  = oldBoard[r][c];
      const newVal  = board[r][c];
      if (oldVal === newVal) continue;

      cell.innerHTML = '';
      if (newVal) addDot(cell, newVal, true);
    }
  }
}

// ── UI rendering ─────────────────────────────────────────────

function renderPanels() {
  const isRed  = current === 'red';
  document.getElementById('panel-red').classList.toggle('active', isRed);
  document.getElementById('panel-blue').classList.toggle('active', !isRed);

  document.getElementById('red-name-display').textContent  = playerNames.red;
  document.getElementById('blue-name-display').textContent = playerNames.blue;

  // Stage indicator
  document.getElementById('stage-name').textContent   = playerNames[current];
  document.getElementById('stage-action').textContent =
    phase === 'place' ? 'Place Stone' : 'Move Stones';
  document.getElementById('stage-dot').className =
    `stage-dot ${current}`;
}

function renderHolders() {
  renderPlayerHolders('red');
  renderPlayerHolders('blue');
}

function renderPlayerHolders(color) {
  const el = document.getElementById(`holders-${color}`);
  el.innerHTML = '';
  const captured = color === 'red' ? 'blue' : 'red'; // captured stones show opponent's color
  for (let i = 0; i < 7; i++) {
    const slot = document.createElement('div');
    slot.className = 'holder-slot';
    if (i < scores[color]) {
      const dot = document.createElement('div');
      dot.className = `holder-dot ${captured}`;
      slot.appendChild(dot);
    }
    el.appendChild(slot);
  }
}

// ── Slide logic ───────────────────────────────────────────────

function doSlide(dir) {
  if (phase !== 'slide') return;

  const vectors = {
    nw:[-1, 0], ne:[-1, 1],
    w: [ 0,-1], e: [ 0, 1],
    sw:[ 1,-1], se:[ 1, 0]
  };
  const [dr, dc] = vectors[dir];
  const oldBoard  = board.map(row => row.slice());
  const tempBoard = board.map(row => row.slice());
  let gained = 0;

  function processLine(line, forward) {
    const me  = current;
    const opp = me === 'red' ? 'blue' : 'red';
    const visited = Array(line.length).fill(false);
    const moves   = [];
    let pts = 0;

    const idxs = Array.from({ length: line.length }, (_, i) => i);
    const order = forward ? idxs : [...idxs].reverse();

    order.forEach(i0 => {
      if (visited[i0] || line[i0].value !== me) return;

      // Collect our run
      const ours = [];
      let i = i0;
      while (i >= 0 && i < line.length && line[i].value === me) {
        ours.push(i); visited[i] = true; i += forward ? 1 : -1;
      }
      // Collect opponent run
      const oppRun = [];
      let j = i;
      while (j >= 0 && j < line.length && line[j].value === opp) {
        oppRun.push(j); j += forward ? 1 : -1;
      }
      const land = j;

      if (oppRun.length === 0 && land >= 0 && land < line.length && line[land].value === null) {
        ours.forEach(idx => moves.push({ from: idx, to: idx + (forward ? 1 : -1) }));
      } else if (
        oppRun.length > 0 &&
        oppRun.length <= ours.length - 1 &&
        (land < 0 || land >= line.length || line[land].value === null)
      ) {
        oppRun.slice().reverse().forEach(idx => {
          const t = idx + (forward ? 1 : -1);
          if (t < 0 || t >= line.length) pts++;
          moves.push({ from: idx, to: t });
        });
        ours.forEach(idx => moves.push({ from: idx, to: idx + (forward ? 1 : -1) }));
      }
    });

    const newLine = line.map(cell => ({ ...cell }));
    moves.forEach(m => { if (m.from >= 0 && m.from < line.length) newLine[m.from].value = null; });
    moves.forEach(m => { if (m.to   >= 0 && m.to   < line.length) newLine[m.to].value   = line[m.from].value; });

    return { newLine, points: pts };
  }

  if (dc === 0) {
    // Vertical (nw/se)
    const forward = dr > 0;
    for (let c = 0; c < SIZE; c++) {
      const line = [];
      for (let r = 0; r < SIZE; r++)
        if (!isRemovedCell(r, c)) line.push({ r, c, value: board[r][c] });
      const { newLine, points } = processLine(line, forward);
      gained += points;
      let li = 0;
      for (let r = 0; r < SIZE; r++)
        if (!isRemovedCell(r, c)) tempBoard[r][c] = newLine[li++].value;
    }
  } else if (dr === 0) {
    // Horizontal (w/e)
    const forward = dc > 0;
    for (let r = 0; r < SIZE; r++) {
      const line = [];
      for (let c = 0; c < SIZE; c++)
        if (!isRemovedCell(r, c)) line.push({ r, c, value: board[r][c] });
      const { newLine, points } = processLine(line, forward);
      gained += points;
      let li = 0;
      for (let c = 0; c < SIZE; c++)
        if (!isRemovedCell(r, c)) tempBoard[r][c] = newLine[li++].value;
    }
  } else {
    // Diagonal (ne/sw)
    const processed = new Set();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const key = `${r},${c}`;
        if (isRemovedCell(r, c) || processed.has(key) || board[r][c] !== current) continue;

        let cr = r, cc = c;
        while (cr-dr >= 0 && cr-dr < SIZE && cc-dc >= 0 && cc-dc < SIZE &&
               !isRemovedCell(cr-dr, cc-dc)) { cr -= dr; cc -= dc; }

        const line = [];
        while (cr >= 0 && cr < SIZE && cc >= 0 && cc < SIZE && !isRemovedCell(cr, cc)) {
          line.push({ r: cr, c: cc, value: board[cr][cc] });
          processed.add(`${cr},${cc}`);
          cr += dr; cc += dc;
        }

        if (line.length > 0) {
          const { newLine, points } = processLine(line, true);
          gained += points;
          for (let i = 0; i < newLine.length; i++)
            tempBoard[newLine[i].r][newLine[i].c] = newLine[i].value;
        }
      }
    }
  }

  board = tempBoard;
  if (gained > 0) scores[current] += gained;

  updateGridAfterSlide(oldBoard);
  renderHolders();

  if (scores.red >= 7 || scores.blue >= 7) {
    showWin(); return;
  }

  current = current === 'red' ? 'blue' : 'red';
  phase   = 'place';
  renderPanels();
}

// ── Win screen ────────────────────────────────────────────────

function showWin() {
  phase = 'gameOver';
  const winner  = scores.red >= 7 ? 'red' : 'blue';
  const overlay = document.getElementById('overlay');

  document.getElementById('winner-text').textContent = `${playerNames[winner]} Wins!`;
  overlay.className = winner;
  overlay.hidden    = false;

  spawnRipples();
}

function spawnRipples() {
  const area = document.getElementById('confetti-area');
  const delays = [0, 0.4, 0.8, 1.2];
  delays.forEach(delay => {
    const ring = document.createElement('div');
    ring.className = 'ripple-ring';
    ring.style.animationDelay = `${delay}s`;
    area.appendChild(ring);
  });
}
