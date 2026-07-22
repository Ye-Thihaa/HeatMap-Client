import { useEffect, useRef, useState } from 'react'
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl'
import type { HeatZoneSummary, RiskLevel } from '@/lib/types'

const RISK_COLOR: Record<RiskLevel, string> = {
  low: '#34D399',
  moderate: '#FBBF24',
  high: '#FB7A34',
  severe: '#EF4444'
}

// Free vector basemap so the scaffold runs without a Mapbox token.
// Swap for a Mapbox style + access token if the team has one.
const STYLE_URL = 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json'

interface HeatMapProps {
  zones: HeatZoneSummary[]
  coolingCenters?: { id: string; lat: number; lng: number; name: string }[]
  onSelectZone: (zoneId: string) => void
  selectedZoneId?: string
}

interface ZoneMarkerEntry {
  marker: Marker
  el: HTMLButtonElement
  dot: HTMLSpanElement
  ring: HTMLSpanElement | null
}

interface CenterMarkerEntry {
  marker: Marker
}

// The element returned here is the exact node MapLibre positions (it writes
// `transform: translate(...) translate(-50%,-50%)` onto it every zoom/pan).
// It must therefore NEVER also carry an animation that touches `transform` —
// that was the root cause of the drift bug (see HeatMap fix notes). The ring
// and the dot are children of this node, not the node itself, so neither of
// them can ever fight MapLibre for the `transform` property.
function createZoneMarkerEl() {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'relative flex h-5 w-5 items-center justify-center'
  // Defensive: don't lean on Tailwind preflight alone to zero out the
  // browser's default <button> padding/border — any stray box-model bytes
  // here would shift the box MapLibre's -50%/-50% anchor is measured against.
  el.style.padding = '0'
  el.style.margin = '0'
  el.style.border = '0'
  el.style.background = 'transparent'
  el.style.cursor = 'pointer'

  const dot = document.createElement('span')
  dot.className =
    'relative inline-block h-3.5 w-3.5 rounded-full border-2 border-white/80 shadow-lg'
  dot.style.transformOrigin = 'center'
  // Risk-level color changes animate in (~800ms) instead of snapping.
  dot.style.transition =
    'background-color 800ms ease, transform 300ms cubic-bezier(0.23,1,0.32,1)'
  el.appendChild(dot)

  return { el, dot }
}

function createRingEl(color: string) {
  const ring = document.createElement('span')
  ring.className =
    'pointer-events-none absolute inline-flex h-full w-full animate-pulse-ring rounded-full'
  ring.style.background = color
  // Explicit even though it matches the default — see fix notes.
  ring.style.transformOrigin = 'center'
  return ring
}

function createCenterMarkerEl() {
  const el = document.createElement('div')
  el.className = 'relative flex h-4 w-4 items-center justify-center'
  el.style.margin = '0'

  // Same rule as zone markers: the pulsing ring lives on a CHILD span, never
  // on `el` itself, since `el` is what MapLibre positions.
  const ring = document.createElement('span')
  ring.className =
    'pointer-events-none absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-safe'
  ring.style.transformOrigin = 'center'

  const dot = document.createElement('span')
  dot.className = 'relative inline-block h-3 w-3 rounded-full border-2 border-white bg-safe shadow-lg'
  dot.style.transformOrigin = 'center'

  el.append(ring, dot)
  return el
}

export function HeatMap({ zones, coolingCenters = [], onSelectZone, selectedZoneId }: HeatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [ready, setReady] = useState(false)
  const zoneMarkersRef = useRef<Map<string, ZoneMarkerEntry>>(new Map())
  const centerMarkersRef = useRef<Map<string, CenterMarkerEntry>>(new Map())
  const prevZoneIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [0, 0],
      zoom: 11,
      // Prevents zooming out to country-level view, where nearby zones
      // (e.g. Yangon's townships) compress into a near-vertical cluster of
      // dots that looks like a bug but is actually just real geography
      // rendered at a scale too coarse to separate them. City-level zoom
      // keeps zones visually distinct at all times.
      minZoom: 10,
      attributionControl: false
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.on('load', () => setReady(true))
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      zoneMarkersRef.current.clear()
      centerMarkersRef.current.clear()
    }
  }, [])

  // Zone markers. Markers are now updated in place across re-renders instead
  // of being torn down and rebuilt every time — see fix notes at the bottom
  // of this file for why that mattered for the drift bug.
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return

    const zoneIds = new Set(zones.map((z) => z.id))
    const prevIds = prevZoneIdsRef.current
    const datasetChanged =
      zoneIds.size !== prevIds.size || [...zoneIds].some((id) => !prevIds.has(id))

    // Only refit the camera when the SET of zones changes (first load, or a
    // zone added/removed) — not on every render, and critically not when the
    // user merely selects a zone. Previously this ran on every dependency
    // change including `selectedZoneId`, so clicking a marker silently
    // re-fit and re-centered the whole map underneath it.
    if (datasetChanged && zones.length > 0) {
      const bounds = new maplibregl.LngLatBounds()
      zones.forEach((zone) => bounds.extend([zone.centroid_lng, zone.centroid_lat]))
      map.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 0 })
    }
    prevZoneIdsRef.current = zoneIds

    for (const [id, entry] of zoneMarkersRef.current) {
      if (!zoneIds.has(id)) {
        entry.marker.remove()
        zoneMarkersRef.current.delete(id)
      }
    }

    for (const zone of zones) {
      const color = RISK_COLOR[zone.risk_level]
      const showRing = zone.risk_level === 'high' || zone.risk_level === 'severe'
      const isSelected = zone.id === selectedZoneId
      let entry = zoneMarkersRef.current.get(zone.id)

      if (!entry) {
        const { el, dot } = createZoneMarkerEl()
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([zone.centroid_lng, zone.centroid_lat])
          .addTo(map)
        entry = { marker, el, dot, ring: null }
        zoneMarkersRef.current.set(zone.id, entry)
      } else {
        entry.marker.setLngLat([zone.centroid_lng, zone.centroid_lat])
      }

      entry.el.setAttribute('aria-label', `${zone.name}, ${zone.risk_level} risk`)
      entry.el.onclick = () => onSelectZone(zone.id)

      // Setting .background (not replacing the element) is what lets the
      // 800ms transition on the dot actually play when risk_level changes.
      entry.dot.style.background = color
      entry.dot.style.transform = isSelected ? 'scale(1.25)' : 'scale(1)'

      if (showRing && !entry.ring) {
        entry.ring = createRingEl(color)
        entry.el.prepend(entry.ring)
      } else if (!showRing && entry.ring) {
        entry.ring.remove()
        entry.ring = null
      } else if (showRing && entry.ring) {
        entry.ring.style.background = color
      }
    }
  }, [ready, zones, selectedZoneId, onSelectZone])

  // Cooling-center markers — same in-place update pattern as zone markers.
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return

    const centerIds = new Set(coolingCenters.map((c) => c.id))
    for (const [id, entry] of centerMarkersRef.current) {
      if (!centerIds.has(id)) {
        entry.marker.remove()
        centerMarkersRef.current.delete(id)
      }
    }

    for (const center of coolingCenters) {
      let entry = centerMarkersRef.current.get(center.id)
      if (!entry) {
        const el = createCenterMarkerEl()
        el.title = center.name
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([center.lng, center.lat])
          .addTo(map)
        entry = { marker }
        centerMarkersRef.current.set(center.id, entry)
      } else {
        entry.marker.setLngLat([center.lng, center.lat])
      }
    }
  }, [ready, coolingCenters])

  return (
    <div className="relative h-[60vh] w-full overflow-hidden rounded-2xl border border-mist-200 shadow-sm lg:h-[70vh]">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}

/*
 * ROOT CAUSE — marker drift on zoom-out
 * ======================================
 * The cooling-center marker previously applied Tailwind's `animate-pulse-ring`
 * (a `transform: scale(...)` keyframe animation) DIRECTLY to the exact DOM
 * node passed to `new maplibregl.Marker({ element })`. That node is the one
 * MapLibre itself repositions on every zoom/pan by writing an inline
 * `transform: translate(Xpx, Ypx) translate(-50%,-50%)` to it. Two things
 * writing to the same `transform` property on the same element is a losing
 * fight: a running CSS animation's keyframe values replace the element's
 * computed transform outright for the properties it declares, including any
 * inline transform set imperatively — and the `pulseRing` keyframes declare
 * only `scale(...)`, with no translate term. So for most of every 2.2s pulse
 * cycle, the marker was rendering with its position-critical translate
 * discarded, leaving it offset toward the top-left of its positioned
 * ancestor.
 *
 * That offset is a constant number of *pixels*, not map-units — it doesn't
 * scale with zoom. At high zoom, a few stray pixels are imperceptible next
 * to large on-screen features. At low zoom, the same fixed pixel offset
 * covers a much larger geographic distance relative to the now-tiny map
 * features around it, which is exactly why the drift "grows" as you zoom
 * out, even though the underlying error never changed size.
 *
 * Fix: the pulsing ring now always lives on a CHILD <span> of the marker
 * root, never on the root itself — so MapLibre's positioning transform on
 * the root is never touched by an animation. This applies to both zone and
 * cooling-center markers now (zone markers already nested the ring
 * correctly, so they weren't actually exhibiting this exact failure, but the
 * shared root cause plus the other checks below made it worth hardening
 * both).
 *
 * Also fixed, per the other suspects raised:
 * - `anchor: 'center'` is now passed explicitly to every `new
 *   maplibregl.Marker(...)` call, rather than relying on it being the
 *   (currently correct) default.
 * - The marker root elements get explicit inline `padding/margin/border:0`
 *   so their box is never influenced by user-agent <button> defaults,
 *   independent of whether Tailwind's preflight stylesheet has loaded yet.
 * - `transform-origin: center` is set explicitly and inline on both the
 *   dot and the ring (previously relying on the CSS default, which is
 *   already `center` — this didn't change behavior, but makes the intent
 *   unambiguous and future-proof against any later override).
 * - Markers are no longer destroyed and recreated on every re-render.
 *   Previously `markersRef.current.forEach(m => m.remove())` ran on every
 *   change to `zones`, `coolingCenters`, `selectedZoneId`, OR `onSelectZone`
 *   — meaning simply clicking a marker to select it tore down and rebuilt
 *   every marker on the map from scratch. Markers are now looked up by id
 *   and updated in place (position, color, ring, selection state), so
 *   selecting a zone no longer touches unrelated markers, and — just as
 *   importantly — it also stopped `fitBounds` from silently re-running and
 *   re-centering/re-zooming the whole map on every selection (it was in the
 *   effect's dependency array), which was an additional source of visible
 *   "jump" independent of the animation bug above.
 *
 * ADDITIONAL FIX — dots compressing into a vertical line at low zoom
 * ====================================================================
 * This is a separate, unrelated issue from the drift bug above — it's not a
 * positioning error at all. Yangon's seeded zones sit within a very small
 * real-world area, and at country-level zoom (e.g. zoomed out to see all of
 * Myanmar down to the Andaman Sea) that small area compresses into just a
 * handful of screen pixels, making the zones look like they've collapsed
 * into a line. Verifying this is a scale artifact rather than a bug: zooming
 * back in causes the dots to spread back out to their correct distinct
 * positions.
 *
 * Fix: added `minZoom: 10` to the map constructor, which prevents the user
 * from zooming out far enough to reach that confusing country-level view in
 * the first place. This keeps the map at a city-appropriate zoom range at
 * all times. A more complete solution (marker clustering, where nearby
 * points merge into a single numbered badge until zoomed in) is a valid
 * future improvement but was out of scope for the immediate fix.
 */