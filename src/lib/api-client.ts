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
  high: '#FB7A34',
  severe: '#EF4444'
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

export const api = {
  health: () => request<{ status: string }>('/health'),

  getHeatZones: () => request<HeatZoneSummary[]>('/heat-zones'),
  getHeatZone: (id: string) => request<HeatZoneDetail>(`/heat-zones/${id}`),

  getNearbyCoolingCenters: (lat: number, lng: number, radiusKm = 5) =>
    request<CoolingCenter[]>(
      `/cooling-centers/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`
    ),

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