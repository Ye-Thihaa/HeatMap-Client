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
      {/*
       * No max-width/padding here anymore — that constraint used to apply to
       * EVERY page (including the map), which is why the live map couldn't
       * render edge-to-edge no matter what height/width classes HeatMap.tsx
       * itself had. Pages that want the old centered/padded look (e.g.
       * CoolingCentersPage, the report form) now apply `mx-auto max-w-5xl
       * px-5 py-6` themselves. Pages that want full-bleed (CitizenMapPage)
       * simply don't, and render right up to the viewport edges.
       */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}