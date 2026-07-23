import { useEffect, useState } from 'react'
import { HeatMap, type Hospital } from '../components/HeatMap'
import type { HeatZoneSummary } from '@/lib/types'
import { ZoneDetailPanel } from '../components/ZoneDetailPanel'
import { LiveRiskTicker } from '../components/LiveRiskTicker'
// import { useHeatZones, useNearbyHospitals, useRouteDirections } from '@/lib/queries'
import { useLanguage } from '@/lib/i18n/language-context'

// --- MOCK DATA (backend hooks disabled below, remove when API is ready) ---
// Shape matches HeatZoneSummary from @/lib/types: centroid_lat/centroid_lng
// (not lat/lng), risk_level is "low" | "moderate" | "high" | "severe"
// (not "extreme"), and current_temp_c (not temp_c).
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
  {
    id: 'hosp-1',
    name: 'City General Hospital',
    lat: 16.8206,
    lng: 96.1445,
    phone: '+95 1 234 5678',
    emergency: true,
  },
  {
    id: 'hosp-2',
    name: 'Riverside Cooling Clinic',
    lat: 16.7981,
    lng: 96.1602,
    phone: '+95 1 234 9012',
  },
  {
    id: 'hosp-3',
    name: 'Park Belt Medical Center',
    lat: 16.8544,
    lng: 96.1330,
    phone: '+95 1 234 3456',
  },
]

const MOCK_ROUTE_GEOMETRY: [number, number][] = [
  [96.1445, 16.8206],
  [96.148, 16.815],
  [96.152, 16.808],
  [96.1561, 16.8035],
]

const MOCK_ROUTE_INFO = {
  distance_m: 4200,
  duration_s: 780,
  duration_no_traffic_s: 640,
  provider: 'osrm' as const,
}
// --- END MOCK DATA ---

export function CitizenMapPage() {
  // const { data: zones = [], isLoading, isError } = useHeatZones()
  const zones = MOCK_ZONES
  const isLoading = false
  const isError = false

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

  // const {
  //   data: hospitals = [],
  //   isError: hospitalsIsError,
  //   error: hospitalsError,
  //   isLoading: hospitalsLoading
  // } = useNearbyHospitals(userLocation?.lat, userLocation?.lng, 15)
  const hospitals = MOCK_HOSPITALS
  const hospitalsIsError = false
  const hospitalsError = null
  const hospitalsLoading = false

  // const routeMutation = useRouteDirections()
  // Mocked mutation-shaped object so the rest of the component (which calls
  // routeMutation.mutate / .isPending) doesn't need to change.
  const routeMutation = {
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
      // simulate a quick network delay then resolve with mock route data
      setTimeout(() => {
        opts?.onSuccess?.({
          geometry: { coordinates: MOCK_ROUTE_GEOMETRY },
          ...MOCK_ROUTE_INFO,
        })
      }, 300)
    },
  }

  // --- Debug logging ---
  useEffect(() => {
    console.log('[CitizenMapPage] userLocation:', userLocation)
  }, [userLocation])

  useEffect(() => {
    console.log('[CitizenMapPage] hospitals query (mocked):', {
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
    console.log('[CitizenMapPage] requesting route (mocked):', { from: userLocation, to: selectedHospital })
    routeMutation.mutate(
      {
        origin_lat: userLocation.lat,
        origin_lng: userLocation.lng,
        dest_lat: selectedHospital.lat,
        dest_lng: selectedHospital.lng
      },
      {
        onSuccess: (data) => {
          console.log('[CitizenMapPage] route result (mocked):', data)
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