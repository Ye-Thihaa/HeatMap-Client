import { Bell } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-context'

export function NotificationsPage() {
  const { t } = useLanguage()

  return (
    <div className="mx-auto max-w-lg space-y-5 px-5 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t('notifications.title')}</h1>
        <p className="text-sm text-ink-600">{t('notifications.subtitle')}</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mist-200 bg-white/60 py-20 text-center">
        <Bell className="h-10 w-10 text-ink-300" />
        <p className="mt-4 text-sm text-ink-500">No notifications yet</p>
      </div>
    </div>
  )
}
