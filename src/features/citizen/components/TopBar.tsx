import { Link, useNavigate } from '@tanstack/react-router'
import { Bell, Siren, MapPin, Sparkles, AlertTriangle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/language-context'
import { api } from '@/lib/api-client'

type SosStatus = 'idle' | 'locating' | 'sending' | 'sent' | 'error'

export function TopBar() {
  const { lang, setLang, t } = useLanguage()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [status, setStatus] = useState<SosStatus>('idle')

  function handleHeatAlert() {
    setMenuOpen(false)
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus('sending')
        try {
          await api.submitHeatReport({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            estimated_temp_c: 0,
            description: 'SOS — possible heat emergency, requesting help'
          })
          setStatus('sent')
        } catch {
          setStatus('error')
        }
      },
      () => setStatus('error')
    )
  }

  function handleCoolingCenter() {
    setMenuOpen(false)
    navigate({ to: '/app/cooling-centers' })
  }

  function handleAskAI() {
    setMenuOpen(false)
    navigate({ to: '/app/ai' })
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-mist-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight text-emerald-500">
            A Yate Sitt
          </Link>
          <div className="flex items-center gap-3">
            <div
              role="group"
              aria-label={t('lang.toggleAria')}
              className="flex items-center gap-0.5 rounded-full bg-mist-100 p-0.5"
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                  lang === 'en' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                ENG
              </button>
              <button
                type="button"
                onClick={() => setLang('mm')}
                aria-pressed={lang === 'mm'}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                  lang === 'mm' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                MYAN
              </button>
            </div>
            <Link
              to="/app/notifications"
              className="rounded-full p-2 text-ink-600 transition-colors hover:bg-mist-100 hover:text-ink-900"
              aria-label={t('topbar.notifications')}
            >
              <Bell className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-full p-2 text-risk-severe transition-colors hover:bg-red-50"
              aria-label="Emergency"
            >
              <Siren className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* SOS popup menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed right-5 top-20 w-72 rounded-2xl bg-white p-3 shadow-xl"
            >
              <button
                onClick={handleHeatAlert}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-mist-50"
              >
                <AlertTriangle className="h-5 w-5 text-risk-severe" />
                Send Heat Emergency Alert
              </button>
              <button
                onClick={handleCoolingCenter}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-mist-50"
              >
                <MapPin className="h-5 w-5 text-safe-dark" />
                Find Nearby Cooling Center
              </button>
              <button
                onClick={handleAskAI}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-mist-50"
              >
                <Sparkles className="h-5 w-5 text-emerald-500" />
                Ask AI about current condition
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS status modal */}
      <AnimatePresence>
        {(status === 'locating' || status === 'sending' || status === 'sent' || status === 'error') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-5"
            onClick={() => setStatus('idle')}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            >
              {status === 'locating' && (
                <p className="text-center text-sm text-ink-700">{t('sos.locating')}</p>
              )}
              {status === 'sending' && (
                <p className="text-center text-sm text-ink-700">{t('sos.sending')}</p>
              )}
              {status === 'sent' && (
                <div className="text-center">
                  <p className="text-2xl">✅</p>
                  <p className="mt-2 font-display text-lg font-semibold text-ink-900">
                    {t('sos.sentTitle')}
                  </p>
                  <p className="mt-1 text-sm text-ink-600">{t('sos.sentBody')}</p>
                </div>
              )}
              {status === 'error' && (
                <div className="text-center">
                  <p className="font-display text-lg font-semibold text-ink-900">
                    {t('sos.errorTitle')}
                  </p>
                  <p className="mt-1 text-sm text-ink-600">{t('sos.errorBody')}</p>
                </div>
              )}
              <button
                onClick={() => setStatus('idle')}
                className="mt-4 w-full rounded-lg bg-ink-900 py-2 text-sm font-medium text-white"
              >
                {t('common.close')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
