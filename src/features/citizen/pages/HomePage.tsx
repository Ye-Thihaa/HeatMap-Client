import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { Sun, Flame, ChevronRight, Sparkles } from 'lucide-react'
import { useHeatZones } from '@/lib/queries'
import type { HeatZoneSummary, RiskLevel } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/language-context'
import { generateDailySummary } from '../lib/daily-summary'

const DEFAULT_LOCATION = 'Yangon, Myanmar'

const riskOrder: RiskLevel[] = ['low', 'moderate', 'high', 'severe']

const riskMeta: Record<RiskLevel, { labelKey: string; text: string; bg: string; soft: string; pct: number }> = {
  low: { labelKey: 'risk.low', text: 'text-risk-low', bg: 'bg-risk-low', soft: 'bg-risk-low/15', pct: 10 },
  moderate: {
    labelKey: 'risk.moderate',
    text: 'text-risk-moderate',
    bg: 'bg-risk-moderate',
    soft: 'bg-risk-moderate/15',
    pct: 40
  },
  high: { labelKey: 'risk.high', text: 'text-risk-high', bg: 'bg-risk-high', soft: 'bg-risk-high/15', pct: 70 },
  severe: {
    labelKey: 'risk.severe',
    text: 'text-risk-severe',
    bg: 'bg-risk-severe',
    soft: 'bg-risk-severe/15',
    pct: 95
  }
}

function cityRiskLevel(zones: HeatZoneSummary[]): RiskLevel {
  let worst: RiskLevel = 'low'
  for (const zone of zones) {
    if (riskOrder.indexOf(zone.risk_level) > riskOrder.indexOf(worst)) worst = zone.risk_level
  }
  return worst
}

export function CitizenHomePage() {
  const { data: zones = [], isLoading } = useHeatZones()
  const { lang, t } = useLanguage()

  const [now, setNow] = useState(() => new Date())
  const [locationName, setLocationName] = useState(DEFAULT_LOCATION)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
            { headers: { 'User-Agent': 'HeatMap-Client/1.0' } }
          )
          const data = await res.json()
          if (data?.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.county
            const country = data.address.country
            const parts = [city, country].filter(Boolean)
            if (parts.length > 0) setLocationName(parts.join(', '))
          }
        } catch {
          /* use default */
        }
      },
      () => {
        /* use default */
      }
    )
  }, [])

  const { avgTemp, risk, hottest, atRiskCount } = useMemo(() => {
    if (zones.length === 0) {
      return { avgTemp: null as number | null, risk: 'low' as RiskLevel, hottest: null as HeatZoneSummary | null, atRiskCount: 0 }
    }
    const avg = zones.reduce((sum, z) => sum + z.current_temp_c, 0) / zones.length
    const hottestZone = zones.reduce((a, b) => (b.current_temp_c > a.current_temp_c ? b : a))
    const atRisk = zones.filter((z) => z.risk_level === 'high' || z.risk_level === 'severe').length
    return { avgTemp: Math.round(avg), risk: cityRiskLevel(zones), hottest: hottestZone, atRiskCount: atRisk }
  }, [zones])

  const meta = riskMeta[risk]
  const dateLocale = lang === 'mm' ? 'my-MM' : undefined
  const timeLabel = now.toLocaleTimeString(dateLocale, { hour: 'numeric', minute: '2-digit' })
  const dateLabel = now.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })

  const dailySummary = useMemo(
    () => generateDailySummary({ zones, risk, avgTemp, hottest, atRiskCount, now, lang }),
    [zones, risk, avgTemp, hottest, atRiskCount, now, lang]
  )

  return (
    <div className="mx-auto max-w-lg space-y-6 px-5 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t('home.welcome')}</h1>
        <p className="text-sm text-ink-600">{t('home.subtitle')}</p>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-risk-high to-risk-severe p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0 bg-black/10" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-sm text-white/80">{locationName}</p>
            <p className="mt-3 font-display text-6xl font-semibold tracking-tight">
              {avgTemp !== null ? `${avgTemp}°C` : '--'}
            </p>
            <p className="mt-1 text-sm font-medium">{t('home.heatRisk', { level: t(meta.labelKey) })}</p>
          </div>
          <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <Sun className="h-7 w-7" />
          </div>
        </div>

        <div className="relative z-10 mt-6 flex items-center justify-between text-sm text-white/80">
          <span>{timeLabel}</span>
          <span>{dateLabel}</span>
        </div>

        {hottest && (
          <p className="relative z-10 mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Flame className="h-3 w-3" />
            {t('home.hottestNow', { name: hottest.name, temp: Math.round(hottest.current_temp_c) })}
          </p>
        )}
      </div>

      {/* AI daily summary */}
      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <p className="text-sm font-semibold text-ink-900">{t('home.outlook')}</p>
          <span className="rounded-full bg-ink-900 px-2 py-0.5 text-[10px] font-medium text-white">
            {t('home.aiTag')}
          </span>
        </div>
        {dailySummary ? (
          <ul className="mt-2 space-y-1.5">
            {dailySummary.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-ink-700">
                <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2.5 space-y-1.5">
            <div className="h-3 w-full animate-pulse rounded bg-mist-100" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-mist-100" />
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="rounded-2xl border border-mist-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-ink-600">
          <Flame className="h-4 w-4" />
          <p className="text-xs font-medium">{t('home.riskIndex')}</p>
        </div>
        <p className={`mt-2 font-display text-2xl font-semibold ${meta.text}`}>{t(meta.labelKey)}</p>
        <div className="relative mt-3 h-1.5 w-full rounded-full bg-gradient-to-r from-risk-low via-risk-moderate to-risk-severe">
          <span
            className="absolute -top-0.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-white bg-ink-900 shadow"
            style={{ left: `${meta.pct}%` }}
          />
        </div>
      </div>

      {/* Zones strip */}
      <div className="rounded-2xl border border-mist-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-semibold">{t('home.zonesNearYou')}</p>
          <Link to="/app" className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
            {t('home.viewMap')} <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 w-16 flex-shrink-0 animate-pulse rounded-xl bg-mist-100" />
            ))}
          {!isLoading &&
            zones.slice(0, 8).map((zone) => {
              const zoneMeta = riskMeta[zone.risk_level]
              return (
                <div
                  key={zone.id}
                  className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5 rounded-xl bg-mist-50 py-3"
                >
                  <span className="w-full truncate px-1 text-center text-[11px] font-medium text-ink-600">
                    {zone.name}
                  </span>
                  <span className={`grid h-8 w-8 place-items-center rounded-full ${zoneMeta.soft}`}>
                    <Flame className={`h-4 w-4 ${zoneMeta.text}`} />
                  </span>
                  <span className="text-sm font-semibold text-ink-900">{Math.round(zone.current_temp_c)}°</span>
                </div>
              )
            })}
          {!isLoading && zones.length === 0 && (
            <p className="py-3 text-xs text-ink-600">{t('home.noZoneData')}</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-mist-200 bg-white/60 p-5 text-center text-sm text-ink-600">
        {t('home.comingSoon')}
      </div>
    </div>
  )
}
