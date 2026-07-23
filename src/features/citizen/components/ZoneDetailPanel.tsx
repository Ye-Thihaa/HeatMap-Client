import { useMemo } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
// import { useHeatZone } from '@/lib/queries'
import type { RiskLevel, HeatZoneDetail } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/language-context'

const RISK_ACCENT: Record<RiskLevel, string> = {
  low: '#34D399',
  moderate: '#FBBF24',
  high: '#FB7A34',
  severe: '#EF4444'
}

// --- MOCK DATA (backend hook disabled below, remove when API is ready) ---
// Keyed by the same zone-N ids used in CitizenMapPage's MOCK_ZONES, so
// clicking any of the 15 mock markers resolves to matching detail data.
type MockZoneBase = {
  name: string
  risk_level: RiskLevel
  current_temp_c: number
  green_cover_pct: number
  population_density: number
}

const MOCK_ZONE_BASE: Record<string, MockZoneBase> = {
  'zone-1': { name: 'Downtown Core', risk_level: 'severe', current_temp_c: 41, green_cover_pct: 8, population_density: 18400 },
  'zone-2': { name: 'Riverside District', risk_level: 'high', current_temp_c: 37, green_cover_pct: 14, population_density: 12100 },
  'zone-3': { name: 'Old Market Quarter', risk_level: 'moderate', current_temp_c: 33, green_cover_pct: 21, population_density: 9800 },
  'zone-4': { name: 'Green Park Belt', risk_level: 'low', current_temp_c: 27, green_cover_pct: 46, population_density: 4200 },
  'zone-5': { name: 'Industrial East', risk_level: 'severe', current_temp_c: 43, green_cover_pct: 4, population_density: 6100 },
  'zone-6': { name: 'Hlaing Market', risk_level: 'high', current_temp_c: 38, green_cover_pct: 12, population_density: 15300 },
  'zone-7': { name: 'Kandawgyi Lakeside', risk_level: 'low', current_temp_c: 28, green_cover_pct: 52, population_density: 3100 },
  'zone-8': { name: 'Thingangyun Residential', risk_level: 'moderate', current_temp_c: 34, green_cover_pct: 19, population_density: 11200 },
  'zone-9': { name: 'Insein Industrial Zone', risk_level: 'severe', current_temp_c: 42, green_cover_pct: 5, population_density: 5400 },
  'zone-10': { name: 'Botataung Waterfront', risk_level: 'moderate', current_temp_c: 32, green_cover_pct: 24, population_density: 10600 },
  'zone-11': { name: 'Mingalar Market Belt', risk_level: 'high', current_temp_c: 39, green_cover_pct: 10, population_density: 16700 },
  'zone-12': { name: 'Shwedagon Green Ring', risk_level: 'low', current_temp_c: 26, green_cover_pct: 58, population_density: 2800 },
  'zone-13': { name: 'North Okkalapa Blocks', risk_level: 'high', current_temp_c: 38, green_cover_pct: 13, population_density: 14100 },
  'zone-14': { name: 'Dala Crossing', risk_level: 'moderate', current_temp_c: 33, green_cover_pct: 22, population_density: 8300 },
  'zone-15': { name: 'Hlaing Riverside Park', risk_level: 'low', current_temp_c: 27, green_cover_pct: 49, population_density: 3600 },
}

// Deterministic-ish 24h history generator (seeded by zone id) so each zone's
// chart looks a little different but stays stable across re-renders.
function buildMockHistory(zoneId: string, currentTemp: number) {
  let seed = 0
  for (let i = 0; i < zoneId.length; i++) seed = (seed * 31 + zoneId.charCodeAt(i)) % 997
  const points: { timestamp: string; temp_c: number }[] = []
  const now = Date.now()
  for (let i = 23; i >= 0; i--) {
    const hourOffset = i
    const wobble = Math.sin((seed + i) * 0.6) * 2.5
    const diurnal = Math.sin(((23 - i) / 24) * Math.PI * 2 - Math.PI / 2) * 3
    const temp = currentTemp - 3 + diurnal + wobble
    points.push({
      timestamp: new Date(now - hourOffset * 60 * 60 * 1000).toISOString(),
      temp_c: Math.round(temp * 10) / 10,
    })
  }
  // force the last point to exactly match current_temp_c so the chart ends
  // where the hero number says it should
  points[points.length - 1] = { timestamp: points[points.length - 1].timestamp, temp_c: currentTemp }
  return points
}

function getMockZoneDetail(zoneId: string): HeatZoneDetail | null {
  const base = MOCK_ZONE_BASE[zoneId]
  if (!base) return null
  return {
    id: zoneId,
    name: base.name,
    risk_level: base.risk_level,
    current_temp_c: base.current_temp_c,
    green_cover_pct: base.green_cover_pct,
    population_density: base.population_density,
    history: buildMockHistory(zoneId, base.current_temp_c),
  } as HeatZoneDetail
}
// --- END MOCK DATA ---

export function ZoneDetailPanel({
  zoneId,
  onClose
}: {
  zoneId: string | null
  onClose: () => void
}) {
  // const { data: zone, isLoading } = useHeatZone(zoneId ?? undefined)
  const zone = useMemo(() => (zoneId ? getMockZoneDetail(zoneId) : null), [zoneId])
  const isLoading = false

  const { t } = useLanguage()

  return (
    <AnimatePresence>
      {zoneId && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-sm"
        >
          {isLoading || !zone ? (
            <div className="animate-pulse p-5 text-sm text-ink-600">{t('zone.loading')}</div>
          ) : (
            <>
              {/* Accent bar reads the zone's risk color at a glance, and
                  transitions (not snaps) if risk_level changes on refetch. */}
              <div
                className="risk-color-transition h-1 w-full"
                style={{ background: RISK_ACCENT[zone.risk_level] }}
              />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{zone.name}</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1.5 text-ink-600 hover:bg-mist-100"
                    aria-label={t('zone.closeAria')}
                  >
                    ✕
                  </button>
                </div>

                {/* Current temp is promoted to a hero number that sits INSIDE
                    the same card as the trend chart it's the latest point
                    of, with the other two stats as a compact side column —
                    one integrated reading instead of a 3-up stat grid
                    stacked generically above an unrelated chart. */}
                <div className="mt-5 flex gap-4">
                  <div className="shrink-0">
                    <p
                      className="risk-color-transition font-mono text-4xl font-semibold leading-none"
                      style={{ color: RISK_ACCENT[zone.risk_level] }}
                    >
                      {zone.current_temp_c.toFixed(1)}°
                    </p>
                    <p className="mt-1.5 text-xs uppercase tracking-wide text-ink-600">
                      {t('zone.currentTemp')}
                    </p>
                    <div className="mt-3 space-y-2 border-t border-mist-200 pt-3">
                      <MiniStat label={t('zone.greenCover')} value={`${zone.green_cover_pct.toFixed(0)}%`} />
                      <MiniStat
                        label={t('zone.popDensity')}
                        value={`${Math.round(zone.population_density).toLocaleString()}/km²`}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-600">
                      {t('zone.trend24h')}
                    </p>
                    <div className="h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={zone.history} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit' })}
                            tick={{ fontSize: 10 }}
                            stroke="#9CA3AF"
                          />
                          <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" width={30} />
                          <Tooltip
                            labelFormatter={(v) => new Date(v as string).toLocaleString()}
                            formatter={(v: number) => [`${v.toFixed(1)}°C`, 'Temp']}
                          />
                          <Line
                            type="monotone"
                            dataKey="temp_c"
                            stroke={RISK_ACCENT[zone.risk_level]}
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <p className="text-[11px] text-ink-600">{label}</p>
      <p className="font-mono text-sm font-semibold text-ink-900">{value}</p>
    </div>
  )
}