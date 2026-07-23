import { useEffect, useState } from 'react'
import { HeatMap } from '../components/HeatMap'
import { PeakHoursBanner } from '../components/PeakHoursBanner'
import { HydrationReminder } from '../components/HydrationReminder'
import { SOSButton } from '../components/SOSButton'
import { api } from '@/lib/api-client'
import { useHeatZones, useNearbyCoolingCenters } from '@/lib/queries'
import type { CoolingCenterType, RouteSafetyResult } from '@/lib/types'

const TYPE_FILTERS: { value: CoolingCenterType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cooling_center', label: '❄️ Cooling centers' },
  { value: 'water_station', label: '💧 Water stations' },
]

export function CoolingCentersPage() {
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [activeSource, setActiveSource] = useState<'gps' | 'pin' | null>(null)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<CoolingCenterType | 'all'>('all')
  const [routeTargetId, setRouteTargetId] = useState<string | null>(null)
  const [routeSafety, setRouteSafety] = useState<RouteSafetyResult | null>(null)
  const [routeSafetyLoading, setRouteSafetyLoading] = useState(false)

  const searchCoords = activeSource === 'pin' ? pinCoords : activeSource === 'gps' ? gpsCoords : null

  const { data: zones = [] } = useHeatZones()
  const { data: centers = [], isLoading } = useNearbyCoolingCenters(
    searchCoords?.lat,
    searchCoords?.lng,
    5
  )

  const filteredCenters = centers.filter((c) => typeFilter === 'all' || c.type === typeFilter)
  const routeTarget = centers.find((c) => c.id === routeTargetId) ?? null

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

  // Route heat-safety check — simplified heuristic (see backend note), not
  // true shade-optimized routing. Runs whenever the user picks a specific
  // center to route to.
  useEffect(() => {
    if (!searchCoords || !routeTarget) {
      setRouteSafety(null)
      return
    }
    let cancelled = false
    setRouteSafetyLoading(true)
    api
      .checkRouteSafety({
        origin_lat: searchCoords.lat,
        origin_lng: searchCoords.lng,
        dest_lat: routeTarget.lat,
        dest_lng: routeTarget.lng,
      })
      .then((result) => {
        if (!cancelled) setRouteSafety(result)
      })
      .catch(() => {
        if (!cancelled) setRouteSafety(null)
      })
      .finally(() => {
        if (!cancelled) setRouteSafetyLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [searchCoords?.lat, searchCoords?.lng, routeTarget?.id])

  const safetyLabel = {
    safe: { text: '✅ Safe route', className: 'bg-safe/15 text-safe-dark' },
    caution: { text: '⚠️ Passes through a moderate-risk zone', className: 'bg-amber-100 text-amber-800' },
    risky: { text: '🔥 Passes through high-risk zone(s)', className: 'bg-red-100 text-red-700' },
    unknown: { text: 'Route safety unknown', className: 'bg-mist-100 text-ink-600' },
  } as const

  return (
    <div className="relative">
      <HeatMap
        zones={zones}
        centers={filteredCenters}
        userLocation={gpsCoords}
        pinLocation={pinCoords}
        onMapClick={handleMapClick}
        routeTo={routeTarget ? { lat: routeTarget.lat, lng: routeTarget.lng } : null}
        onSelectZone={() => {}}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-3 p-5">
        <div className="pointer-events-none flex flex-wrap items-start justify-between gap-3">
          <div className="pointer-events-auto max-w-sm rounded-2xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Find a cooling center
            </h1>
            <p className="text-sm text-ink-600">Nearest air-conditioned spaces open right now.</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={useMyLocation}
                disabled={locating}
                className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {locating ? 'Locating…' : 'Use my location'}
              </button>
              <HydrationReminder />
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

            <div className="mt-3 flex gap-1.5">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    typeFilter === f.value
                      ? 'bg-ink-900 text-white'
                      : 'bg-mist-100 text-ink-700 hover:bg-mist-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
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
            {filteredCenters.map((center) => (
              <div
                key={center.id}
                className={`cursor-pointer rounded-2xl border bg-white/95 p-4 shadow-sm backdrop-blur transition-colors ${
                  routeTargetId === center.id ? 'border-ink-900' : 'border-mist-200'
                }`}
                onClick={() => setRouteTargetId(center.id === routeTargetId ? null : center.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold">{center.name}</h3>
                    <span className="text-xs text-ink-600">
                      {center.type === 'water_station' ? '💧 Water station' : '❄️ Cooling center'}
                    </span>
                    {center.sponsor_name && (
                      <span className="ml-1.5 rounded-full bg-mist-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
                        Sponsored by {center.sponsor_name}
                      </span>
                    )}
                  </div>
                  <span className="whitespace-nowrap rounded-full bg-safe/15 px-2 py-0.5 text-xs font-medium text-safe-dark">
                    {center.distance_km.toFixed(1)} km
                  </span>
                </div>
                <dl className="mt-2 space-y-1 text-sm text-ink-700">
                  <div className="flex justify-between">
                    <dt>Hours</dt>
                    <dd>{center.hours}</dd>
                  </div>
                  {center.capacity != null && (
                    <div className="flex justify-between">
                      <dt>Capacity</dt>
                      <dd>{center.capacity}</dd>
                    </div>
                  )}
                  {center.contact && (
                    <div className="flex justify-between">
                      <dt>Contact</dt>
                      <dd>{center.contact}</dd>
                    </div>
                  )}
                </dl>

                {routeTargetId === center.id && (
                  <div className="mt-2 border-t border-mist-100 pt-2">
                    {routeSafetyLoading && (
                      <p className="text-xs text-ink-600">Checking route safety…</p>
                    )}
                    {!routeSafetyLoading && routeSafety && (
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${safetyLabel[routeSafety.overall_safety].className}`}
                        title="Estimated from zone risk data along a direct path, not precise shade routing"
                      >
                        {safetyLabel[routeSafety.overall_safety].text}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-auto max-w-md">
          <PeakHoursBanner />
        </div>
      </div>

      <SOSButton />
    </div>
  )
}