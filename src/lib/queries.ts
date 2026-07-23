import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api-client'
import type {
  CoolingGapReportInput,
  CoolingGapStatus,
  HeatReportInput,
  InterventionEstimate,
  InterventionEstimateInput
} from './types'
import type { AssistantMessageInput, RouteDirectionsInput } from './api-client'

// --- Query keys, centralized so invalidation stays consistent ---
export const qk = {
  heatZones: ['heat-zones'] as const,
  heatZone: (id: string) => ['heat-zones', id] as const,
  coolingCentersNearby: (lat: number, lng: number, radiusKm: number) =>
    ['cooling-centers', 'nearby', lat, lng, radiusKm] as const,
  hospitalsNearby: (lat: number, lng: number, radiusKm: number) =>
    ['hospitals', 'nearby', lat, lng, radiusKm] as const,
  dashboardRankings: ['dashboard', 'rankings'] as const,
  coolingGapPriorities: ['dashboard', 'cooling-gaps'] as const,
  coolingGapReports: (status?: CoolingGapStatus) =>
    ['cooling-gap-reports', status ?? 'all'] as const,
  interventionHistory: (zoneId: string) => ['interventions', zoneId] as const
}

// --- Citizen app ---

export function useHeatZones() {
  return useQuery({
    queryKey: qk.heatZones,
    queryFn: api.getHeatZones,
    // Zones update from a periodic weather refresh job, not every second —
    // poll gently so the map/ticker feel live without hammering the API.
    refetchInterval: 60_000
  })
}

export function useHeatZone(id: string | undefined) {
  return useQuery({
    queryKey: qk.heatZone(id ?? ''),
    queryFn: () => api.getHeatZone(id as string),
    enabled: Boolean(id)
  })
}

export function useNearbyCoolingCenters(
  lat: number | undefined,
  lng: number | undefined,
  radiusKm = 5
) {
  return useQuery({
    queryKey: qk.coolingCentersNearby(lat ?? 0, lng ?? 0, radiusKm),
    queryFn: () => api.getNearbyCoolingCenters(lat as number, lng as number, radiusKm),
    enabled: lat !== undefined && lng !== undefined
  })
}

export function useNearbyHospitals(
  lat: number | undefined,
  lng: number | undefined,
  radiusKm = 5
) {
  // Round to ~100m precision — hospital search doesn't need GPS-jitter
  // precision, and this prevents tiny location fluctuations (or an
  // upstream watchPosition somewhere) from spamming Overpass with a new
  // request on every micro-movement.
  const roundedLat = lat !== undefined ? Math.round(lat * 1000) / 1000 : undefined
  const roundedLng = lng !== undefined ? Math.round(lng * 1000) / 1000 : undefined

  return useQuery({
    queryKey: qk.hospitalsNearby(roundedLat ?? 0, roundedLng ?? 0, radiusKm),
    queryFn: () => api.getNearbyHospitals(roundedLat as number, roundedLng as number, radiusKm),
    enabled: roundedLat !== undefined && roundedLng !== undefined,
    // hospital locations don't change minute-to-minute — no need to poll
    staleTime: 10 * 60_000
  })
}

export function useRouteDirections() {
  return useMutation({
    mutationFn: (input: RouteDirectionsInput) => api.getRouteDirections(input)
  })
}

export function useAssistantMessage() {
  return useMutation({
    mutationFn: (input: AssistantMessageInput) => api.sendAssistantMessage(input)
  })
}

export function useSubmitHeatReport() {
  return useMutation({
    mutationFn: (input: HeatReportInput) => api.submitHeatReport(input)
  })
}

export function useSubmitCoolingGapReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CoolingGapReportInput) => api.submitCoolingGapReport(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cooling-gap-reports'] })
      queryClient.invalidateQueries({ queryKey: qk.coolingGapPriorities })
    }
  })
}

// --- Gov dashboard ---

export function useDashboardRankings() {
  return useQuery({
    queryKey: qk.dashboardRankings,
    queryFn: api.getDashboardRankings,
    refetchInterval: 60_000
  })
}

export function useCoolingGapPriorities() {
  return useQuery({
    queryKey: qk.coolingGapPriorities,
    queryFn: api.getCoolingGapPriorities,
    refetchInterval: 60_000
  })
}

export function useCoolingGapReports(status?: CoolingGapStatus) {
  return useQuery({
    queryKey: qk.coolingGapReports(status),
    queryFn: () => api.getCoolingGapReports(status)
  })
}

export function useUpdateCoolingGapReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CoolingGapStatus }) =>
      api.updateCoolingGapReport(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cooling-gap-reports'] })
      queryClient.invalidateQueries({ queryKey: qk.coolingGapPriorities })
    }
  })
}

export function useEstimateIntervention() {
  return useMutation({
    mutationFn: (input: InterventionEstimateInput) => api.estimateIntervention(input)
  })
}

export function useSaveIntervention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InterventionEstimateInput & InterventionEstimate) =>
      api.saveIntervention(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: qk.interventionHistory(variables.zone_id)
      })
    }
  })
}

export function useInterventionHistory(zoneId: string | undefined) {
  return useQuery({
    queryKey: qk.interventionHistory(zoneId ?? ''),
    queryFn: () => api.getInterventionHistory(zoneId as string),
    enabled: Boolean(zoneId)
  })
}