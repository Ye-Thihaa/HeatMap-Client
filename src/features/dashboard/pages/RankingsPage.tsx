import { motion } from 'framer-motion'
import { useDashboardRankings } from '@/lib/queries'
import type { RiskLevel } from '@/lib/types'

const RISK_DOT: Record<RiskLevel, string> = {
  low: 'bg-risk-low',
  moderate: 'bg-risk-moderate',
  high: 'bg-risk-high',
  severe: 'bg-risk-severe'
}

export function RankingsPage() {
  const { data: rankings = [], isLoading, isError } = useDashboardRankings()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
          Zone rankings
        </h1>
        <p className="text-sm text-ink-600">Hottest zones first, refreshed every minute.</p>
      </div>

      {isLoading && <p className="text-sm text-ink-600">Loading rankings…</p>}
      {isError && <p className="text-sm text-red-400">Couldn't load rankings from the API.</p>}

      <ul className="divide-y divide-ink-800 overflow-hidden rounded-2xl border border-ink-800">
        {rankings.map((entry) => (
          <motion.li
            key={entry.zone_id}
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex items-center justify-between gap-4 bg-ink-900 px-5 py-3.5"
          >
            <div className="flex items-center gap-4">
              <span className="w-8 font-mono text-sm text-ink-600">
                {String(entry.rank).padStart(2, '0')}
              </span>
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${RISK_DOT[entry.risk_level]}`} />
              <span className="font-medium text-mist-100">{entry.zone_name}</span>
            </div>
            <span className="font-mono text-sm text-ink-600">
              {entry.current_temp_c.toFixed(1)}°C
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
