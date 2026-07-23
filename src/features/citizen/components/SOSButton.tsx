import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api-client'
import { useLanguage } from '@/lib/i18n/language-context'

type Status = 'idle' | 'locating' | 'sending' | 'sent' | 'error'

export function SOSButton() {
  const { t } = useLanguage()
  const [status, setStatus] = useState<Status>('idle')
  const [open, setOpen] = useState(false)

  function handlePress() {
    setOpen(true)
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

  function close() {
    setOpen(false)
    setStatus('idle')
  }

  return (
    <>
      <button
        onClick={handlePress}
        aria-label={t('sos.aria')}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-risk-severe text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <span className="text-xs font-bold tracking-wide">{t('sos.label')}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5"
            onClick={close}
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
                onClick={close}
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
