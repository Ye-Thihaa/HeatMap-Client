import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function isPeakHeatHour(): boolean {
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  const start = 12 * 60 + 30 // 12:30pm
  const end = 15 * 60 + 30 // 3:30pm
  return minutes >= start && minutes <= end
}

export function PeakHoursBanner() {
  const [active, setActive] = useState(isPeakHeatHour)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setActive(isPeakHeatHour()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const show = active && !dismissed

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-risk-high/30 bg-risk-high/10 px-4 py-2.5 text-sm shadow-sm backdrop-blur"
        >
          <span className="text-lg leading-none">☀️</span>
          <p className="text-ink-800">
            <span className="font-semibold">Peak heat hours</span> — avoid going outside
            if possible (12:30–3:30 PM).
          </p>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="ml-1 rounded-full p-1 text-ink-600 hover:bg-black/5"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
