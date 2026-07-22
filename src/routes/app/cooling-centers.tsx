import { useState } from 'react'
import { HeatMap } from '@/components/map/HeatMap'
import { useHeatZones, useNearbyCoolingCenters } from '@/lib/queries'

export function CoolingCentersPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const { data: zones = [] } = useHeatZones()
  const { data: centers = [], isLoading } = useNearbyCoolingCenters(
    coords?.lat,
    coords?.lng,
    5
  )

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.')
      return
    }
    setLocating(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setGeoError('Location access was denied. Drop a pin on the map instead.')
        setLocating(false)
      }
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Find a cooling center
        </h1>
        <p className="text-sm text-ink-600">Nearest air-conditioned spaces open right now.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={useMyLocation}
          disabled={locating}
          className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {locating ? 'Locating…' : 'Use my location'}
        </button>
        {geoError && <p className="text-sm text-red-600">{geoError}</p>}
        {!coords && !geoError && (
          <p className="text-sm text-ink-600">Or click a point on the map to drop a pin.</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <HeatMap
          zones={zones}
          coolingCenters={centers.map((c) => ({ id: c.id, lat: c.lat, lng: c.lng, name: c.name }))}
          onSelectZone={() => {}}
        />
        <div className="space-y-3">
          {isLoading && coords && <p className="text-sm text-ink-600">Searching nearby…</p>}
          {!coords && (
            <div className="rounded-2xl border border-dashed border-mist-200 p-5 text-sm text-ink-600">
              Share your location to see ranked results here.
            </div>
          )}
          {centers.map((center) => (
            <div key={center.id} className="rounded-2xl border border-mist-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <h3 className="font-display font-semibold">{center.name}</h3>
                <span className="rounded-full bg-safe/15 px-2 py-0.5 text-xs font-medium text-safe-dark">
                  {center.distance_km.toFixed(1)} km
                </span>
              </div>
              <dl className="mt-2 space-y-1 text-sm text-ink-700">
                <div className="flex justify-between">
                  <dt>Hours</dt>
                  <dd>{center.hours}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Capacity</dt>
                  <dd>{center.capacity}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Contact</dt>
                  <dd>{center.contact}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
