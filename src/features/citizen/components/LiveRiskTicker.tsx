import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { HeatZoneSummary } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/language-context'

interface LiveRiskTickerProps {
  zones: HeatZoneSummary[]
  // FIX: new optional handler — when provided, the whole pill becomes a
  // real <button> that calls this with the id of the first at-risk zone,
  // so the parent can select/fly-to/highlight it. Optional so this
  // component still works fine anywhere it's used without that behavior.
  onSelectFirstAtRisk?: (zoneId: string) => void
}

export function LiveRiskTicker({ zones, onSelectFirstAtRisk }: LiveRiskTickerProps) {
  const { lang, t } = useLanguage()
  const atRiskZones = zones.filter((z) => z.risk_level === 'high' || z.risk_level === 'severe')
  const count = atRiskZones.length
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 90, damping: 20 })
  const rounded = useTransform(spring, (v) => Math.round(v))
  const prevCount = useRef(count)

  useEffect(() => {
    motionValue.set(count)
    prevCount.current = count
  }, [count, motionValue])

  // FIX: "first" here means first in the at-risk-filtered list as it comes
  // back from the backend (which orders by current_temp desc — see
  // /dashboard/rankings and get_heat_zones_with_coords) — so in practice
  // this points out the single hottest currently at-risk zone, not an
  // arbitrary one.
  const firstAtRiskZone = atRiskZones[0] ?? null
  const isClickable = Boolean(onSelectFirstAtRisk && firstAtRiskZone)

  function handleClick() {
    if (firstAtRiskZone && onSelectFirstAtRisk) {
      onSelectFirstAtRisk(firstAtRiskZone.id)
    }
  }

  // Burmese puts the count last with a classifier ("... ခု"), English puts
  // it first ("N zone(s) at high risk right now") — so the phrase order
  // flips around the same animated number instead of being one template.
  const content = (
    <>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-risk-severe" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-risk-severe" />
      </span>
      {lang === 'mm' && <span>ယခုအချိန် အန္တရာယ်ရှိနေသောနေရာ</span>}
      <motion.span className="font-mono tabular-nums">{rounded}</motion.span>
      <span>{count === 1 ? t('ticker.suffixOne') : t('ticker.suffixMany')}</span>
    </>
  )

  const baseClasses =
    'flex items-center gap-2 rounded-full bg-risk-severe/10 px-4 py-2 text-sm font-medium text-red-700'

  // FIX: render as a real <button> (not a clickable div) only when there's
  // actually something to click into — count === 0 or no handler passed
  // falls back to the old plain, non-interactive pill so there's no
  // confusing "clickable-looking but does nothing" state.
  if (!isClickable) {
    return <div className={baseClasses}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        firstAtRiskZone
          ? `${count} ${count === 1 ? t('ticker.suffixOne') : t('ticker.suffixMany')} — ${t(
              'ticker.jumpToZoneAria',
              { name: firstAtRiskZone.name }
            )}`
          : undefined
      }
      className={`${baseClasses} transition-transform hover:scale-[1.03] active:scale-95 cursor-pointer`}
    >
      {content}
    </button>
  )
}