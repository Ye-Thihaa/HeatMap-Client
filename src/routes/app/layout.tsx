import { Link, Outlet } from '@tanstack/react-router'

const tabs = [
  { to: '/app', label: 'Live map' },
  { to: '/app/cooling-centers', label: 'Cooling centers' },
  { to: '/app/report', label: 'Report a gap' }
]

export function CitizenLayout() {
  return (
    <div className="min-h-screen bg-mist-50">
      <header className="sticky top-0 z-30 border-b border-mist-200 bg-mist-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight">
            Urban Heat<span className="text-risk-high">.</span>
          </Link>
          <nav className="flex items-center gap-1 rounded-full bg-mist-100 p-1">
            {tabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                activeOptions={{ exact: tab.to === '/app' }}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors"
                activeProps={{ className: 'bg-white text-ink-900 shadow-sm' }}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-6">
        <Outlet />
      </main>
    </div>
  )
}
