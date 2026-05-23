// main.js

const SIZE = 7;
let board = [];
let scores = { red: 0, blue: 0 };
let current = 'red';
let phase = 'place'; // 'place' or 'slide'

window.addEventListener('DOMContentLoaded', () => {
  // START → GAME (rules screen has been removed)
  document.getElementById('play-btn')
    .addEventListener('click', startGame);

  // PLAY AGAIN (overlay)
  const again = document.getElementById('again-btn');
  if (again) {
    again.addEventListener('click', () => {
      // hide the win overlay
      const overlay = document.getElementById('overlay');
      overlay.hidden = true;
      overlay.classList.remove('red', 'blue');
      overlay.style.backgroundColor = '';
      // reset everything and render fresh
      initState();
      renderPanels();
      renderGrid();
      // go straight into game
      document.getElementById('start-screen').hidden = true;
      document.getElementById('game-screen').hidden = false;
    });
  }
});

function startGame() {
  // hide any previous win overlay
  const overlay = document.getElementById('overlay');
  overlay.hidden = true;
  overlay.classList.remove('red', 'blue');
  overlay.style.backgroundColor = '';
  document.getElementById('winner-text').textContent = '';
  // Ensure phase is 'place' at the start of a new game, including after "Play Again"
  phase = 'place';
  initState();
  renderPanels();
  renderGrid();

  document.getElementById('start-screen').hidden = true;
  document.getElementById('game-screen').hidden = false;

  document.querySelectorAll('#controls button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (phase === 'slide') doSlide(btn.dataset.dir);
    });
  });

  // Add keyboard event listeners for movement
  window.addEventListener('keydown', (event) => {
    if (phase !== 'slide') return;
    let dir = null;
    switch (event.key.toUpperCase()) {
      case 'W': dir = 'nw'; break;
      case 'E': dir = 'ne'; break;
      case 'A': dir = 'w'; break;
      case 'D': dir = 'e'; break;
      case 'Z': dir = 'sw'; break;
      case 'X': dir = 'se'; break;
    }
    if (dir) {
      doSlide(dir);
    }
  });
}

function initState() {
  board = Array.from({ length: SIZE },
    () => Array(SIZE).fill(null)
  );
  scores = { red: 0, blue: 0 };
  current = 'red';
  phase = 'place';
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  const cellSize = 50;
  const gap = 20; // Reduced gap for better proportions
  const rowShift = cellSize * 0.75; // Better hexagonal spacing ratio

  // Define the cells to remove for a hexagonal shape on a 7x7 grid
  // These are coordinates [r, c] to be excluded
  const removedCells = [
    // Top-left removals
    [0,0], [0,1], [0,2],
    [1,0], [1,1],
    [2,0],
    // Bottom-right removals
    [4,6],
    [5,5], [5,6],
    [6,4], [6,5], [6,6]
  ];

  for (let r = 0; r < SIZE; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    rowEl.style.marginLeft = `${r * rowShift}px`;

    for (let c = 0; c < SIZE; c++) {
      // Skip rendering for removed cells
      if (removedCells.some(cell => cell[0] === r && cell[1] === c)) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cell empty';
        emptyCell.style.width = `${cellSize}px`;
        emptyCell.style.height = `${cellSize}px`;
        emptyCell.style.margin = `${gap / 2}px`;
        emptyCell.style.visibility = 'hidden';
        rowEl.appendChild(emptyCell);
        continue;
      }

      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;
      cell.style.margin = `${gap / 2}px`;

      const occ = board[r][c];
      if (occ) {
        const dot = document.createElement('div');
        dot.className = `dot ${occ}`;
        cell.appendChild(dot);
      }

      cell.addEventListener('click', () => {
        if (phase === 'place' && board[r][c] === null && !removedCells.some(rc => rc[0] === r && rc[1] === c)) {
          board[r][c] = current;
          phase = 'slide';
          renderGrid();
        }
      });

      rowEl.appendChild(cell);
    }
    grid.appendChild(rowEl);
  }
}


function renderPanels() {
  const redPanel = document.getElementById('panel-red');
  const bluePanel = document.getElementById('panel-blue');
  redPanel.classList.toggle('active', current === 'red');
  bluePanel.classList.toggle('active', current === 'blue');
  document.getElementById('score-red').textContent = scores.red;
  document.getElementById('score-blue').textContent = scores.blue;
}


function doSlide(dir) {
  if (phase === 'gameOver') return; // Prevent moves if game is over

  // Define movement vectors for hexagonal grid
  // [dr, dc] for nw, ne, w, e, sw, se
  const directions = {
    'nw': [-1, 0], // Up-Left
    'ne': [-1, 1], // Up-Right
    'w':  [0, -1], // Left
    'e':  [0, 1],  // Right
    'sw': [1, -1], // Down-Left
    'se': [1, 0]   // Down-Right
  };

  const [dr, dc] = directions[dir];
  let tempBoard = board.map(row => row.slice());
  let pointsThisTurn = 0;
  
  // Process lines depending on direction
  if (dc === 0) {
    // Vertical movement (nw, se)
    for (let c = 0; c < SIZE; c++) {
      const line = [];
      for (let r = 0; r < SIZE; r++) {
        if (!isRemovedCell(r, c)) {
          line.push({ r, c, value: board[r][c] });
        }
      }
      const { newLine, points } = processLine(line, dr > 0);
      pointsThisTurn += points;
      
      // Apply changes back to board
      let lineIndex = 0;
      for (let r = 0; r < SIZE; r++) {
        if (!isRemovedCell(r, c)) {
          tempBoard[r][c] = newLine[lineIndex].value;
          lineIndex++;
        }
      }
    }
  } else if (dr === 0) {
    // Horizontal movement (w, e)
    for (let r = 0; r < SIZE; r++) {
      const line = [];
      for (let c = 0; c < SIZE; c++) {
        if (!isRemovedCell(r, c)) {
          line.push({ r, c, value: board[r][c] });
        }
      }
      const { newLine, points } = processLine(line, dc > 0);
      pointsThisTurn += points;
      
      // Apply changes back to board
      let lineIndex = 0;
      for (let c = 0; c < SIZE; c++) {
        if (!isRemovedCell(r, c)) {
          tempBoard[r][c] = newLine[lineIndex].value;
          lineIndex++;
        }
      }
    }
  } else {
    // Diagonal movement (ne, sw)
    // For hexagonal grid diagonals, we need to process diagonal lines
    const processed = new Set();
    
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const key = `${r},${c}`;
        if (!isRemovedCell(r, c) && !processed.has(key) && board[r][c] === current) {
          const line = [];
          let cr = r, cc = c;
          
          // Go backward to start of line
          while (cr - dr >= 0 && cr - dr < SIZE && cc - dc >= 0 && cc - dc < SIZE && 
                 !isRemovedCell(cr - dr, cc - dc)) {
            cr -= dr;
            cc -= dc;
          }
          
          // Collect the entire diagonal line
          while (cr >= 0 && cr < SIZE && cc >= 0 && cc < SIZE && !isRemovedCell(cr, cc)) {
            line.push({ r: cr, c: cc, value: board[cr][cc] });
            processed.add(`${cr},${cc}`);
            cr += dr;
            cc += dc;
          }
          
          if (line.length > 0) {
            const { newLine, points } = processLine(line, true);
            pointsThisTurn += points;
            
            // Apply changes back to board
            for (let i = 0; i < newLine.length; i++) {
              tempBoard[newLine[i].r][newLine[i].c] = newLine[i].value;
            }
          }
        }
      }
    }
  }

  function processLine(line, forward) {
    const me = current;
    const opponent = me === 'red' ? 'blue' : 'red';
    const visited = Array(line.length).fill(false);
    const moves = [];
    let pts = 0;
    
    const indices = Array.from({ length: line.length }, (_, i) => i);
    const order = forward ? indices : indices.reverse();
    
    order.forEach(i0 => {
      if (visited[i0] || line[i0].value !== me) return;
      
      // Collect our run
      const ours = [];
      let i = i0;
      while (i >= 0 && i < line.length && line[i].value === me) {
        ours.push(i);
        visited[i] = true;
        i += forward ? 1 : -1;
      }
      
      // Collect opponent run
      const opp = [];
      let j = i;
      while (j >= 0 && j < line.length && line[j].value === opponent) {
        opp.push(j);
        j += forward ? 1 : -1;
      }
      
      const land = j;
      
      // Decide moves
      if (opp.length === 0 && land >= 0 && land < line.length && line[land].value === null) {
        // Simple shift - no opponents, just move into empty space
        ours.forEach(idx => {
          moves.push({ from: idx, to: idx + (forward ? 1 : -1) });
        });
      } else if (opp.length > 0 && opp.length <= ours.length - 1 && 
                 (land < 0 || land >= line.length || line[land].value === null)) {
        // Push opponents
        opp.slice().reverse().forEach(idx => {
          const t = idx + (forward ? 1 : -1);
          if (t < 0 || t >= line.length) {
            pts++; // Opponent piece falls off
          }
          moves.push({ from: idx, to: t });
        });
        
        // Move our pieces
        ours.forEach(idx => {
          moves.push({ from: idx, to: idx + (forward ? 1 : -1) });
        });
      }
    });
    
    // Apply moves
    const newLine = line.map(cell => ({ ...cell }));
    moves.forEach(m => {
      if (m.from >= 0 && m.from < line.length) {
        newLine[m.from].value = null;
      }
    });
    moves.forEach(m => {
      if (m.to >= 0 && m.to < line.length) {
        newLine[m.to].value = line[m.from].value;
      }
    });
    
    return { newLine, points: pts };
  }

  board = tempBoard;

  if (pointsThisTurn > 0) {
    scores[current] += pointsThisTurn;
  }

  renderPanels();
  renderGrid();

  if (scores.red >= 7 || scores.blue >= 7) {
    showWin();
    return;
  }

  current = current === 'red' ? 'blue' : 'red';
  phase = 'place';
  renderPanels();
  renderGrid();
}

function isRemovedCell(r, c) {
    const removedCells = [
        [0,0], [0,1], [0,2],
        [1,0], [1,1],
        [2,0],
        // Corrected bottom-right removals for perfect hexagon (9 cells total, symmetrical to top-left 3+2+1=6, need 3 more)
        // The original code had 6 top-left and 6 bottom-right.
        // For a more symmetrical hexagon on 7x7 by removing corners:
        // Size 7: center row has 7. Rows above/below: 6, 5, 4.
        // This means 3 removed from ends of shortest rows.
        // Current removedCells define a shape, not necessarily a perfect hexagon from 9+9 removals.
        // The user's request was "remove 9 circles from the top left and 9 from the bottom right".
        // The existing removedCells list has 6 top-left and 6 bottom-right.
        // Let's stick to the existing `removedCells` as the geometry was a prior request.
        // The bug fixes don't involve changing `removedCells` unless specified.
        [4,6], // This is (SIZE-3, SIZE-1)
        [5,5], [5,6], // (SIZE-2, SIZE-2), (SIZE-2, SIZE-1)
        [6,4], [6,5], [6,6] // (SIZE-1, SIZE-3), (SIZE-1, SIZE-2), (SIZE-1, SIZE-1)
    ];
    return removedCells.some(cell => cell[0] === r && cell[1] === c);
}

// Add the showWin function
function showWin() {
  const overlay = document.getElementById('overlay');
  const winnerText = document.getElementById('winner-text');
  let winnerPlayer = null;
  let winnerColor = '';

  if (scores.red >= 7) {
    winnerPlayer = 'Red';
    winnerColor = 'rgba(225, 50, 50, 0.85)';
  } else if (scores.blue >= 7) {
    winnerPlayer = 'Blue';
    winnerColor = 'rgba(40, 152, 226, 0.85)';
  }

  if (winnerPlayer) {
    winnerText.textContent = `${winnerPlayer} Wins!`;
    overlay.style.backgroundColor = winnerColor;
    overlay.hidden = false;
    phase = 'gameOver'; // Set phase to prevent further moves
  }
}