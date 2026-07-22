import { motion } from 'framer-motion'

export function ConfidenceGauge({ confidence }: { confidence: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(1, confidence))

  const color = pct > 0.7 ? '#34D399' : pct > 0.4 ? '#FBBF24' : '#EF4444'

  return (
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
        <span className="font-mono text-xl font-semibold text-white">
          {Math.round(pct * 100)}%
        </span>
        <span className="text-[10px] uppercase tracking-wide text-ink-600">confidence</span>
      </div>
    </div>
  )
}
