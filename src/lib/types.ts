// Types mirror the FastAPI backend. Adjust field names here if the backend's
// actual schema differs slightly — this is the single place to update.

export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe'

export interface HeatZoneSummary {
  id: string
  name: string
  risk_level: RiskLevel
  current_temp_c: number
  geometry: GeoJSON.Geometry
  centroid_lat: number
  centroid_lng: number
}

export interface HeatZoneHistoryPoint {
  timestamp: string
  temp_c: number
  risk_level: RiskLevel
}

export interface HeatZoneDetail extends HeatZoneSummary {
  green_cover_pct: number
  population_density: number
  history: HeatZoneHistoryPoint[]
}

export type CoolingCenterType = 'cooling_center' | 'water_station'

export interface CoolingCenter {
  id: string
  name: string
  lat: number
  lng: number
  distance_km: number
  hours: string
  capacity: number
  contact: string
  type: CoolingCenterType
  sponsor_name?: string | null
}

export type CoolingGapCategory =
  | 'no_cooling_center'
  | 'insufficient_capacity'
  | 'closed_or_inactive'
  | 'too_far'
  | 'other'

export type CoolingGapStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'in_review'
  | 'success'
  | 'failed'
  | 'expired'

export interface CoolingGapReport {
  id: string
  zone_id: string
  lat: number
  lng: number
  category: CoolingGapCategory
  description?: string
  status: CoolingGapStatus
  created_at: string
}

export interface CoolingGapReportInput {
  lat: number
  lng: number
  category: CoolingGapCategory
  description?: string
  zone_id?: string
}

export interface HeatReportInput {
  lat: number
  lng: number
  estimated_temp_c: number
  description?: string
}

export interface DashboardRankingEntry {
  zone_id: string
  zone_name: string
  risk_level: RiskLevel
  current_temp_c: number
  rank: number
}

export interface CoolingGapPriorityEntry {
  zone_id: string
  zone_name: string
  open_report_count: number
  categories: { category: CoolingGapCategory; count: number }[]
  latest_report_at: string
}

export type InterventionType =
  | 'tree_planting'
  | 'cooling_center'
  | 'material_change'
  | 'shade_structure'

export interface InterventionEstimateInput {
  zone_id: string
  intervention_type: InterventionType
  quantity: number
}

export interface InterventionEstimate {
  estimated_reduction_c: number
  confidence: number // 0-1
  reasoning: string
}

export interface InterventionRecord extends InterventionEstimate {
  id: string
  zone_id: string
  intervention_type: InterventionType
  quantity: number
  created_at: string
}

export type RouteSafetyLevel = 'safe' | 'caution' | 'risky' | 'unknown'

export interface RouteSafetyInput {
  origin_lat: number
  origin_lng: number
  dest_lat: number
  dest_lng: number
  samples?: number
}

export interface RouteSafetyResult {
  overall_safety: RouteSafetyLevel
  high_risk_zone_count: number
  zones_passed: { zone_id: string; name: string; risk_level: RiskLevel }[]
  note: string
}