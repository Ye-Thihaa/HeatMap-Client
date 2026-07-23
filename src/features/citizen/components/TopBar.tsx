import { Link } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-context'

export function TopBar() {
  const { lang, setLang, t } = useLanguage()

  return (
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

        </div>
      </div>
    </header>
  )
}
