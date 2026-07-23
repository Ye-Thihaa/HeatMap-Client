import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/language-context'

export function ReportConfirmation({ reportId, onReset }: { reportId: string; onReset: () => void }) {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-mist-200 bg-white p-8 text-center shadow-sm"
    >
      <motion.svg width="56" height="56" viewBox="0 0 56 56" fill="none" initial="hidden" animate="visible">
        <motion.circle
          cx="28"
          cy="28"
          r="26"
          stroke="#2DD4BF"
          strokeWidth="3"
          variants={{
            hidden: { pathLength: 0 },
            visible: { pathLength: 1, transition: { duration: 0.5 } }
          }}
        />
        <motion.path
          d="M17 29L24 36L39 20"
          stroke="#2DD4BF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{
            hidden: { pathLength: 0 },
            visible: { pathLength: 1, transition: { duration: 0.4, delay: 0.4 } }
          }}
        />
      </motion.svg>
      <div>
        <p className="font-display font-semibold">{t('report.thanks')}</p>
        <p className="text-sm text-ink-600">{t('report.plannersNote')}</p>
        <p className="mt-3 inline-block rounded-full bg-mist-100 px-3 py-1 font-mono text-xs font-medium text-ink-800">
          {reportId}
        </p>
      </div>
      <button onClick={onReset} className="text-sm font-medium text-ink-700 underline">
        {t('report.submitAnother')}
      </button>
    </motion.div>
  )
}
