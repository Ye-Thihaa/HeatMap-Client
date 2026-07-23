import { Link, Outlet } from '@tanstack/react-router'
import { BottomNav } from '@/components/layout/BottomNav'

const navItems = [
  { to: '/dashboard', label: 'Rankings' },
  { to: '/dashboard/cooling-gaps', label: 'Cooling gap priorities' },
  { to: '/dashboard/queue', label: 'Report queue' },
  { to: '/dashboard/interventions', label: 'AI estimator' }
]

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-ink-950 text-mist-100 pb-16">
      <div className="flex">
        <aside className="hidden w-60 shrink-0 border-r border-ink-700/60 px-4 py-6 lg:block">
          <Link to="/" className="font-display text-base font-semibold tracking-tight text-white">
            Urban Heat<span className="text-risk-high">.</span>
            <span className="ml-1 text-xs font-normal text-ink-600">gov</span>
          </Link>
          <nav className="mt-8 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === '/dashboard' }}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-800 hover:text-mist-100"
                activeProps={{ className: 'bg-ink-800 text-white' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-6 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
