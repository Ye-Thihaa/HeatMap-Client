// Plain-language daily heat briefing. Not a real model call — it's a small
// rule-based generator over data we already have (zone risk/temps + time of
// day), styled and labeled as "AI" the same way the report flow's simulated
// photo analysis is. Swap this for a real LLM call later without touching
// how HomePage consumes it.

import type { HeatZoneSummary, RiskLevel } from '@/lib/types'
import type { Lang } from '@/lib/i18n/language-context'

interface SummaryInput {
  zones: HeatZoneSummary[]
  risk: RiskLevel
  avgTemp: number | null
  hottest: HeatZoneSummary | null
  atRiskCount: number
  now: Date
  lang: Lang
}

const PEAK_WINDOW: Record<
  'moderate' | 'high' | 'severe',
  { startHour: number; endHour: number; label: string; labelMm: string }
> = {
  moderate: { startHour: 13, endHour: 15, label: '1–3pm', labelMm: 'နေ့လယ် ၁ နာရီမှ ၃ နာရီ' },
  high: { startHour: 13, endHour: 16, label: '1–4pm', labelMm: 'နေ့လယ် ၁ နာရီမှ ၄ နာရီ' },
  severe: { startHour: 12, endHour: 16, label: '12–4pm', labelMm: 'နေ့လည် ၁၂ နာရီမှ ညနေ ၄ နာရီ' }
}

const RISK_COPY: Record<RiskLevel, string> = {
  low: 'a calm',
  moderate: 'a moderate-risk',
  high: 'a high-risk',
  severe: 'an extreme-risk'
}

const RISK_COPY_MM: Record<RiskLevel, string> = {
  low: 'အေးမြသော',
  moderate: 'အန္တရာယ်အလတ်စား',
  high: 'အန္တရာယ်များသော',
  severe: 'အလွန်အန္တရာယ်ကြီးသော'
}

function timingAdvice(risk: RiskLevel, now: Date, lang: Lang): string {
  if (risk === 'low') {
    return lang === 'mm'
      ? 'ယနေ့အခြေအနေက စိုးရိမ်စရာမလိုပါ — ပုံမှန်အတိုင်း ရေအလုံအလောက်သောက်ပါ။'
      : 'Conditions are manageable today — keep water on hand as usual.'
  }
  const window = PEAK_WINDOW[risk]
  const hour = now.getHours() + now.getMinutes() / 60
  if (hour < window.startHour) {
    return lang === 'mm'
      ? 'မွန်းတည့်မတိုင်မီ ရေဓာတ်ဖြည့်ပြီး၊ အပြင်ထွက်ရမည့်အလုပ်များကို စောစီးစွာ စီစဉ်ပါ။'
      : 'Hydrate before noon and plan any outdoor errands earlier in the day.'
  }
  if (hour <= window.endHour) {
    return lang === 'mm'
      ? 'ယခုအချိန်သည် အပူအထွတ်အထိပ်ကာလဖြစ်သဖြင့် — အရိပ်ရှာပြီး ရေသောက်ပါ။'
      : "We're in the peak window right now — seek shade and sip water if you're outside."
  }
  return lang === 'mm'
    ? 'ယနေ့အတွက် အပူအထွတ်အထိပ်ကာလ ကုန်ဆုံးသွားပါပြီ — ညနေပိုင်းအထိ ရေဓာတ်ဆက်ဖြည့်ပါ။'
    : 'Peak heat has passed for today — keep hydrating through the evening as it eases.'
}

export function generateDailySummary({
  zones,
  risk,
  avgTemp,
  hottest,
  atRiskCount,
  now,
  lang
}: SummaryInput): string | null {
  if (zones.length === 0 || avgTemp === null) return null

  const advice = timingAdvice(risk, now, lang)

  if (risk === 'low') {
    return lang === 'mm'
      ? `ယနေ့သည် အပူရှိန် ${RISK_COPY_MM.low} နေ့ဖြစ်ပါသည် — ယခုအချိန် အန္တရာယ်များသောနေရာ မရှိပါ။ ${advice}`
      : `Today's ${RISK_COPY.low} day for heat — no zones are flagged high risk right now. ${advice}`
  }

  const window = PEAK_WINDOW[risk]

  if (lang === 'mm') {
    const hottestPartMm = hottest
      ? `၊ ${hottest.name} တွင် အပူဆုံးဖြစ်ပြီး ${Math.round(hottest.current_temp_c)}°C ရှိပါသည်`
      : ''
    return `ယနေ့သည် ${RISK_COPY_MM[risk]} နေ့ဖြစ်ပါသည် — နေရာ ${zones.length} ခုအနက် ${atRiskCount} ခုသည် အန္တရာယ်များ/အလွန်အန္တရာယ်ကြီးဟု အမှတ်အသားပြုထားပါသည်${hottestPartMm}။ အပူဆုံးကာလမှာ ${window.labelMm} ခန့်ဖြစ်နိုင်ပါသည်။ ${advice}`
  }

  const hottestPart = hottest
    ? `, with ${hottest.name} running hottest at ${Math.round(hottest.current_temp_c)}°C`
    : ''
  return `Today's ${RISK_COPY[risk]} day — ${atRiskCount} of ${zones.length} zones are flagged high or severe${hottestPart}. The worst window looks like ${window.label}. ${advice}`
}
