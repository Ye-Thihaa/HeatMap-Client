import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { AlertTriangle, Building2, Brain, X } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useLanguage } from '@/lib/i18n/language-context'

type Status = 'idle' | 'locating' | 'sending' | 'sent' | 'error'

export function SOSButton() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

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

  function closeStatus() {
    setStatus('idle')
  }

  const menuItems = [
    { label: 'Send Heat Emergency Alert', icon: AlertTriangle, action: handleHeatAlert, color: 'text-risk-severe' },
    { label: 'Find Nearby Cooling Center', icon: Building2, action: handleCoolingCenter, color: 'text-safe-dark' },
    { label: 'Ask AI about current condition', icon: Brain, action: handleAskAI, color: 'text-emerald-500' }
  ]

  return (
    <>
      <button
        onClick={() => setMenuOpen(true)}
        aria-label="Quick actions"
        className="fixed bottom-24 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-risk-severe text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <span className="text-xs font-bold tracking-wide">SOS</span>
      </button>

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
              className="fixed bottom-40 right-5 flex w-64 flex-col gap-2 rounded-2xl bg-white p-3 shadow-xl"
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="ml-auto grid h-6 w-6 place-items-center rounded-full text-ink-500 hover:bg-mist-100"
              >
                <X className="h-4 w-4" />
              </button>
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-mist-50"
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  {item.label}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(status === 'locating' || status === 'sending' || status === 'sent' || status === 'error') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-5"
            onClick={closeStatus}
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
                onClick={closeStatus}
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
