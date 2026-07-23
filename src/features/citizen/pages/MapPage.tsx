import { useEffect, useState } from 'react'
import { HeatMap, type Hospital } from '../components/HeatMap'
import { ZoneDetailPanel } from '../components/ZoneDetailPanel'
import { LiveRiskTicker } from '../components/LiveRiskTicker'
import { useHeatZones, useNearbyHospitals, useRouteDirections } from '@/lib/queries'
import { useLanguage } from '@/lib/i18n/language-context'

export function CitizenMapPage() {
  const { data: zones = [], isLoading, isError } = useHeatZones()
  const { t } = useLanguage()
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null)
  const [routeInfo, setRouteInfo] = useState<{
    distance_m: number
    duration_s: number
    duration_no_traffic_s: number | null
    provider: 'google' | 'osrm'
  } | null>(null)

  const {
    data: hospitals = [],
    isError: hospitalsIsError,
    error: hospitalsError,
    isLoading: hospitalsLoading
  } = useNearbyHospitals(userLocation?.lat, userLocation?.lng, 15)
  const routeMutation = useRouteDirections()

  // --- Debug logging ---
  useEffect(() => {
    console.log('[CitizenMapPage] userLocation:', userLocation)
  }, [userLocation])

  useEffect(() => {
    console.log('[CitizenMapPage] hospitals query:', {
      loading: hospitalsLoading,
      isError: hospitalsIsError,
      error: hospitalsError,
      count: hospitals.length,
      hospitals
    })
  }, [hospitals, hospitalsIsError, hospitalsError, hospitalsLoading])

  // Ask for the citizen's location as soon as the map loads so the "you are
  // here" pin shows up without needing an extra tap — same as Google Maps.
  // Silently ignored if denied; the map still works fine without it.
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('[CitizenMapPage] navigator.geolocation not available')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        console.log('[CitizenMapPage] got geolocation:', loc)
        setUserLocation(loc)
      },
      (err) => {
        console.error('[CitizenMapPage] geolocation error:', err)
      }
    )
  }, [])

  // When a hospital is picked, request a real road-following route from the
  // user's current location to it.
  useEffect(() => {
    if (!selectedHospital || !userLocation) {
      setRouteGeometry(null)
      setRouteInfo(null)
      return
    }
    console.log('[CitizenMapPage] requesting route:', { from: userLocation, to: selectedHospital })
    routeMutation.mutate(
      {
        origin_lat: userLocation.lat,
        origin_lng: userLocation.lng,
        dest_lat: selectedHospital.lat,
        dest_lng: selectedHospital.lng
      },
      {
        onSuccess: (data) => {
          console.log('[CitizenMapPage] route result:', data)
          setRouteGeometry(data.geometry.coordinates)
          setRouteInfo({
            distance_m: data.distance_m,
            duration_s: data.duration_s,
            duration_no_traffic_s: data.duration_no_traffic_s,
            provider: data.provider
          })
        },
        onError: (err) => {
          console.error('[CitizenMapPage] route request failed:', err)
          setRouteGeometry(null)
          setRouteInfo(null)
        }
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHospital?.id, userLocation?.lat, userLocation?.lng])

  return (
    // relative wrapper lets the map be the base layer, with all page UI
    // (ticker, error banner, zone detail) absolutely positioned on top of
    // it instead of pushing it down the page in normal flow.
    <div className="relative">
      <HeatMap
        zones={zones}
        hospitals={hospitals}
        onSelectZone={setSelectedZoneId}
        onSelectHospital={(h) => {
          setSelectedZoneId(null)
          setSelectedHospital(h)
        }}
        selectedZoneId={selectedZoneId ?? undefined}
        userLocation={userLocation}
        routeTo={selectedHospital ? { lat: selectedHospital.lat, lng: selectedHospital.lng } : null}
        routeGeometry={routeGeometry}
      />

      {/* Top overlay: live risk ticker, centered. pointer-events-none on the
          row so clicks pass through to the map except where the badge
          itself is (pointer-events-auto on the badge). */}
      {!isLoading && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-5">
          <div className="pointer-events-auto">
            <LiveRiskTicker zones={zones} />
          </div>
        </div>
      )}

      {isError && (
        <div className="pointer-events-none absolute inset-x-5 top-20 z-10">
          <div className="pointer-events-auto rounded-xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-700 shadow-sm backdrop-blur">
            {t('map.loadError')}
          </div>
        </div>
      )}

      {/* Bottom overlay: zone detail panel, or a helper hint when nothing
          is selected. Centered with a max width so it doesn't stretch
          full-width on large screens. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-10 p-5">
        <div className="pointer-events-auto mx-auto max-w-xl">
          {selectedZoneId ? (
            <ZoneDetailPanel zoneId={selectedZoneId} onClose={() => setSelectedZoneId(null)} />
          ) : selectedHospital ? (
            <div className="rounded-2xl border border-mist-200 bg-white/95 p-4 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-semibold">{selectedHospital.name}</h3>
                  {selectedHospital.phone && (
                    <p className="text-xs text-ink-600">{selectedHospital.phone}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedHospital(null)}
                  className="rounded-full px-2 py-1 text-xs text-ink-500 hover:bg-mist-100"
                >
                  ✕
                </button>
              </div>
              {routeMutation.isPending && (
                <p className="mt-2 text-sm text-ink-600">Calculating route…</p>
              )}
              {routeInfo && !routeMutation.isPending && (
                <div className="mt-2 text-sm text-ink-700">
                  <p>
                    {(routeInfo.distance_m / 1000).toFixed(1)} km · ~
                    {Math.round(routeInfo.duration_s / 60)} min
                    {routeInfo.provider === 'google' ? ' (live traffic)' : ' drive'}
                  </p>
                  {routeInfo.provider === 'google' && routeInfo.duration_no_traffic_s != null && (
                    <p className="mt-0.5 text-xs text-ink-500">
                      {routeInfo.duration_s > routeInfo.duration_no_traffic_s * 1.1
                        ? `~${Math.round((routeInfo.duration_s - routeInfo.duration_no_traffic_s) / 60)} min slower than usual due to traffic`
                        : 'Traffic is currently normal for this route'}
                    </p>
                  )}
                  {routeInfo.provider === 'osrm' && (
                    <p className="mt-0.5 text-xs text-ink-500">Free-flow estimate, no live traffic data</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-mist-200 bg-white/90 p-5 text-sm text-ink-600 shadow-sm backdrop-blur">
              {t('map.tapHint')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}