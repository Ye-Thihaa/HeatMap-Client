import { Brain } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-context'

export function AIPage() {
  const { t } = useLanguage()

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t('ai.title')}</h1>
        <p className="text-sm text-ink-600">{t('ai.subtitle')}</p>
      </div>

      <div className="rounded-2xl border border-mist-200 bg-white p-8 text-center shadow-sm">
        <Brain className="mx-auto h-12 w-12 text-emerald-500" />
        <p className="mt-4 text-sm text-ink-600">{t('ai.comingSoon')}</p>
      </div>
    </div>
  )
}
