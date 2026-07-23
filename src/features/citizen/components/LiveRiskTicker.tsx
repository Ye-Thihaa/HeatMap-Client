import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { HeatZoneSummary } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/language-context'

export function LiveRiskTicker({ zones }: { zones: HeatZoneSummary[] }) {
  const { lang, t } = useLanguage()
  const count = zones.filter((z) => z.risk_level === 'high' || z.risk_level === 'severe').length
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 90, damping: 20 })
  const rounded = useTransform(spring, (v) => Math.round(v))
  const prevCount = useRef(count)

  useEffect(() => {
    motionValue.set(count)
    prevCount.current = count
  }, [count, motionValue])

  // Burmese puts the count last with a classifier ("... ခု"), English puts
  // it first ("N zone(s) at high risk right now") — so the phrase order
  // flips around the same animated number instead of being one template.
  return (
    <div className="flex items-center gap-2 rounded-full bg-risk-severe/10 px-4 py-2 text-sm font-medium text-red-700">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-risk-severe" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-risk-severe" />
      </span>
      {lang === 'mm' && <span>ယခုအချိန် အန္တရာယ်ရှိနေသောနေရာ</span>}
      <motion.span className="font-mono tabular-nums">{rounded}</motion.span>
      <span>{count === 1 ? t('ticker.suffixOne') : t('ticker.suffixMany')}</span>
    </div>
  )
}
