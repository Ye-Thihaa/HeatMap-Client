import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { useHeatZone } from '@/lib/queries'
import type { RiskLevel } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/language-context'

const RISK_LABEL_KEY: Record<RiskLevel, string> = {
  low: 'zone.risk.low',
  moderate: 'zone.risk.moderate',
  high: 'zone.risk.high',
  severe: 'zone.risk.severe'
}

const RISK_BADGE: Record<RiskLevel, string> = {
  low: 'bg-risk-low/15 text-risk-low',
  moderate: 'bg-risk-moderate/15 text-yellow-700',
  high: 'bg-risk-high/15 text-orange-700',
  severe: 'bg-risk-severe/15 text-red-700'
}

// Same source of truth as HeatMap.tsx's RISK_COLOR — kept local since this
// component only needs it for the accent bar / chart line, not the marker DOM.
const RISK_ACCENT: Record<RiskLevel, string> = {
  low: '#34D399',
  moderate: '#FBBF24',
  high: '#FB7A34',
  severe: '#EF4444'
}

export function ZoneDetailPanel({
  zoneId,
  onClose
}: {
  zoneId: string | null
  onClose: () => void
}) {
  const { data: zone, isLoading } = useHeatZone(zoneId ?? undefined)
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
                    <span
                      className={`risk-color-transition mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_BADGE[zone.risk_level]}`}
                    >
                      {t(RISK_LABEL_KEY[zone.risk_level])}
                    </span>
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
