# Sketchef — Design System (DESIGN.md)

Source of truth for the visual system. Values are extracted from
`src/index.css` (`:root`) and the component styles — update this file when the
tokens change. Identity codename: **"Blueprint & Amber"** (two-tone cyanotype) —
one continuous dark blueprint on a deep near-black field, with SOLID, clearly
value-stepped surfaces (value + shadow do the depth work, not hairline outlines).
**Two leads in tension** break the old monochrome: luminous **cyan** = live /
interactive / selected, warm **amber** = highlight / recommendation / brand
spark. Coral = out of spec. Structure: an **app shell** (persistent left
`RailNav` + a work `canvas`); the landing is a full-bleed rail-less cover.

## Color roles (the two-tone rule)
- **Cyan (`--blue`)** — anything live/interactive/selected: primary/flow buttons
  (Start building, Show what I can build), board select + `.is-selected`, links,
  the active step, near-miss (actionable) tier, the cover schematic ("the print"),
  and genuine **feature flags** (the board `NET` cell lit cyan = has radio).
- **Amber (`--amber`) — the WARM HIGHLIGHT voice, and only that.** It marks
  emphasis + the recommendation, in exactly four kinds of place: (1) section
  **eyebrows** + their leader rules; (2) the cover **headline pitch accent**
  (`.cover__type`); (3) the **one key/payoff number per screen** (landing
  `Projects` stat, parts `N selected`); (4) the **buildable/recommended tier** —
  the featured hero (eyebrow LED, frame, corner ticks, gold schematic, "Open the
  build sheet" CTA), buildable project cards (hover / `View build` CTA /
  title-stroke / figure frame), and the `BUILDABLE` tally row.
  **Never on neutral data values** (board `LOGIC` voltage is plain ink like
  `DIG/ANA/PWM` — 5V isn't "recommended" over 3.3V) **and never on flow controls**
  (those are cyan). Aim ~80/20 cyan-to-amber; amber is the accent, cyan is the
  field's voice.
- **Coral (`--red`)** — missing parts / incompatible / out of spec / revision.
- **Board hardware colour (scoped exception).** In the **board picker only**, each
  board is drawn in its own MUTED, field-tuned real colour so the five read as
  distinct physical objects on the blueprint — teal Uno/Mega, a bluer teal R4,
  slate Nano, charcoal ESP32 with a **silver RF shield can**; silver USB
  connectors, silkscreen-white lines, dark seated chips (`paletteOf()` in
  `BoardGlyph.jsx`). Colours are desaturated + cooled to belong on the dark field.
  This is the ONE place real colour enters — the field, annotations and accents
  stay cyan/amber, and **cyan still means selection** (the board bodies are never
  recoloured to cyan; selection is the backlight + bracket + checkbox). Keep it
  scoped here unless we deliberately extend it.

## Color tokens

### Field & surfaces (all one dark world)
| Token | Value | Use |
|---|---|---|
| `--paper` | `#0a2138` | the blueprint field (deepest); body bg |
| `--paper-2` | `#081a2e` | recessed / grid base, rail foot |
| `--surface` | `#0f2c4c` | the working field a stage sits on; app-shell bg |
| `--surface-raised` | `#163a61` | panels / cards (a touch lighter blue) |
| `--surface-sunken` | `#0c2745` | insets, chips, code, rail brief |
| `--well` | `#12314f` | recessed drawing well behind a glyph |

### Ink (luminous, on blue)
| Token | Value | Notes |
|---|---|---|
| `--ink` | `#eef4fc` | primary text |
| `--ink-2` | `#bcd2ee` | secondary |
| `--ink-faint` | `#9cb8dc` | tertiary — verified ≥ WCAG AA on `--surface`/`--surface-raised` |

### Lines / grid
| Token | Value |
|---|---|
| `--line` | `rgba(184,212,244,0.16)` (hairline) |
| `--line-strong` | `rgba(184,212,244,0.4)` (stronger rule) |
| `--grid` | `rgba(210,230,255,0.05)` (fine grid) |
| `--grid-major` | `rgba(210,230,255,0.035)` (major grid) |

### Accents
Primary accent is **luminous cyan** ("the print"). Coral is the revision/
emphasis pencil. **Accent discipline (see Item 2):** saturated cyan is reserved
for *actions and the active step only* — primary CTAs, per-card "View build",
the current step marker, and owned/selected states. Structural chrome (eyebrows,
labels, dividers, part numbers, catalog stats, secondary counts) uses **muted
ink** (`--ink-faint` / `--ink-2`), not cyan.

| Token | Value | Use |
|---|---|---|
| `--blue` | `#5bd0e6` | primary accent (actions, active step) |
| `--blue-deep` | `#2f9fbf` | hover/depth |
| `--blue-bright` | `#85e4f5` | highlight |
| `--blue-soft` | `rgba(91,208,230,0.12)` | tints, soft fills |
| `--blue-line` | `rgba(91,208,230,0.4)` | accent hairline |
| `--on-blue` | `#06203a` | dark text on a cyan fill |
| `--red` / `--red-bright` | `#f0796a` / `#ff9384` | coral revision/emphasis, "missing" |
| `--red-soft` / `--red-line` | `rgba(240,121,106,0.14)` / `…0.42)` | hatched/struck notes |

### Difficulty (semantic, green → violet → coral)
`--beginner #5cc38d` · `--intermediate #a78bde` · `--advanced #f0796a`.
Deliberately **off** the two brand accents (cyan/amber) so a level marker never
reads as an action or the recommended tier. Shown as a 3-square gauge (fill count
carries the level) + label; used on project plates, the featured hero, the
detail modal, and the difficulty filter chips.

### Per-category ink hues (parts panel, brightened for dark)
`--cat-sensor #5bb8e6` · `--cat-actuator #f0796a` · `--cat-display #ab9be6` ·
`--cat-input #5bc6d8` · `--cat-passive #9fb2cb` · `--cat-infrastructure #e6ab54`.

## Typography — THREE voices
Self-hosted variable fonts via `@fontsource-variable` (imported in
`src/main.jsx`). No external font links. The big shift: headlines used to be
mono too, which flattened the type (no display-vs-chrome contrast). Now there
are **three distinct voices**:
- **DISPLAY / nameplate** — **Archivo Variable**, heavy + slightly expanded
  (`font-variation-settings: var(--nameplate)` = `'wght' 800, 'wdth' 110`). An
  industrial "nameplate/title-block" cut for the **large headlines only**:
  `.cover__title`, `.step-head__title`, `.results__heading`, `.featured__title`,
  `.detail__title`. Proportional + heavy, so it plays *against* the mono chrome.
- **BODY** — **Archivo Variable**, normal weight/width (`--font-sans` /
  `--font-display`): help/paragraph copy, and small card titles
  (`.project-card__title` — proportional bold, NOT nameplate; the nameplate cut
  is reserved for the big headlines).
- **INSTRUMENT** — **Spline Sans Mono Variable** (`--font-mono`, `.mono` utility
  adds `tabular-nums`): ALL the drafting chrome — eyebrows, part numbers
  (`BRD-01`), sheet refs (`DWG. 00`), titleblock labels (`DIG/ANA/PWM`),
  `FIG. 0N` captions, counts, code, the `01/02/03` step numbers, **and the
  "Sketchef" wordmark** (kept mono as part of the logo lockup with the
  solder-pad mark).
  **Rule:** don't set big headlines in mono again (that was the flatness); don't
  set labels/refs in the nameplate. Nameplate = large headlines, mono =
  instruments, Archivo-normal = body + small titles.
- **Brand wordmark** ("Sketchef") is set in the **mono** face (Item 7) so it
  reads as part of the drafting system, paired with the solder-pad mark.

## Logo (Item 7)
- Mark: a **solder-pad node** — an annular pad (ring + bright via) with a drawn
  "sketch" trace passing through, terminating in nodes — in the cyanotype tile.
  Ties to the Arduino/circuit concept (a drawn trace + a component pad) without a
  forced literal sketch-chef mashup. Source: `public/favicon.svg` (used as the
  rail/landing mark `<img>` and the browser favicon).
- Wordmark: "Sketchef" in the mono face (see Typography).
- **Follow-up:** the social image (`public/og-image.png` / `og-cover.svg`) still
  uses the old light palette + toque mark — regenerate to the cyanotype + new
  mark (headless-Chrome SVG→PNG render) when doing a brand sweep.

Type scale (representative):
| Role | Size |
|---|---|
| Landing hero title | `clamp(2.2rem, 5.4vw, 3.9rem)`, weight 700 |
| Stage-head title (`.step-head__title`) | `clamp(1.3rem, 3vw, 1.85rem)`, weight 700, `letter-spacing -0.025em` |
| Body / help | ~`0.95–1rem`, `line-height 1.55` |
| Mono labels / eyebrows | `0.6–0.72rem`, `letter-spacing 0.1–0.16em`, uppercase |
| Micro mono (refs, subs) | `0.53–0.62rem`, `letter-spacing 0.1em`, uppercase |

## Spacing, shape, elevation
- Spacing unit: `--space: 1rem`; layout gaps use `clamp()` (e.g. canvas padding
  `clamp(1.4rem, 2.2vw, 2.6rem)`).
- Radius: `--radius 8px` · `--radius-sm 5px` · `--radius-xs 3px`. **One radius
  scale** — squared/precise. No pill radii.
- Max width: `--maxw: 1600px`; app-shell centered with a viewport gutter.
- Shadows (deep near-black-blue; on the dark field elevation reads from **lit
  top edges + lighter surface**, less from shadow):
  - `--shadow-sheet`, `--shadow-card`, `--shadow-pop` (see `:root`).
  - Elevation pattern: `inset 0 1px 0 rgba(160–175,210–220,248–252, .08–.18)`
    (lit top edge) + a top-lighter surface gradient + the shadow token.

## Motion
- Standard transition: `~0.16–0.28s`, easing `cubic-bezier(0.22, 0.61, 0.36, 1)`.
- Entrances: staggered CSS `card-in` / one orchestrated page-load reveal.
- Continuous decorative motion (atmosphere drift, current-flow, shimmer, LED
  blink) is **gated on `@media (prefers-reduced-motion: no-preference)`**, and a
  global reduced-motion rule neutralizes animation/transition for users who ask.
- Modal freezes the animated atmosphere (`body.modal-open`) while open.

## Motifs (drafting language)
- **Reserve the drafting chrome for the ONE focal drawing per screen (anti-
  wallpaper rule).** The framed/bracketed drawing treatment — a ruled inner frame
  + registration ticks (amber) + a `FIG. 0N` caption — belongs **only** to the
  **featured hero** (`.featured__well` / `.plate-tick`) and the landing key
  figure (`.cover__tick`). Do **NOT** put inner frames, corner ticks, or `REV·x`
  stamps on ordinary project cards — their drawing wells are plain recessed
  screens. (These were stripped from `.project-card__figure` and the `.panel`
  corner ticks were removed, because applying the motif to every card turned it
  into visual noise with no focal point.) Rule of thumb: at most one heavily-
  annotated figure visible at a time.
- **The board picker is an open "pull sheet", not a card grid (anti-generic
  rule).** A bordered card-grid read as generic, so the boards were **de-boxed**:
  each is an annotated **plot** on the paper (`.board-plot`) — no border, no card
  background. A board sits directly on the sheet as a coloured hardware object
  (see hardware-colour note in Color roles), framed only by drafting annotations:
  a top rule with the sheet ref (`BRD-01`) + a signature-feature callout
  (`USB-C · RF`) + a pick checkbox, a dashed ground line it rests on, its name +
  designation, and a **ruled mini-titleblock** (`.board-specs`, hairlines only, no
  box). Selecting a board blooms it (full colour + a cyan backlight `.board-plot__glow`
  + a registration `.board-plot__bracket` + a soft cyan plot field); unselected
  boards sit desaturated/dimmed. Do NOT re-introduce a border/background box
  around a board — whitespace + annotations separate the plots.
- **The de-boxed "plot" language now spans the flow (board · parts · results).**
  Same rule — no bordered card box; the object rests on the sheet; drafting
  annotations + a bloom-on-select state carry it:
  - **Parts** (`.chip`): resting state is border/fill-free (a drawn `PartIcon`
    symbol + label + a faint hairline `+`); hover shows a quiet footprint recess;
    **owning blooms it cyan** (fill + glow + check). Border stays 1px in every
    state so toggling never reflows.
  - **Results grid** (`.project-card` in `.project-grid`): de-boxed plots — no
    border/fill/shadow. The wiring schematic rests on an **edgeless backlit pool**
    (no bordered screen) + a dashed ground line + its own cast shadow; the
    titleblock goes boxless-ruled (`.project-card .plate-titleblock`); hover blooms
    the pool (amber for buildable, cyan for near/clickable). Incompatible plots are
    just dimmed + greyscaled. The **featured hero stays framed** — the one focal
    drawing per screen (anti-wallpaper rule) — so hero-framed vs grid-open gives
    the results a clear size/importance hierarchy.
  - **Build-sheet modal** (`.modal--blueprint`): the modal itself STAYS framed (a
    focal document surface, like the hero), but the language was carried inside:
    section headers (`.detail__section-title`) got dotted-leader rules like the
    parts category dividers; required components (`.detail__part`) are squared
    drafting tags (de-pilled — the old `border-radius:999px` violated the one
    squared radius scale); the wiring table (`.wiring-wrap`) is a **boxless ruled
    schedule** (top/bottom rules only). The code listing keeps its box (correct
    for code) and the empty-state plate keeps its dashed-hatch stamp (already a
    drafting motif).
- **Vellum panels (Item 3):** primary `.panel` surfaces are semi-transparent
  (~82% `--surface-raised`) + `backdrop-filter: blur(7px)` so the drafting grid
  reads as the paper underneath. Degrades to solid under
  `prefers-reduced-transparency: reduce`. Use sparingly (1–2 panels per view) —
  don't put `backdrop-filter` on every card (perf).
- Recessed "drawing wells", dotted-leader dividers, a ghosted master-draft in
  the background (kept faint, opacity ~0.06).
- Keep mono-uppercase for genuinely label-like elements only — not body copy.

## Background / atmosphere
- Fixed `.atmosphere` layer (behind the shell): blueprint grid + drifting
  luminous washes + cyan cursor glow (fine-pointer + motion only) + faint
  ghosted `TableDraft` + grain (soft-light) + edge vignette.
- The work `canvas` paints its own field (fine + major grid, top cyan light,
  floor shade) so panels read as raised.
