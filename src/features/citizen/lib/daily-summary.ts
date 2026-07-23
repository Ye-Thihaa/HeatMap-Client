// Plain-language daily heat briefing. Not a real model call — it's a small
// rule-based generator over data we already have (zone risk/temps + time of
// day), styled and labeled as "AI" the same way the report flow's simulated
// photo analysis is. Swap this for a real LLM call later without touching
// how HomePage consumes it.

import type { HeatZoneSummary, RiskLevel } from '@/lib/types'

interface SummaryInput {
  zones: HeatZoneSummary[]
  risk: RiskLevel
  avgTemp: number | null
  hottest: HeatZoneSummary | null
  atRiskCount: number
  now: Date
}

const PEAK_WINDOW: Record<'moderate' | 'high' | 'severe', { startHour: number; endHour: number; label: string }> = {
  moderate: { startHour: 13, endHour: 15, label: '1–3pm' },
  high: { startHour: 13, endHour: 16, label: '1–4pm' },
  severe: { startHour: 12, endHour: 16, label: '12–4pm' }
}

const RISK_COPY: Record<RiskLevel, string> = {
  low: 'a calm',
  moderate: 'a moderate-risk',
  high: 'a high-risk',
  severe: 'an extreme-risk'
}

function timingAdvice(risk: RiskLevel, now: Date): string {
  if (risk === 'low') {
    return 'Conditions are manageable today — keep water on hand as usual.'
  }
  const window = PEAK_WINDOW[risk]
  const hour = now.getHours() + now.getMinutes() / 60
  if (hour < window.startHour) {
    return 'Hydrate before noon and plan any outdoor errands earlier in the day.'
  }
  if (hour <= window.endHour) {
    return "We're in the peak window right now — seek shade and sip water if you're outside."
  }
  return 'Peak heat has passed for today — keep hydrating through the evening as it eases.'
}

export function generateDailySummary({
  zones,
  risk,
  avgTemp,
  hottest,
  atRiskCount,
  now
}: SummaryInput): string | null {
  if (zones.length === 0 || avgTemp === null) return null

  const advice = timingAdvice(risk, now)

  if (risk === 'low') {
    return `Today's ${RISK_COPY[risk]} day for heat — no zones are flagged high risk right now. ${advice}`
  }

  const window = PEAK_WINDOW[risk]
  const hottestPart = hottest
    ? `, with ${hottest.name} running hottest at ${Math.round(hottest.current_temp_c)}°C`
    : ''
  return `Today's ${RISK_COPY[risk]} day — ${atRiskCount} of ${zones.length} zones are flagged high or severe${hottestPart}. The worst window looks like ${window.label}. ${advice}`
}
