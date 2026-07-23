import { Outlet } from '@tanstack/react-router'
import { BottomNav } from '@/components/layout/BottomNav'
import { TopBar } from '../components/TopBar'

export function CitizenLayout() {
  return (
    <div className="min-h-screen bg-mist-50 pb-24">
      <TopBar />
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
      <BottomNav />
    </div>
  )
}