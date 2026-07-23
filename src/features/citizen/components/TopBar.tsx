import { Link } from '@tanstack/react-router'
import { Bell, MapPin } from 'lucide-react'

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-mist-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight">
          Urban Heat<span className="text-risk-high">.</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full p-2 text-ink-600 transition-colors hover:bg-mist-100 hover:text-ink-900"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 text-ink-600 transition-colors hover:bg-mist-100 hover:text-ink-900"
            aria-label="Current location"
          >
            <MapPin className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
