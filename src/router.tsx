import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { RootLayout } from './components/layout/RootLayout'
import { LandingPage } from './features/landing/pages/LandingPage'
import { CitizenLayout } from './features/citizen/layout/CitizenLayout'
import { CitizenHomePage } from './features/citizen/pages/HomePage'
import { CitizenMapPage } from './features/citizen/pages/MapPage'
import { CoolingCentersPage } from './features/citizen/pages/CoolingCentersPage'
import { ReportGapPage } from './features/citizen/pages/ReportPage'
import { AIPage } from './features/citizen/pages/AIPage'
import { NotificationsPage } from './features/citizen/pages/NotificationsPage'
import { DashboardLayout } from './features/dashboard/layout/DashboardLayout'
import { RankingsPage } from './features/dashboard/pages/RankingsPage'
import { CoolingGapsPage } from './features/dashboard/pages/CoolingGapsPage'
import { ReportQueuePage } from './features/dashboard/pages/ReportQueuePage'
import { InterventionsPage } from './features/dashboard/pages/InterventionsPage'

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
  component: CitizenHomePage
})

const appMapRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/map',
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

const appAiRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/ai',
  component: AIPage
})

const appNotificationsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/notifications',
  component: NotificationsPage
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
  appRoute.addChildren([appIndexRoute, appMapRoute, appCoolingCentersRoute, appReportRoute, appAiRoute, appNotificationsRoute]),
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
