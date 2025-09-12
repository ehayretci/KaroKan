/**
 * @typedef {"red"|"blue"} Player
 * @typedef {"place"|"slide"} Phase
 * @typedef {Player|null} Cell
 * @typedef {Cell[][]} Grid
 * @typedef {{ red: number, blue: number }} Scores
 *
 * @typedef {object} GameState
 * @property {Grid} grid       SIZE×SIZE array of Cell
 * @property {Scores} scores
 * @property {Player} current
 * @property {Phase} phase
 */

// Board size constant
const SIZE = 7;

// These coordinates are present in the 7×7 array but
// are “cut out” to form the hexagonal play area.
const REMOVED_CELLS = [
  [0,0], [0,1], [0,2],
  [1,0], [1,1],
  [2,0],
  [4,6],
  [5,5], [5,6],
  [6,4], [6,5], [6,6]
];

/**
 * @returns {boolean} True if (r,c) is one of the hexagon’s removed cells.
 */
function isRemovedCell(r, c) {
  return REMOVED_CELLS.some(([rr, cc]) => rr === r && cc === c);
}

/**
 * Create a fresh SIZE×SIZE game.
 * @returns {GameState}
 */
function createGame() {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  return {
    grid,
    scores: { red: 0, blue: 0 },
    current: "red",
    phase: "place"
  };
}

/**
 * Get a deep copy of the state so callers can't mutate it directly.
 * @param {GameState} state
 * @returns {GameState}
 */
function getState(state) {
  return {
    grid: state.grid.map(row => row.slice()),
    scores: { ...state.scores },
    current: state.current,
    phase: state.phase
  };
}

/**
 * Place a stone of the current player at (r,c).
 * Switches phase to "slide".
 * @param {GameState} state
 * @param {number} r  row index 0–SIZE-1
 * @param {number} c  col index 0–SIZE-1
 * @returns {GameState}
 * @throws if out of bounds, removed cell, or occupied
 */
function placeBall(state, r, c) {
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) {
    throw new Error("placeBall: out of bounds");
  }
  if (isRemovedCell(r, c)) {
    throw new Error("placeBall: cell removed");
  }
  if (state.grid[r][c] !== null) {
    throw new Error("placeBall: cell occupied");
  }
  const ns = getState(state);
  ns.grid[r][c] = state.current;
  ns.phase = "slide";
  return ns;
}

/**
 * Slide all stones in one direction ("up","down","left","right").
 * Applies push rules and updates scores.
 * Resets phase to "place" and flips current.
 * @param {GameState} state
 * @param {"up"|"down"|"left"|"right"} dir
 * @returns {GameState}
 */
function slide(state, dir) {
  if (state.phase !== "slide") {
    throw new Error("Must slide only in slide phase");
  }
  const ns = getState(state);
  const me = state.current;
  const you = me === "red" ? "blue" : "red";
  let gained = 0;

  /**
   * Process one line (array of SIZE cells).
   */
  function slideLine(arr, forward) {
    const N = arr.length;
    const visited = Array(N).fill(false);
    const moves = [];
    let pts = 0;
    const indices = [...Array(N).keys()];
    const order = forward ? indices : indices.reverse();

    order.forEach(i0 => {
      if (visited[i0] || arr[i0] !== me) return;
      // collect our run
      const ours = [];
      let i = i0;
      while (i >= 0 && i < N && arr[i] === me) {
        ours.push(i);
        visited[i] = true;
        i += forward ? 1 : -1;
      }
      // collect opponent run
      const opp = [];
      let j = i;
      while (j >= 0 && j < N && arr[j] === you) {
        opp.push(j);
        j += forward ? 1 : -1;
      }
      const land = j;
      // decide moves
      if (
        opp.length === 0 &&
        land >= 0 && land < N &&
        arr[land] === null
      ) {
        // shift ours
        ours.forEach(idx => {
          moves.push({ from: idx, to: idx + (forward ? 1 : -1) });
        });
      } else if (
        opp.length > 0 &&
        opp.length <= ours.length - 1 &&
        (land < 0 || land >= N || arr[land] === null)
      ) {
        // push opponent
        opp.slice().reverse().forEach(idx => {
          const t = idx + (forward ? 1 : -1);
          if (t < 0 || t >= N) pts++;
          moves.push({ from: idx, to: t });
        });
        // shift ours
        ours.forEach(idx => {
          moves.push({ from: idx, to: idx + (forward ? 1 : -1) });
        });
      }
    });

    // apply moves
    const line = arr.slice();
    moves.forEach(m => {
      if (m.from >= 0 && m.from < N) {
        line[m.from] = null;
      }
    });
    moves.forEach(m => {
      if (m.to >= 0 && m.to < N) {
        line[m.to] = arr[m.from];
      }
    });

    return { line, pts };
  }

  // process columns or rows
  if (dir === "up" || dir === "down") {
    const forward = dir === "down";
    for (let c = 0; c < SIZE; c++) {
      const col = ns.grid.map(r => r[c]);
      const { line, pts } = slideLine(col, forward);
      gained += pts;
      for (let r = 0; r < SIZE; r++) {
        ns.grid[r][c] = line[r];
      }
    }
  } else {
    const forward = dir === "right";
    for (let r = 0; r < SIZE; r++) {
      const row = ns.grid[r].slice();
      const { line, pts } = slideLine(row, forward);
      gained += pts;
      ns.grid[r] = line;
    }
  }

  // update scores (points awarded to current)
  if (gained > 0) {
    ns.scores[state.current] += gained;
  }

  // next turn
  ns.current = you;
  ns.phase = "place";
  return ns;
}

/**
 * Returns "red" or "blue" if one has ≥7 points, else null.
 * @param {GameState} state
 * @returns {Player|null}
 */
function getWinner(state) {
  if (state.scores.red >= 7) return "red";
  if (state.scores.blue >= 7) return "blue";
  return null;
}

export {
  SIZE,
  createGame,
  getState,
  isRemovedCell,
  placeBall,
  slide,
  getWinner
};
