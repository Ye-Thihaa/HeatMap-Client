import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { useHeatZone } from '@/lib/queries'
import type { RiskLevel } from '@/lib/types'

const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'Low risk',
  moderate: 'Moderate risk',
  high: 'High risk',
  severe: 'Severe risk'
}

const RISK_BADGE: Record<RiskLevel, string> = {
  low: 'bg-risk-low/15 text-risk-low',
  moderate: 'bg-risk-moderate/15 text-yellow-700',
  high: 'bg-risk-high/15 text-orange-700',
  severe: 'bg-risk-severe/15 text-red-700'
}

export function ZoneDetailPanel({
  zoneId,
  onClose
}: {
  zoneId: string | null
  onClose: () => void
}) {
  const { data: zone, isLoading } = useHeatZone(zoneId ?? undefined)

  return (
    <AnimatePresence>
      {zoneId && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="rounded-2xl border border-mist-200 bg-white p-5 shadow-sm"
        >
          {isLoading || !zone ? (
            <div className="animate-pulse text-sm text-ink-600">Loading zone details…</div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold">{zone.name}</h3>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_BADGE[zone.risk_level]}`}
                  >
                    {RISK_LABEL[zone.risk_level]}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-ink-600 hover:bg-mist-100"
                  aria-label="Close zone detail"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <Stat label="Current temp" value={`${zone.current_temp_c.toFixed(1)}°C`} />
                <Stat label="Green cover" value={`${zone.green_cover_pct.toFixed(0)}%`} />
                <Stat
                  label="Pop. density"
                  value={`${Math.round(zone.population_density).toLocaleString()}/km²`}
                />
              </div>

              <div className="mt-5 h-40">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-600">
                  Temperature trend
                </p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={zone.history}>
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit' })}
                      tick={{ fontSize: 11 }}
                      stroke="#9CA3AF"
                    />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" width={30} />
                    <Tooltip
                      labelFormatter={(v) => new Date(v as string).toLocaleString()}
                      formatter={(v: number) => [`${v.toFixed(1)}°C`, 'Temp']}
                    />
                    <Line
                      type="monotone"
                      dataKey="temp_c"
                      stroke="#FB7A34"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-mist-100 py-2">
      <p className="font-mono text-base font-semibold text-ink-900">{value}</p>
      <p className="text-[11px] text-ink-600">{label}</p>
    </div>
  )
}
