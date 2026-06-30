# Sketchef

**Sketchef** is a static web app that tells you **what you can actually build**
with the Arduino board and components you already own — and which part to buy
next to unlock the most projects.

Pick your board, check off the parts in your kit, and the app instantly sorts a
catalog of projects into **buildable now**, **one or two parts away**, and
**not compatible with your board** — with full wiring, step-by-step
instructions, and the Arduino sketch for each one.

> **Live demo:** _add your Vercel URL here_

<!-- Add a screenshot or short GIF of the guided flow + results here, e.g.:
![Arduino Project Recommender](docs/screenshot.png) -->

## Highlights

- **Guided, one-step-at-a-time flow** — choose your board → choose your parts →
  see results. Completed steps collapse into an editable summary bar, so it's
  guided but never a trap.
- **Hardware-aware matching** — respects each board's digital/analog pin counts
  and features (e.g. a WiFi-only project is ruled out on an Uno but buildable on
  an ESP32), not just "do you own the parts."
- **"What to buy next" optimizer** — analyzes everything you *can't* build yet
  and ranks the highest-leverage component to acquire (e.g. _"Add an HC-SR04 —
  unlocks 4 projects"_). Click a recommendation to add it and watch the results
  recompute live.
- **Build instructions** — every project opens a detail view with an intro,
  a Part → Pin wiring table, numbered steps, and a copyable Arduino sketch.
- **Search & filters** — live search across titles and topics, plus difficulty
  filters, tucked behind on-demand controls so the results stay the focus.
- **Shareable URLs** — your board + parts are encoded in the query string
  (`?board=esp32&parts=led,buzzer`). Share a link and it reproduces the exact
  selection; malformed links degrade gracefully to sensible defaults.
- **Premium, accessible UI** — dark glass-and-glow theme with a living
  circuit-inspired background, focus-trapped modal, keyboard-operable controls,
  and every animation gated behind `prefers-reduced-motion`.

## How it works

It's a fully **static, client-side** app — no backend, no database, no API
calls. All the interesting logic is in small, pure, unit-tested modules:

| Module | Responsibility |
| --- | --- |
| [`src/data/lib/matching.js`](src/data/lib/matching.js) | The core engine. `getMatches(ownedIds, boardId, data)` returns `{ buildable, nearMiss, incompatible }`, applying board compatibility (pins/features) and component-ownership rules. |
| [`src/data/lib/suggest.js`](src/data/lib/suggest.js) | The "buy next" optimizer. Ranks components by how many projects each would unlock, reusing the engine's board rule. |
| [`src/lib/shareUrl.js`](src/lib/shareUrl.js) | Reads/writes and **validates** the board + parts selection in the URL query string. |

The React UI only calls these functions and renders the result — no matching or
filtering logic lives in components.

The data lives in three JSON files: [`boards.json`](src/data/boards.json),
[`components.json`](src/data/components.json), and
[`projects.json`](src/data/projects.json).

## Tech stack

- **React 18** + **Vite** (function components and hooks only)
- Plain **CSS** with design tokens (no UI framework)
- **Vitest** for unit tests
- Deploys to **Vercel** as a static build

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # preview the production build
npm test         # run the Vitest suite
```

## Testing

The pure logic is covered by Vitest — the matching engine, the purchase
optimizer, and the URL-state helpers each have their own suite with inline
fixtures (independent of the real catalog data):

```bash
npm test
```

- [`matching.test.js`](src/data/lib/matching.test.js) — buildable / near-miss /
  incompatible classification, pin & feature gating, sorting.
- [`suggest.test.js`](src/data/lib/suggest.test.js) — recommendation ranking,
  owned-part exclusion, board-incompatible filtering, empty states.
- [`shareUrl.test.js`](src/lib/shareUrl.test.js) — URL parsing/validation,
  malformed-input safety, and round-tripping.

## Deploying

Vite produces a static `dist/` folder, so any static host works. On Vercel,
import the repo and accept the defaults (it auto-detects Vite):

- **Build command:** `npm run build`
- **Output directory:** `dist`

## License

MIT
