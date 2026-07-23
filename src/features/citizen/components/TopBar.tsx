import { Link, useNavigate } from '@tanstack/react-router'
import { Bell, Siren, MapPin, Sparkles, AlertTriangle, Leaf, Thermometer } from 'lucide-react'
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
      <header className="sticky top-0 z-30 border-b border-emerald-900/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5">
          {/* Logomark: same leaf + thermometer mark as the landing page nav */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[#14432C]">
              <Leaf className="h-4 w-4 text-emerald-300" strokeWidth={2.4} />
              <Thermometer
                className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-white p-0.5 text-emerald-700"
                strokeWidth={2.8}
              />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-slate-900">
              A Yate Sitt
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div
              role="group"
              aria-label={t('lang.toggleAria')}
              className="flex items-center gap-0.5 rounded-full border border-emerald-100 bg-emerald-50 p-0.5"
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                  lang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-emerald-700/70 hover:text-emerald-700'
                }`}
              >
                ENG
              </button>
              <button
                type="button"
                onClick={() => setLang('mm')}
                aria-pressed={lang === 'mm'}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                  lang === 'mm' ? 'bg-white text-slate-900 shadow-sm' : 'text-emerald-700/70 hover:text-emerald-700'
                }`}
              >
                MYAN
              </button>
            </div>

            <Link
              to="/app/notifications"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
              aria-label={t('topbar.notifications')}
            >
              <Bell className="h-5 w-5" />
            </Link>

            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
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
              className="fixed right-5 top-24 w-72 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl"
            >
              <button
                onClick={handleHeatAlert}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-emerald-50/60"
              >
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Send Heat Emergency Alert
              </button>
              <button
                onClick={handleCoolingCenter}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-emerald-50/60"
              >
                <MapPin className="h-5 w-5 text-emerald-600" />
                Find Nearby Cooling Center
              </button>
              <button
                onClick={handleAskAI}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-emerald-50/60"
              >
                <Sparkles className="h-5 w-5 text-emerald-600" />
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
                <p className="text-center text-sm text-slate-600">{t('sos.locating')}</p>
              )}
              {status === 'sending' && (
                <p className="text-center text-sm text-slate-600">{t('sos.sending')}</p>
              )}
              {status === 'sent' && (
                <div className="text-center">
                  <p className="text-2xl">✅</p>
                  <p className="mt-2 font-display text-lg font-semibold text-slate-900">
                    {t('sos.sentTitle')}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{t('sos.sentBody')}</p>
                </div>
              )}
              {status === 'error' && (
                <div className="text-center">
                  <p className="font-display text-lg font-semibold text-slate-900">
                    {t('sos.errorTitle')}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{t('sos.errorBody')}</p>
                </div>
              )}
              <button
                onClick={() => setStatus('idle')}
                className="mt-4 w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
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