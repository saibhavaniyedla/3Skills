# 🚀 Space Shooter — React + Tailwind CSS

An arcade-style Space Invaders game built with **React 18**, **Tailwind CSS**, **HTML5 Canvas**, and **Vite**.  
Created as part of a web development internship project.

---

## Tech Stack

| Tech | Role |
|------|------|
| **React 18** | UI components, state management, lifecycle |
| **Tailwind CSS** | Styling for HUD, overlays, layout |
| **HTML5 Canvas** | Game rendering (entities, particles, effects) |
| **Vite** | Dev server + build tool |
| **JavaScript (ES2022)** | Game logic, custom hooks |

---

## Project Structure

```
src/
├── components/
│   ├── GameCanvas.jsx   # Core canvas component — game loop wiring
│   ├── HUD.jsx          # Score / level / lives display
│   └── Overlay.jsx      # Start screen & game over screen
├── hooks/
│   ├── useGameLoop.js   # requestAnimationFrame hook
│   └── useKeyboard.js   # Keyboard input tracking hook
├── utils/
│   ├── constants.js     # Game configuration values
│   ├── draw.js          # All Canvas 2D drawing functions
│   └── gameUtils.js     # Helpers: stars, particles, collision, grid
├── App.jsx              # Root component — game state machine
├── main.jsx             # React entry point
└── index.css            # Tailwind directives + custom classes
```

---

## Key Concepts Demonstrated

### Custom React Hooks
- **`useGameLoop`** — wraps `requestAnimationFrame` in a React hook with a `running` flag. Uses a ref for the callback so the loop never needs to restart when state changes.
- **`useKeyboard`** — tracks `keydown`/`keyup` events and stores them in a `ref` (not `useState`) so reads inside the animation frame don't trigger re-renders.

### Separation of Concerns
- **Game logic** lives in `GameCanvas.jsx` using a single `gs` ref for all mutable game state — this avoids stale closures in `rAF` callbacks.
- **Drawing** is fully isolated in `draw.js` — pure functions that only receive a `CanvasRenderingContext2D` and data.
- **React state** (`score`, `lives`, `level`, `gameState`) only holds data that drives the UI, not the game loop.

### Game Systems
- **Particle system** — explosion effects using angle-spread velocity + alpha decay
- **Enemy grid** — configurable rows/columns, speeds up as enemies are eliminated
- **Collision detection** — AABB (axis-aligned bounding box) via `rectCollide()`
- **Progressive difficulty** — each level increases enemy speed, bullet speed, and row count

### Tailwind CSS
- Custom color palette (`space-*`) defined in `tailwind.config.js`
- Reusable component classes (`btn-space`, `hud-panel`) in `index.css` with `@layer components`
- Responsive layout with utility classes

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Controls

| Key | Action |
|-----|--------|
| `←` `→` | Move ship left / right |
| `Space` | Fire bullet |

---

## How to Extend

- **Mobile support** — add touch/swipe controls via `touchstart`/`touchmove` events
- **High score** — persist best score with `localStorage`
- **Sound effects** — use the Web Audio API or Howler.js
- **Power-ups** — drop collectibles from killed enemies
- **Boss levels** — add a large enemy every 5 levels
- **Multiplayer** — sync state over WebSockets
