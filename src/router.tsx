import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { RootLayout } from './components/layout/RootLayout'
import { LandingPage } from './routes/index'
import { CitizenLayout } from './routes/app/layout'
import { CitizenMapPage } from './routes/app/index'
import { CoolingCentersPage } from './routes/app/cooling-centers'
import { ReportGapPage } from './routes/app/report'
import { DashboardLayout } from './routes/dashboard/layout'
import { RankingsPage } from './routes/dashboard/index'
import { CoolingGapsPage } from './routes/dashboard/cooling-gaps'
import { ReportQueuePage } from './routes/dashboard/queue'
import { InterventionsPage } from './routes/dashboard/interventions'

const rootRoute = createRootRoute({
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  )
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage
})

// --- Citizen app ---
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: CitizenLayout
})

const appIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  component: CitizenMapPage
})

const appCoolingCentersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/cooling-centers',
  component: CoolingCentersPage
})

const appReportRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/report',
  component: ReportGapPage
})

// --- Gov dashboard ---
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardLayout
})

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: RankingsPage
})

const dashboardCoolingGapsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/cooling-gaps',
  component: CoolingGapsPage
})

const dashboardQueueRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/queue',
  component: ReportQueuePage
})

const dashboardInterventionsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/interventions',
  component: InterventionsPage
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  appRoute.addChildren([appIndexRoute, appCoolingCentersRoute, appReportRoute]),
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    dashboardCoolingGapsRoute,
    dashboardQueueRoute,
    dashboardInterventionsRoute
  ])
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
