import { motion } from 'framer-motion'

export function ConfidenceGauge({ confidence }: { confidence: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(1, confidence))

  const color = pct > 0.7 ? '#34D399' : pct > 0.4 ? '#FBBF24' : '#EF4444'
  const label = pct > 0.7 ? 'High confidence' : pct > 0.4 ? 'Moderate confidence' : 'Low confidence'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
          <circle cx="56" cy="56" r={radius} stroke="#1C2A40" strokeWidth="10" fill="none" />
          <motion.circle
            cx="56"
            cy="56"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct) }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <motion.span
            className="font-mono text-xl font-semibold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {Math.round(pct * 100)}%
          </motion.span>
          <span className="text-[10px] uppercase tracking-wide text-ink-600">confidence</span>
        </div>
      </div>
      {/* The number alone doesn't say whether 63% is good or bad here — this
          reads the gauge's own color+fill as a plain-language verdict so the
          confidence score is legible at a glance, not just a raw figure. */}
      <span
        className="risk-color-transition rounded-full px-2.5 py-0.5 text-xs font-medium"
        style={{ background: `${color}26`, color }}
      >
        {label}
      </span>
    </div>
  )
}
