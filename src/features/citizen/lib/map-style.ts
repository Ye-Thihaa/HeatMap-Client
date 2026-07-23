import { useEffect, useState } from 'react'
import type { StyleSpecification } from 'maplibre-gl'

export const MAP_STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'

// The stock Voyager basemap tints parks/greenery a very pale, almost-beige
// green (`rgba(197, 225, 178, ...)` fading to `#e0ecd3`). Punch up the
// saturation on just those layers so parks read clearly as green.
const GREEN_LAYER_IDS = new Set(['landcover', 'landuse', 'park_national_park', 'park_nature_reserve'])

const GREENER_PARK_FILL = {
  stops: [
    [8, 'rgba(163, 213, 145, 0.35)'],
    [9, 'rgba(163, 213, 145, 0.45)'],
    [11, 'rgba(163, 213, 145, 0.55)'],
    [13, 'rgba(163, 213, 145, 0.7)'],
    [15, '#a3d9a0']
  ]
}

// Water fills default to a muted teal-gray (`#b0d0d6`) — recolor to a
// cleaner, more legible light blue.
const WATER_FILL: Record<string, string> = {
  water: '#aee0f5',
  water_shadow: '#9ecfe8'
}
const WATERWAY_LINE_COLOR = '#8ecbe0'

let cachedStyle: Promise<StyleSpecification> | null = null

function loadGreenerVoyagerStyle(): Promise<StyleSpecification> {
  if (!cachedStyle) {
    cachedStyle = fetch(MAP_STYLE_URL)
      .then((res) => res.json())
      .then((style: any) => {
        style.layers = style.layers.map((layer: any) => {
          if (layer.type === 'fill' && GREEN_LAYER_IDS.has(layer.id)) {
            return { ...layer, paint: { ...layer.paint, 'fill-color': GREENER_PARK_FILL } }
          }
          if (layer.type === 'fill' && layer.id in WATER_FILL) {
            return { ...layer, paint: { ...layer.paint, 'fill-color': WATER_FILL[layer.id] } }
          }
          if (layer.type === 'line' && layer.id === 'waterway') {
            return { ...layer, paint: { ...layer.paint, 'line-color': WATERWAY_LINE_COLOR } }
          }
          return layer
        })
        return style as StyleSpecification
      })
  }
  return cachedStyle
}

// Renders on the plain Voyager URL immediately (no blocked first paint),
// then swaps in the greener-parks variant once it's fetched. The fetch is
// cached module-wide, so only the very first map mounted in a session sees
// the swap — every map after that gets the greener style right away.
export function useGreenerMapStyle(): string | StyleSpecification {
  const [style, setStyle] = useState<string | StyleSpecification>(MAP_STYLE_URL)

  useEffect(() => {
    let cancelled = false
    loadGreenerVoyagerStyle().then((s) => {
      if (!cancelled) setStyle(s)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return style
}
