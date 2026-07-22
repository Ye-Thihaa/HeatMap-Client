# Design notes

The brief already pins down the palette (cool blue/green = safe, warm yellow→red =
risk) and the audience split (dense dashboard for planners, simple/visual for
citizens), so the free variable was typography, layout rhythm, and the landing
page's signature moment — not color.

## Tokens

- **Color** — `ink` (near-black-blue, #070B12 → #2C405C) for the gov dashboard and
  the landing page backdrop; `mist` (off-white, #F7F9FB → #DCE4EC) for the citizen
  app, which should feel lighter and simpler than the planner-facing side; `safe`
  (teal, #2DD4BF) reserved exclusively for cooling centers and confirmations, so it
  never competes visually with the risk gradient; `risk` (green → amber → orange →
  red) drives every risk-level indicator across both apps.
- **Type** — Space Grotesk for display (a technical, slightly mechanical grotesk —
  reads as "instrumentation," not "editorial"), Inter for body copy, IBM Plex Mono
  for anything numeric: temperatures, coordinates, confidence percentages, ranks.
  Putting numbers in mono ties together the map, the rankings table, and the
  estimator gauge as one data language.
- **Layout** — citizen app: airy, card-based, generous whitespace, pill nav.
  Gov dashboard: dense sidebar + table/list layout, dark background so color-coded
  risk indicators pop without fighting a light UI chrome.
- **Signature** — the landing hero's icosahedron sphere isn't a decorative 3D
  logo; its surface color is literally driven by scroll progress (cool blue → heat
  red) and its "hot zone" glow points fade in as you scroll, so the very first
  interaction on the site *is* the product's core idea (real data, changing in
  front of you) rather than a generic rotating shape.

## What was deliberately avoided

- No cream-background/serif/terracotta default — the brief's own dark, data-forward
  direction was already specific enough that reaching for a warm editorial look
  would have fought it.
- No numbered 01/02/03 markers outside the "How it works" section — that's the one
  place order is real information (Live data → AI analysis → Action is a sequence);
  elsewhere (stat cards, report categories) markers would just decorate.
- Motion is concentrated in three places that carry meaning: the scroll-bound hero,
  the AI reasoning reveal, and live-data transitions (ticker, pulsing risk markers).
  Everything else (nav, forms, tables) is static on purpose.
