import { useState } from 'react'
import { HeatMap } from '@/components/map/HeatMap'
import { useHeatZones, useNearbyCoolingCenters } from '@/lib/queries'

export function CoolingCentersPage() {
  // Kept separate on purpose: gpsCoords is the actual "you are here" blue
  // dot, only ever set via navigator.geolocation. pinCoords is a manually
  // dropped pin from clicking the map, rendered as a distinct marker. The
  // search always uses whichever was set MOST RECENTLY — dropping a pin
  // after using GPS re-centers the search on the pin, without moving or
  // erasing the blue dot.
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [activeSource, setActiveSource] = useState<'gps' | 'pin' | null>(null)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const searchCoords = activeSource === 'pin' ? pinCoords : activeSource === 'gps' ? gpsCoords : null

  const { data: zones = [] } = useHeatZones()
  const { data: centers = [], isLoading } = useNearbyCoolingCenters(
    searchCoords?.lat,
    searchCoords?.lng,
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
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setGpsCoords(coords)
        setActiveSource('gps')
        setLocating(false)
      },
      () => {
        setGeoError('Location access was denied. Drop a pin on the map instead.')
        setLocating(false)
      }
    )
  }

  function handleMapClick(lat: number, lng: number) {
    setPinCoords({ lat, lng })
    setActiveSource('pin')
  }

  return (
    <div className="relative">
      <HeatMap
        zones={zones}
        centers={centers.map((c) => ({ id: c.id, lat: c.lat, lng: c.lng, name: c.name }))}
        userLocation={gpsCoords}
        pinLocation={pinCoords}
        onMapClick={handleMapClick}
        onSelectZone={() => {}}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-3 p-5">
        <div className="pointer-events-auto max-w-sm rounded-2xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Find a cooling center
          </h1>
          <p className="text-sm text-ink-600">Nearest air-conditioned spaces open right now.</p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={useMyLocation}
              disabled={locating}
              className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {locating ? 'Locating…' : 'Use my location'}
            </button>
          </div>
          {geoError && <p className="mt-2 text-sm text-red-600">{geoError}</p>}
          {!searchCoords && !geoError && (
            <p className="mt-2 text-sm text-ink-600">Or click a point on the map to drop a pin.</p>
          )}
          {activeSource === 'pin' && (
            <p className="mt-2 text-sm text-ink-600">
              Showing results near your dropped pin.{' '}
              {gpsCoords && (
                <button
                  onClick={() => setActiveSource('gps')}
                  className="font-medium text-ink-900 underline underline-offset-2"
                >
                  Use my location instead
                </button>
              )}
            </p>
          )}
        </div>

        <div className="pointer-events-auto max-h-[calc(100vh-8rem)] w-full max-w-xs space-y-3 overflow-y-auto">
          {isLoading && searchCoords && (
            <div className="rounded-2xl bg-white/90 p-4 text-sm text-ink-600 shadow-sm backdrop-blur">
              Searching nearby…
            </div>
          )}
          {!searchCoords && (
            <div className="rounded-2xl border border-dashed border-mist-200 bg-white/90 p-5 text-sm text-ink-600 shadow-sm backdrop-blur">
              Share your location to see ranked results here.
            </div>
          )}
          {centers.map((center) => (
            <div
              key={center.id}
              className="rounded-2xl border border-mist-200 bg-white/95 p-4 shadow-sm backdrop-blur"
            >
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