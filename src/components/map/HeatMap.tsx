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

export function HeatMap({ zones, coolingCenters = [], onSelectZone, selectedZoneId }: HeatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Marker[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [0, 0],
      zoom: 11,
      attributionControl: false
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.on('load', () => setReady(true))
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Zone markers — pulsing ring for high/severe risk (see index.css keyframes)
  useEffect(() => {
    if (!ready || !mapRef.current) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (zones.length > 0) {
      const bounds = new maplibregl.LngLatBounds()
      zones.forEach((zone) => bounds.extend([zone.centroid_lng, zone.centroid_lat]))
      mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 0 })
    }

    for (const zone of zones) {
      const el = document.createElement('button')
      el.setAttribute('aria-label', `${zone.name}, ${zone.risk_level} risk`)
      el.className = 'relative flex h-5 w-5 items-center justify-center'
      el.innerHTML = `
        ${
          zone.risk_level === 'high' || zone.risk_level === 'severe'
            ? `<span class="absolute inline-flex h-full w-full animate-pulse-ring rounded-full" style="background:${RISK_COLOR[zone.risk_level]}"></span>`
            : ''
        }
        <span
          class="relative inline-block h-3.5 w-3.5 rounded-full border-2 border-white/80 shadow-lg transition-transform duration-300 ${
            zone.id === selectedZoneId ? 'scale-125' : ''
          }"
          style="background:${RISK_COLOR[zone.risk_level]}"
        ></span>
      `
      el.onclick = () => onSelectZone(zone.id)

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([zone.centroid_lng, zone.centroid_lat])
        .addTo(mapRef.current)
      markersRef.current.push(marker)
    }

    for (const center of coolingCenters) {
      const el = document.createElement('div')
      el.className =
        'h-3 w-3 rounded-full border-2 border-white bg-safe shadow-lg animate-pulse-ring'
      el.title = center.name
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([center.lng, center.lat])
        .addTo(mapRef.current)
      markersRef.current.push(marker)
    }
  }, [ready, zones, coolingCenters, selectedZoneId, onSelectZone])

  return (
    <div className="relative h-[60vh] w-full overflow-hidden rounded-2xl border border-mist-200 shadow-sm lg:h-[70vh]">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
