import { Link, useLocation } from '@tanstack/react-router'
import { Home, MapPin, Sparkles, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/language-context'

const items = [
  { to: '/app', labelKey: 'nav.home', icon: Home },
  { to: '/app/map', labelKey: 'nav.map', icon: MapPin },
  { to: '/app/ai', labelKey: 'nav.ai', icon: Sparkles },
  { to: '/app/report', labelKey: 'nav.report', icon: FileText }
]

export function BottomNav() {
  const { pathname } = useLocation()
  const { t } = useLanguage()

  function isActive(to: string) {
    if (to === '/app') return pathname === '/app'
    return pathname === to || pathname.startsWith(`${to}/`)
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-sm items-center justify-between gap-1 rounded-full border border-mist-200 bg-white/80 p-1.5 shadow-lg shadow-ink-900/10 backdrop-blur-xl">
        {items.map(({ to, labelKey, icon: Icon }) => {
          const active = isActive(to)
          const label = t(labelKey)
          return (
            <Link key={to} to={to} aria-current={active ? 'page' : undefined} className="focus:outline-none">
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-sm font-medium ${
                  active
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/40'
                    : 'text-ink-600 hover:bg-mist-100 hover:text-ink-900'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={active ? 2.25 : 2} />
                {active && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </motion.span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}