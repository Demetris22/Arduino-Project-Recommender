# Sketchef — Design & Architecture

> **This is the current system.** Everything before it — the "Blueprint", "Instrument" and dark
> "Signal" themes, and the `board → parts → results` wizard — has been torn down and replaced.

Sketchef is an **Arduino project catalog**. Browse every project immediately; optionally tell it what
hardware you own, and it marks exactly what you can build.

---

## 1. The core idea: the kit is a LENS, not a GATE

The old app was a three-step wizard — you could not see a single project until you had chosen a board
and ticked your parts. The catalog was the *reward* for completing a form.

That is inverted:

| | Old | New |
|---|---|---|
| Home | A marketing landing page | **The catalog itself** |
| Projects | Hidden until step 3 | Always visible, always browsable |
| Board + parts | A mandatory gate | An optional **lens** at `/kit` |
| Project detail | A modal, unlinkable | A **real page** at `/p/:id` |
| Navigation | A 4-value stage machine | A router: real URLs, working back/forward |

Setting a kit never hides anything. It **annotates**: every project gets a status
(`Buildable` · `N away` · `Parts needed` · `Wrong board`), which you can then sort and filter by.

### ⚠ The `NEAR_MISS_LIMIT` trap — read before touching `useProjectStatus`

`getMatches()` in `src/data/lib/matching.js` deliberately **omits** any project missing 3+ components
(its module-private `NEAR_MISS_LIMIT = 2`). Correct for a wizard's "near miss" list. **Fatal for a
catalog** — those projects would silently vanish from the grid.

So: **the engine classifies; it never decides grid membership.** `useProjectStatus()` maps what the
engine returns, then sweeps every remaining project into a `'far'` status, deriving the missing parts
in the UI layer. Every project always gets a status. Nothing is ever dropped.

*Regression check:* a kit of one LED on an Uno. The catalog must still read **20 of 20**, with 13
cards badged "Parts needed".

---

## 2. Architecture

```
src/
  App.jsx               router shell (was a 660-line stage machine)
  routes/               CatalogPage · ProjectPage · KitPage · NotFoundPage
  kit/
    KitContext.jsx      the kit: localStorage + share-link hydration
    useProjectStatus.js the LENS — wraps the engine, derives 'far'
  components/           11 presentational components
  data/lib/matching.js  UNTOUCHED pure engine   (10 tests)
  data/lib/suggest.js   UNTOUCHED pure engine   (10 tests)
  lib/shareUrl.js       UNTOUCHED pure helpers  (12 tests) — reused for share links
```

- **Routing:** `react-router-dom` (BrowserRouter). `vercel.json` rewrites every path to `index.html`
  so `/p/blink-led` survives a hard refresh.
- **Kit persistence:** `localStorage['sketchef.kit.v1']`. An inbound `?board=&parts=` on any route
  hydrates the kit (a share link beats stored state), then is stripped from the address bar.
- **Guard rails:** `getMatches` *throws* on an unknown board id — `useProjectStatus` catches it and
  degrades to "no lens". `KitContext.sanitize()` drops ids that no longer exist in the catalog.
- **The engine is never told about filters.** Search, facets and sort are display-only and run
  strictly *after* the engine.

---

## 3. Visual language: "editorial technical"

Arduino's own identity — **white and teal** — executed as a technical publication, not a template.

### The three-plane rule (this is what kills flatness)

| Plane | Token | Used for |
|---|---|---|
| 1 | `--paper-2` `#F4F7F7` | **the page itself** |
| 2 | `--paper` `#FFFFFF` | cards, bands, panels — raised, hairline-ruled, softly shadowed |
| 3 | `--teal-ink` `#04363A` | the hero band, every diagram tile, code blocks |

**A white card never sits on a white page. A diagram never sits on paper.** The generated schematics
draw in `--teal-bright` on plane 3 — that dark tile is the only "photography" this catalog has, and
it is what gives a light site real depth.

### Color

```
--teal        #00979D   the brand. LARGE / BOLD TEXT ONLY  (~3.1:1 on white)
--teal-deep   #006F73   every small text run + link        (~5.2:1 — AA)
--teal-bright #14C3CA   strokes and numerals on teal-ink
--teal-ink    #04363A   plane 3
--ink #0C1B1C   --ink-2 #4A5C5D   --ink-3 #7C8C8D
```
Status: `buildable = --teal` · `near = --near #B56A00` · `far = --ink-3` · `incompatible = --stop #B4364C`.

> **Contrast rule, no exceptions.** Teal at small sizes must be `--teal-deep`. The primary button is
> `--teal-bright` with near-black text — never white-on-teal.

### Type
- **Display:** Bricolage Grotesque Variable — headlines, card titles, section heads.
- **Body / UI:** Instrument Sans Variable.
- **Mono:** JetBrains Mono Variable — every spec, badge, count, label and code block.

Deliberately not Inter / Roboto / system-ui.

### Motion
CSS only: a staggered grid reveal, a hero rise on load, a hover lift on cards. All disabled under
`prefers-reduced-motion`.

---

## 4. Rules for future work

1. **Never** modify `matching.js`, `suggest.js`, or `src/data/*.json`. They are pinned by 32 tests.
2. **Never** let the engine decide what appears in the catalog (see §1).
3. Small teal text uses `--teal-deep`. Always.
4. `ProjectDiagram` / `BoardGlyph` / `PartIcon` draw in `currentColor`. Put them on plane 3 and set
   `color` — don't hardcode fills.
5. Nothing may scroll the page sideways; wide content scrolls inside its own container.
