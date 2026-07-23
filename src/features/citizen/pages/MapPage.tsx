import { useEffect, useMemo, useState } from 'react'
import { HeatMap, type Hospital } from '../components/HeatMap'
import type { CoolingCenter, HeatZoneSummary } from '@/lib/types'
import { ZoneDetailPanel } from '../components/ZoneDetailPanel'
import { LiveRiskTicker } from '../components/LiveRiskTicker'
import { useHeatZones, useNearbyHospitals, useNearbyCoolingCenters, useRouteDirections } from '@/lib/queries'
import { useLanguage } from '@/lib/i18n/language-context'

// --- MOCK DATA (used when the Mock/Live toggle is set to "mock") ---
const MOCK_ZONES: HeatZoneSummary[] = [
  { id: 'zone-1', name: 'Downtown Core', centroid_lat: 16.8409, centroid_lng: 96.1735, risk_level: 'severe', current_temp_c: 41 },
  { id: 'zone-2', name: 'Riverside District', centroid_lat: 16.8035, centroid_lng: 96.1561, risk_level: 'high', current_temp_c: 37 },
  { id: 'zone-3', name: 'Old Market Quarter', centroid_lat: 16.7789, centroid_lng: 96.1497, risk_level: 'moderate', current_temp_c: 33 },
  { id: 'zone-4', name: 'Green Park Belt', centroid_lat: 16.8592, centroid_lng: 96.1281, risk_level: 'low', current_temp_c: 27 },
  { id: 'zone-5', name: 'Industrial East', centroid_lat: 16.8117, centroid_lng: 96.2013, risk_level: 'severe', current_temp_c: 43 },
  { id: 'zone-6', name: 'Hlaing Market', centroid_lat: 16.8256, centroid_lng: 96.1102, risk_level: 'high', current_temp_c: 38 },
  { id: 'zone-7', name: 'Kandawgyi Lakeside', centroid_lat: 16.7972, centroid_lng: 96.1636, risk_level: 'low', current_temp_c: 28 },
  { id: 'zone-8', name: 'Thingangyun Residential', centroid_lat: 16.8298, centroid_lng: 96.1857, risk_level: 'moderate', current_temp_c: 34 },
  { id: 'zone-9', name: 'Insein Industrial Zone', centroid_lat: 16.8817, centroid_lng: 96.1012, risk_level: 'severe', current_temp_c: 42 },
  { id: 'zone-10', name: 'Botataung Waterfront', centroid_lat: 16.7735, centroid_lng: 96.1745, risk_level: 'moderate', current_temp_c: 32 },
  { id: 'zone-11', name: 'Mingalar Market Belt', centroid_lat: 16.8483, centroid_lng: 96.1613, risk_level: 'high', current_temp_c: 39 },
  { id: 'zone-12', name: 'Shwedagon Green Ring', centroid_lat: 16.7983, centroid_lng: 96.1495, risk_level: 'low', current_temp_c: 26 },
  { id: 'zone-13', name: 'North Okkalapa Blocks', centroid_lat: 16.8834, centroid_lng: 96.1802, risk_level: 'high', current_temp_c: 38 },
  { id: 'zone-14', name: 'Dala Crossing', centroid_lat: 16.7517, centroid_lng: 96.1697, risk_level: 'moderate', current_temp_c: 33 },
  { id: 'zone-15', name: 'Hlaing Riverside Park', centroid_lat: 16.8154, centroid_lng: 96.1288, risk_level: 'low', current_temp_c: 27 },
] as HeatZoneSummary[]

const MOCK_HOSPITALS: Hospital[] = [
  { id: 'hosp-1', name: 'City General Hospital', lat: 16.8206, lng: 96.1445, phone: '+95 1 234 5678', emergency: true },
  { id: 'hosp-2', name: 'Riverside Cooling Clinic', lat: 16.7981, lng: 96.1602, phone: '+95 1 234 9012' },
  { id: 'hosp-3', name: 'Park Belt Medical Center', lat: 16.8544, lng: 96.1330, phone: '+95 1 234 3456' },
]

// Mock cooling centers / water stations — same shape the real
// useNearbyCoolingCenters hook returns (see CoolingCentersPage), so the
// bottom panel and map markers work identically in both modes.
const MOCK_CENTERS: CoolingCenter[] = [
  {
    id: 'center-1',
    name: 'Downtown Community Cooling Hall',
    type: 'cooling_center',
    lat: 16.8380,
    lng: 96.1700,
    distance_km: 1.2,
    hours: '8:00 AM – 8:00 PM',
    capacity: 120,
    contact: '+95 1 555 0101',
    sponsor_name: null,
  },
  {
    id: 'center-2',
    name: 'Riverside Water Station',
    type: 'water_station',
    lat: 16.8010,
    lng: 96.1580,
    distance_km: 2.4,
    hours: '24 hours',
    capacity: null,
    contact: null,
    sponsor_name: 'City Rotary Club',
  },
  {
    id: 'center-3',
    name: 'Green Park Belt Cooling Center',
    type: 'cooling_center',
    lat: 16.8570,
    lng: 96.1300,
    distance_km: 3.6,
    hours: '9:00 AM – 6:00 PM',
    capacity: 80,
    contact: '+95 1 555 0177',
    sponsor_name: null,
  },
  {
    id: 'center-4',
    name: 'Market Quarter Water Point',
    type: 'water_station',
    lat: 16.7800,
    lng: 96.1510,
    distance_km: 4.1,
    hours: '6:00 AM – 10:00 PM',
    capacity: null,
    contact: null,
    sponsor_name: null,
  },
] as CoolingCenter[]

// Builds a fake-but-plausible route between two real points instead of a
// hardcoded line near downtown Yangon. It's still not a real road-following
// route (no OSRM/Google call happens in mock mode) — just a gently curved
// path so the line visibly starts at the user's actual location and ends
// at the actual destination, rather than always drawing the same fixed
// segment regardless of where either point is.
function buildMockRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
) {
  const steps = 6
  const coordinates: [number, number][] = []
  // small perpendicular offset at the midpoint so it reads as a route,
  // not a perfectly straight ruler-line
  const midT = 0.5
  const dx = destLng - originLng
  const dy = destLat - originLat
  const perpLng = -dy * 0.15
  const perpLat = dx * 0.15

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    // simple quadratic bezier through the offset midpoint
    const mLng = originLng + dx * midT + perpLng
    const mLat = originLat + dy * midT + perpLat
    const lng = (1 - t) * (1 - t) * originLng + 2 * (1 - t) * t * mLng + t * t * destLng
    const lat = (1 - t) * (1 - t) * originLat + 2 * (1 - t) * t * mLat + t * t * destLat
    coordinates.push([lng, lat])
  }

  // Haversine distance for a realistic-ish distance/duration pairing
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(destLat - originLat)
  const dLng = toRad(destLng - originLng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(originLat)) * Math.cos(toRad(destLat)) * Math.sin(dLng / 2) ** 2
  const straightLineDistance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  // roads are never perfectly straight — pad ~30% like a real route would
  const distance_m = Math.round(straightLineDistance * 1.3)
  // assume ~30 km/h average city driving speed for the mock estimate
  const duration_s = Math.round((distance_m / 1000) * 120)

  return {
    geometry: { coordinates },
    distance_m,
    duration_s,
    duration_no_traffic_s: Math.round(duration_s * 0.82),
    provider: 'osrm' as const,
  }
}
// --- END MOCK DATA ---

type DataMode = 'mock' | 'live'

export function CitizenMapPage() {
  // Mock mode is a dev/demo convenience only — it must never be reachable
  // in a production build, since a citizen relying on it during a real
  // heat event would be looking at fake hospitals/cooling centers/routes.
  // import.meta.env.PROD is set by Vite automatically based on build mode
  // (true for `vite build`, false for `vite dev`) — nothing to configure.
  const isProdBuild = import.meta.env.PROD
  const [dataMode, setDataMode] = useState<DataMode>(isProdBuild ? 'live' : 'mock')
  const isLive = dataMode === 'live'

  const { t } = useLanguage()
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  // True when the currently-open zone panel was opened by tapping the
  // user's own "you are here" pin (nearest-zone lookup) rather than by
  // tapping a real zone marker directly — lets us show an honest
  // "nearest monitored zone to your location" note instead of implying
  // this is an exact reading for the user's precise coordinates.
  const [zoneFromUserLocation, setZoneFromUserLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<CoolingCenter | null>(null)
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null)
  const [routeInfo, setRouteInfo] = useState<{
    distance_m: number
    duration_s: number
    duration_no_traffic_s: number | null
    provider: 'google' | 'osrm'
  } | null>(null)

  // Always call the real hooks (rules of hooks), but only use their data
  // when dataMode === 'live'. React Query hooks are cheap to have mounted
  // even if unused, and this avoids conditionally calling hooks.
  const liveZonesQuery = useHeatZones()
  const liveHospitalsQuery = useNearbyHospitals(userLocation?.lat, userLocation?.lng, 15)
  const liveCentersQuery = useNearbyCoolingCenters(userLocation?.lat, userLocation?.lng, 5)
  const routeMutationLive = useRouteDirections()

  const zones = isLive ? (liveZonesQuery.data ?? []) : MOCK_ZONES
  const isLoading = isLive ? liveZonesQuery.isLoading : false
  const isError = isLive ? liveZonesQuery.isError : false

  const hospitals = isLive ? (liveHospitalsQuery.data ?? []) : MOCK_HOSPITALS
  const hospitalsIsError = isLive ? liveHospitalsQuery.isError : false
  const hospitalsError = isLive ? liveHospitalsQuery.error : null
  const hospitalsLoading = isLive ? liveHospitalsQuery.isLoading : false

  const centers = isLive ? (liveCentersQuery.data ?? []) : MOCK_CENTERS
  const centersLoading = isLive ? liveCentersQuery.isLoading : false

  // Whichever of hospital/center is currently selected acts as the active
  // routing destination — same origin/route logic applies to both, so we
  // don't need to duplicate the routing effect per destination type.
  const routeDestination = selectedHospital
    ? { lat: selectedHospital.lat, lng: selectedHospital.lng }
    : selectedCenter
    ? { lat: selectedCenter.lat, lng: selectedCenter.lng }
    : null

  // Mocked mutation-shaped object, used only in mock mode so the rest of
  // the component (which calls routeMutation.mutate / .isPending) doesn't
  // need to branch everywhere.
  const routeMutationMock = {
    isPending: false,
    mutate: (
      _vars: {
        origin_lat: number
        origin_lng: number
        dest_lat: number
        dest_lng: number
      },
      opts?: {
        onSuccess?: (data: {
          geometry: { coordinates: [number, number][] }
          distance_m: number
          duration_s: number
          duration_no_traffic_s: number | null
          provider: 'google' | 'osrm'
        }) => void
        onError?: (err: unknown) => void
      }
    ) => {
      setTimeout(() => {
        const mockRoute = buildMockRoute(
          _vars.origin_lat,
          _vars.origin_lng,
          _vars.dest_lat,
          _vars.dest_lng
        )
        opts?.onSuccess?.(mockRoute)
      }, 300)
    },
  }

  const routeMutation = isLive ? routeMutationLive : routeMutationMock

  // NOTE: selection/route reset on dataMode change happens in
  // handleDataModeChange below, called directly from the toggle buttons —
  // NOT as a useEffect keyed on dataMode. A separate reset effect was
  // tried first but raced with the route-request effect (see it further
  // down, also keyed on dataMode): both effects fire in the same
  // post-render flush, but the route effect reads routeDestination from
  // the render that STILL has the old selectedHospital/selectedCenter in
  // state, since the reset effect's setState calls don't take effect
  // until a render after that. Doing the reset synchronously inside the
  // same click handler that changes dataMode guarantees both updates land
  // in the exact same render, so routeDestination is correctly null by
  // the time the route effect ever sees the new dataMode.
  function handleDataModeChange(mode: DataMode) {
    setDataMode(mode)
    setSelectedZoneId(null)
    setZoneFromUserLocation(false)
    setSelectedHospital(null)
    setSelectedCenter(null)
    setRouteGeometry(null)
    setRouteInfo(null)
  }

  // --- Debug logging ---
  useEffect(() => {
    console.log('[CitizenMapPage] dataMode:', dataMode)
  }, [dataMode])

  useEffect(() => {
    console.log('[CitizenMapPage] userLocation:', userLocation)
  }, [userLocation])

  useEffect(() => {
    console.log(`[CitizenMapPage] hospitals query (${dataMode}):`, {
      loading: hospitalsLoading,
      isError: hospitalsIsError,
      error: hospitalsError,
      count: hospitals.length,
      hospitals
    })
  }, [hospitals, hospitalsIsError, hospitalsError, hospitalsLoading])

  useEffect(() => {
    console.log(`[CitizenMapPage] cooling centers query (${dataMode}):`, {
      loading: centersLoading,
      count: centers.length,
      centers
    })
  }, [centers, centersLoading])

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

  // When a hospital or cooling center is picked, request a route from the
  // user's current location to it (real OSRM/Google call in live mode,
  // mocked in mock mode).
  useEffect(() => {
    if (!routeDestination || !userLocation) {
      setRouteGeometry(null)
      setRouteInfo(null)
      return
    }
    console.log(`[CitizenMapPage] requesting route (${dataMode}):`, { from: userLocation, to: routeDestination })
    routeMutation.mutate(
      {
        origin_lat: userLocation.lat,
        origin_lng: userLocation.lng,
        dest_lat: routeDestination.lat,
        dest_lng: routeDestination.lng
      },
      {
        onSuccess: (data) => {
          // api-client.ts's RouteDirectionsResult type is missing
          // duration_no_traffic_s and provider even though the backend
          // genuinely returns both (confirmed at runtime) — this cast
          // reflects the real response shape until that type is fixed
          // upstream. TODO: add these two fields to RouteDirectionsResult
          // in api-client.ts so this cast can be removed.
          const result = data as typeof data & {
            duration_no_traffic_s: number | null
            provider: 'google' | 'osrm'
          }
          console.log('[CitizenMapPage] route result:', result)
          setRouteGeometry(result.geometry.coordinates)
          setRouteInfo({
            distance_m: result.distance_m,
            duration_s: result.duration_s,
            duration_no_traffic_s: result.duration_no_traffic_s,
            provider: result.provider
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
  }, [selectedHospital?.id, selectedCenter?.id, userLocation?.lat, userLocation?.lng, dataMode])

  // Nearest zone to the user's real location, by straight-line distance —
  // same "nearest centroid" approach the backend already uses for the
  // assistant endpoint and the route safety-check, kept consistent here
  // rather than inventing a different method client-side.
  const nearestZoneToUser = useMemo(() => {
    if (!userLocation || zones.length === 0) return null
    let best: HeatZoneSummary | null = null
    let bestDist = Infinity
    for (const z of zones) {
      const d = (z.centroid_lat - userLocation.lat) ** 2 + (z.centroid_lng - userLocation.lng) ** 2
      if (d < bestDist) {
        bestDist = d
        best = z
      }
    }
    return best
  }, [userLocation, zones])

  return (
    <div className="relative">
      <HeatMap
        zones={zones}
        hospitals={hospitals}
        centers={centers}
        onSelectZone={(id) => {
          setSelectedHospital(null)
          setSelectedCenter(null)
          setZoneFromUserLocation(false)
          setSelectedZoneId(id)
        }}
        onSelectHospital={(h) => {
          console.log(`[CitizenMapPage] hospital marker CLICKED (${dataMode}):`, h.name, h.id)
          setSelectedZoneId(null)
          setSelectedCenter(null)
          setSelectedHospital(h)
        }}
        onSelectCenter={(c) => {
          console.log(`[CitizenMapPage] center marker CLICKED (${dataMode}):`, c.name, c.id)
          setSelectedZoneId(null)
          setSelectedHospital(null)
          setSelectedCenter(c)
        }}
        onSelectUserLocation={() => {
          if (!nearestZoneToUser) return
          console.log('[CitizenMapPage] user location tapped, nearest zone:', nearestZoneToUser)
          setSelectedHospital(null)
          setSelectedCenter(null)
          setZoneFromUserLocation(true)
          setSelectedZoneId(nearestZoneToUser.id)
        }}
        selectedZoneId={selectedZoneId ?? undefined}
        userLocation={userLocation}
        routeTo={routeDestination}
        routeGeometry={routeGeometry}
      />

      {/* Top overlay: mock/live toggle (dev only) + live risk ticker, centered. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-2 p-5">
        {!isProdBuild && (
          <div className="pointer-events-auto flex rounded-full border border-mist-200 bg-white/95 p-1 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => handleDataModeChange('mock')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                dataMode === 'mock' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-mist-100'
              }`}
            >
              Mock data
            </button>
            <button
              type="button"
              onClick={() => handleDataModeChange('live')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                dataMode === 'live' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-mist-100'
              }`}
            >
              Live data
            </button>
          </div>
        )}

        {!isLoading && (
          <div className="pointer-events-auto">
            {/* FIX: LiveRiskTicker is now clickable — passing
                onSelectFirstAtRisk wires it to select the hottest
                currently at-risk zone, which reuses HeatMap's existing
                selectedZoneId flyTo + highlight ring + floating
                name/temp label, so tapping the "N zones at high risk"
                pill visibly points out that zone on the map exactly the
                same way clicking its marker would. */}
            <LiveRiskTicker
              zones={zones}
              onSelectFirstAtRisk={(zoneId) => {
                setSelectedHospital(null)
                setSelectedCenter(null)
                setZoneFromUserLocation(false)
                setSelectedZoneId(zoneId)
              }}
            />
          </div>
        )}
      </div>

      {isError && (
        <div className="pointer-events-none absolute inset-x-5 top-32 z-10">
          <div className="pointer-events-auto rounded-xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-700 shadow-sm backdrop-blur">
            {t('map.loadError')}
          </div>
        </div>
      )}

      {/* Bottom overlay: zone detail panel, hospital/center detail, or a
          helper hint when nothing is selected. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-10 p-5">
        <div className="pointer-events-auto mx-auto max-w-xl">
          {selectedZoneId ? (
            <div>
              {zoneFromUserLocation && (
                <div className="mb-1.5 rounded-full bg-white/90 px-3 py-1 text-center text-[11px] font-medium text-ink-600 shadow-sm backdrop-blur">
                  Nearest monitored zone to your location
                </div>
              )}
              <ZoneDetailPanel
                zoneId={selectedZoneId}
                onClose={() => {
                  setSelectedZoneId(null)
                  setZoneFromUserLocation(false)
                }}
                dataMode={dataMode}
              />
            </div>
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
          ) : selectedCenter ? (
            <div className="rounded-2xl border border-mist-200 bg-white/95 p-4 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-semibold">{selectedCenter.name}</h3>
                  <span className="text-xs text-ink-600">
                    {selectedCenter.type === 'water_station' ? '💧 Water Station' : '❄️ Cooling Center'}
                  </span>
                  {selectedCenter.sponsor_name && (
                    <span className="ml-1.5 rounded-full bg-mist-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
                      Sponsored by {selectedCenter.sponsor_name}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedCenter(null)}
                  className="rounded-full px-2 py-1 text-xs text-ink-500 hover:bg-mist-100"
                >
                  ✕
                </button>
              </div>

              <dl className="mt-2 space-y-1 text-sm text-ink-700">
                <div className="flex justify-between">
                  <dt>Hours</dt>
                  <dd>{selectedCenter.hours}</dd>
                </div>
                {selectedCenter.capacity != null && (
                  <div className="flex justify-between">
                    <dt>Capacity</dt>
                    <dd>{selectedCenter.capacity}</dd>
                  </div>
                )}
                {selectedCenter.contact && (
                  <div className="flex justify-between">
                    <dt>Contact</dt>
                    <dd>{selectedCenter.contact}</dd>
                  </div>
                )}
              </dl>

              {routeMutation.isPending && (
                <p className="mt-2 text-sm text-ink-600">Calculating route…</p>
              )}
              {routeInfo && !routeMutation.isPending && (
                <div className="mt-2 border-t border-mist-100 pt-2 text-sm text-ink-700">
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