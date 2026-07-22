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
  InterventionRecord
} from './types'

// In dev, requests go through the Vite proxy at /api (see vite.config.ts) so the
// browser never needs CORS configured on the FastAPI side. In prod, point
// VITE_API_BASE_URL at the deployed backend.
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

  // Heat zones
  getHeatZones: () => request<HeatZoneSummary[]>('/heat-zones'),
  getHeatZone: (id: string) => request<HeatZoneDetail>(`/heat-zones/${id}`),

  // Cooling centers
  getNearbyCoolingCenters: (lat: number, lng: number, radiusKm = 5) =>
    request<CoolingCenter[]>(
      `/cooling-centers/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`
    ),

  // Citizen reports
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

  // Dashboard
  getDashboardRankings: () => request<DashboardRankingEntry[]>('/dashboard/rankings'),
  getCoolingGapPriorities: () =>
    request<CoolingGapPriorityEntry[]>('/dashboard/cooling-gaps'),

  // Interventions
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
    request<InterventionRecord[]>(`/interventions/${zoneId}`)
}

export { ApiError }
