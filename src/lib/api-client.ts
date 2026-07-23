import type {
  CoolingCenter,
  CoolingGapPriorityEntry,
  CoolingGapReport,
  CoolingGapReportInput,
  CoolingGapStatus,
  DashboardRankingEntry,
  HeatReportInput,
  HeatZoneDetail,
  HeatZoneSummary,
  InterventionEstimate,
  InterventionEstimateInput,
  InterventionRecord,
  RiskLevel,
  RouteSafetyInput,
  RouteSafetyResult
} from './types'

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#34D399',
  moderate: '#FBBF24',
  high: '#EF4444',
  severe: '#B91C1C'
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ? '' : '/api'
const API_ROOT = import.meta.env.VITE_API_BASE_URL ?? BASE_URL

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(body || res.statusText, res.status)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// --- New types for hospitals / routing / assistant ---
// NOTE: these would normally live in ./types alongside the others — added
// here instead since that file wasn't available to edit directly. Worth
// moving into types.ts for consistency when convenient.
export interface Hospital {
  id: string
  name: string
  lat: number
  lng: number
  emergency?: boolean
  phone?: string | null
}

export interface RouteDirectionsInput {
  origin_lat: number
  origin_lng: number
  dest_lat: number
  dest_lng: number
}

export interface RouteDirectionsResult {
  distance_m: number
  duration_s: number
  geometry: { type: 'LineString'; coordinates: [number, number][] }
  note: string
}

export interface AssistantMessageInput {
  message: string
  lat?: number | null
  lng?: number | null
  history?: { role: 'user' | 'assistant'; text: string }[]
  language?: 'en' | 'mm'
}

export interface AssistantMessageResult {
  reply: string
  zone_context: {
    name: string
    risk_level: RiskLevel
    current_temp_c: number
    green_cover_pct: number
  } | null
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  getHeatZones: () => request<HeatZoneSummary[]>('/heat-zones'),
  getHeatZone: (id: string) => request<HeatZoneDetail>(`/heat-zones/${id}`),

  getNearbyCoolingCenters: (lat: number, lng: number, radiusKm = 5) =>
    request<CoolingCenter[]>(
      `/cooling-centers/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`
    ),

  getNearbyHospitals: (lat: number, lng: number, radiusKm = 5) =>
    request<Hospital[]>(
      `/hospitals/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`
    ),

  getRouteDirections: (input: RouteDirectionsInput) =>
    request<RouteDirectionsResult>('/route/directions', {
      method: 'POST',
      body: JSON.stringify(input)
    }),

  sendAssistantMessage: (input: AssistantMessageInput) =>
    request<AssistantMessageResult>('/assistant/message', {
      method: 'POST',
      body: JSON.stringify(input)
    }),

  submitHeatReport: (input: HeatReportInput) =>
    request<{ id: string }>('/reports', {
      method: 'POST',
      body: JSON.stringify(input)
    }),

  submitCoolingGapReport: (input: CoolingGapReportInput) =>
    request<CoolingGapReport>('/cooling-gap-reports', {
      method: 'POST',
      body: JSON.stringify(input)
    }),

  getCoolingGapReports: (status?: CoolingGapStatus) =>
    request<CoolingGapReport[]>(
      `/cooling-gap-reports${status ? `?status=${status}` : ''}`
    ),

  updateCoolingGapReport: (id: string, status: CoolingGapStatus) =>
    request<CoolingGapReport>(`/cooling-gap-reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  getDashboardRankings: () => request<DashboardRankingEntry[]>('/dashboard/rankings'),
  getCoolingGapPriorities: () =>
    request<CoolingGapPriorityEntry[]>('/dashboard/cooling-gaps'),

  estimateIntervention: (input: InterventionEstimateInput) =>
    request<InterventionEstimate>('/interventions/estimate', {
      method: 'POST',
      body: JSON.stringify(input)
    }),

  saveIntervention: (input: InterventionEstimateInput & InterventionEstimate) =>
    request<InterventionRecord>('/interventions', {
      method: 'POST',
      body: JSON.stringify(input)
    }),

  getInterventionHistory: (zoneId: string) =>
    request<InterventionRecord[]>(`/interventions/${zoneId}`),

  checkRouteSafety: (input: RouteSafetyInput) =>
    request<RouteSafetyResult>('/route/safety-check', {
      method: 'POST',
      body: JSON.stringify(input)
    })
}

export { ApiError }