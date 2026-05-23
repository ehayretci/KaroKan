# karokan

A fast, two-player abstract strategy game played on a hexagonal board. Place a piece each turn, then slide all of your pieces one step in a chosen direction. Push your opponent off the board to score — first to **7 points** wins.

**Live demo:** [karokan.netlify.app](https://karokan.netlify.app)

---

## Gameplay at a glance

- **Objective** — be the first to reach **7 points** by pushing the opponent's pieces off the board.
- **Turn** — place one dot on any empty cell, then slide every one of your dots one step in a chosen direction (`↖ ↗ ← → ↙ ↘`).
- **Pushing** — you can push the opponent's pieces only if your contiguous run is longer than theirs. Each piece pushed off the grid scores 1 point.
- **Controls** — click the directional buttons or use the keyboard:

| Key | Direction |
| --- | --------- |
| `W` | ↖ Up-left |
| `E` | ↗ Up-right |
| `A` | ← Left |
| `D` | → Right |
| `Z` | ↙ Down-left |
| `X` | ↘ Down-right |

---

## Tech stack

- **HTML5** — semantic markup
- **CSS3** — custom properties, grid, flexbox, transitions and keyframe animations
- **Vanilla JavaScript** (ES6+) — no framework, no build step
- **Google Fonts** — Inter & Manrope
- **Netlify** — static hosting and continuous deployment

---

## Run locally

The app is fully static, so any local web server works.

```bash
git clone https://github.com/ehayretci/KaroKan.git
cd KaroKan/web-app

# Option 1 — Python (built-in on macOS / Linux)
python3 -m http.server 8000

# Option 2 — Node (npx)
npx serve .

# Option 3 — VS Code Live Server extension
```

Open <http://localhost:8000> in your browser.

You can also just open `web-app/index.html` directly in a browser — there is no build step.

---

## Deploy (Netlify)

The site is deployed on Netlify with the following settings:

- **Repository:** this repo
- **Branch:** `main`
- **Build command:** *(none — static site)*
- **Publish directory:** `web-app`

Two equivalent ways to deploy:

### Continuous deployment

1. Push to `main`.
2. Netlify auto-builds and publishes from the `web-app` directory.

### Manual deploy via the Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --dir=web-app --prod
```

### Pinning the publish directory

To make the publish directory explicit (and avoid relying on dashboard settings), add a `netlify.toml` at the repo root:

```toml
[build]
  publish = "web-app"
```

---

## Screenshots

<!-- Add screenshots of the start screen and gameplay here. -->

| Start screen | Gameplay |
| :----------: | :------: |
| _coming soon_ | _coming soon_ |

---

## Project structure

```
KaroKan/
├── README.md
└── web-app/
    ├── index.html      # markup
    ├── karokan.css     # all styling
    └── main.js         # game logic and rendering
```

---

## License

Released under the [MIT License](#).

```
MIT License

Copyright (c) 2026 ehayretci

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
