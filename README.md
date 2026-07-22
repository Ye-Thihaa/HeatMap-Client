# AI Urban Heat Intelligence Platform — Frontend

Scaffold for the citizen app + gov dashboard described in the build brief. Backend
is expected to be a FastAPI + Supabase (PostGIS) service — see the endpoint table
below for exactly what's wired up.

## Stack

React + TypeScript · TanStack Router (code-based routes) · TanStack Query ·
Tailwind CSS · Framer Motion · React Three Fiber (landing hero) · MapLibre GL
(live map) · Recharts (trend charts).

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your FastAPI backend
npm run dev
```

In dev, if `VITE_API_BASE_URL` is left unset, requests go through Vite's `/api`
proxy to `http://127.0.0.1:8000` (see `vite.config.ts`) — handy so the browser
never needs CORS configured on the backend during local development.

The map uses a free Stadia Maps dark style so it renders with zero config. Swap
`STYLE_URL` in `src/components/map/HeatMap.tsx` for a Mapbox style + token if the
team has one — MapLibre is Mapbox-GL-JS-API-compatible, so the switch is a
one-line change.

## Structure

```
src/
  lib/
    types.ts        # types mirroring the backend response shapes
    api-client.ts    # typed fetch wrapper — one function per endpoint
    queries.ts       # React Query hooks (one per endpoint), with cache invalidation wired up
  router.tsx         # code-based TanStack Router route tree
  routes/
    index.tsx        # landing page (3D scroll hero)
    app/             # citizen app: map, cooling centers, report form
    dashboard/       # gov dashboard: rankings, cooling gaps, queue, AI estimator
  components/
    map/             # HeatMap (MapLibre), ZoneDetailPanel, LiveRiskTicker
    dashboard/        # ConfidenceGauge, ReasoningReveal
    landing/          # Hero3D (React Three Fiber, scroll-bound shader)
    layout/           # RootLayout
```

## Endpoint coverage

Every endpoint in the brief has a matching function in `api-client.ts` and hook in
`queries.ts`:

| Endpoint | Hook |
|---|---|
| `GET /heat-zones` | `useHeatZones` |
| `GET /heat-zones/{id}` | `useHeatZone` |
| `GET /cooling-centers/nearby` | `useNearbyCoolingCenters` |
| `GET /dashboard/rankings` | `useDashboardRankings` |
| `POST /interventions/estimate` | `useEstimateIntervention` |
| `POST /interventions` | `useSaveIntervention` |
| `GET /interventions/{zone_id}` | `useInterventionHistory` |
| `POST /reports` | `useSubmitHeatReport` |
| `POST /cooling-gap-reports` | `useSubmitCoolingGapReport` |
| `GET /cooling-gap-reports?status=` | `useCoolingGapReports` |
| `GET /dashboard/cooling-gaps` | `useCoolingGapPriorities` |
| `PATCH /cooling-gap-reports/{id}` | `useUpdateCoolingGapReport` |

If the backend's actual JSON field names differ from `src/lib/types.ts`, that file
is the one place to reconcile — everything downstream is typed off it.

## What's implemented vs. stubbed

- **Fully wired**: routing, API client, all React Query hooks, live map with
  pulsing risk markers + cooling center pins, zone detail panel with trend chart,
  cooling-center finder with geolocation, cooling-gap + heat report forms with
  animated confirmation, rankings list with animated re-ranking, cooling-gap
  priority list, report queue with status updates, AI intervention estimator with
  animated confidence gauge + word-reveal reasoning, landing page with scroll-bound
  3D hero.
- **Needs a design pass, not just wiring**: empty states, loading skeletons, and
  mobile breakpoints are functional but plain — polish once real API data is
  flowing.
- **Not implemented**: auth (brief didn't specify a login flow for planners) and
  route-drawing for cooling-center directions (the animated dash-offset route line
  from the animation spec needs a routing/directions API, which wasn't in the
  endpoint list — flag if the backend adds one).

See `DESIGN.md` for the color/type/layout reasoning.
