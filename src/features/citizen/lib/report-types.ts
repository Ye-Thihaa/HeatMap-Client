// Local to the citizen hazard-report flow — NOT part of the FastAPI-mirrored
// schema in `@/lib/types`. The backend has no endpoints yet for photos,
// severity, affected groups, or contact preferences, so this whole flow
// (types, storage, form) is a self-contained client-side prototype.

export type IssueCategory =
  | 'no_shade_trees'
  | 'broken_shade_structure'
  | 'heat_trapping_surface'
  | 'no_water_access'
  | 'other'

export const ISSUE_CATEGORIES: { value: IssueCategory; label: string }[] = [
  { value: 'no_shade_trees', label: 'No Shade / Trees' },
  { value: 'broken_shade_structure', label: 'Broken Shade Structure' },
  { value: 'heat_trapping_surface', label: 'Heat-Trapping Surface' },
  { value: 'no_water_access', label: 'No Water Access Nearby' },
  { value: 'other', label: 'Other' }
]

export const ISSUE_CATEGORY_LABEL: Record<IssueCategory, string> = Object.fromEntries(
  ISSUE_CATEGORIES.map((c) => [c.value, c.label])
) as Record<IssueCategory, string>

export type Severity = 'low' | 'medium' | 'high'

export const SEVERITY_META: Record<Severity, { label: string; active: string }> = {
  low: { label: 'Low', active: 'border-risk-low bg-risk-low/15 text-risk-low' },
  medium: { label: 'Medium', active: 'border-risk-moderate bg-risk-moderate/15 text-amber-700' },
  high: { label: 'High', active: 'border-risk-high bg-risk-high/15 text-risk-high' }
}

export type AffectedGroup = 'pedestrians' | 'commuters' | 'elderly_pwd' | 'children' | 'vendors_workers'

export const AFFECTED_GROUPS: { value: AffectedGroup; label: string }[] = [
  { value: 'pedestrians', label: 'Pedestrians' },
  { value: 'commuters', label: 'Commuters (bus/jeepney stop)' },
  { value: 'elderly_pwd', label: 'Elderly or PWD' },
  { value: 'children', label: 'Children' },
  { value: 'vendors_workers', label: 'Vendors / outdoor workers' }
]

export interface AiPhotoAnalysis {
  surfaceType: string
  shadeCoveragePct: number
  visibleDamage: boolean
  suggestedUrgency: Severity
}

export type ReportStatus = 'pending' | 'under_review' | 'action_taken'

export const STATUS_META: Record<ReportStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-mist-100 text-ink-600' },
  under_review: { label: 'Under Review', className: 'bg-risk-moderate/15 text-amber-700' },
  action_taken: { label: 'Action Taken', className: 'bg-safe/15 text-safe-dark' }
}

export interface MyReport {
  id: string
  category: IssueCategory
  severity: Severity
  aiUrgency: Severity | null
  status: ReportStatus
  createdAt: string
  addressText: string
}
