import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const REMINDER_INTERVAL_MS = 35 * 60 * 1000 // 35 minutes

export function HydrationReminder() {
  const [enabled, setEnabled] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (enabled) {
      timerRef.current = setInterval(() => setShowToast(true), REMINDER_INTERVAL_MS)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [enabled])

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 8000)
    return () => clearTimeout(t)
  }, [showToast])

  return (
    <>
      <button
        onClick={() => setEnabled((v) => !v)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          enabled
            ? 'bg-safe/15 text-safe-dark'
            : 'bg-white/90 text-ink-700 shadow-sm backdrop-blur hover:bg-white'
        }`}
      >
        {enabled ? '💧 Hydration reminders on' : 'Remind me to hydrate'}
      </button>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-mist-200 bg-white px-5 py-3 shadow-lg"
          >
            <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
              💧 Time to drink some water — stay ahead of the heat.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
