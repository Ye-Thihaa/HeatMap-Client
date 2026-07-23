import { useState } from 'react'
import { HeatMap } from '../components/HeatMap'
import { ZoneDetailPanel } from '../components/ZoneDetailPanel'
import { LiveRiskTicker } from '../components/LiveRiskTicker'
import { useHeatZones } from '@/lib/queries'

export function CitizenMapPage() {
  const { data: zones = [], isLoading, isError } = useHeatZones()
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)

  return (
    // relative wrapper lets the map be the base layer, with all page UI
    // (ticker, error banner, zone detail) absolutely positioned on top of
    // it instead of pushing it down the page in normal flow.
    <div className="relative">
      <HeatMap
        zones={zones}
        onSelectZone={setSelectedZoneId}
        selectedZoneId={selectedZoneId ?? undefined}
      />

      {/* Top overlay: live risk ticker, centered. pointer-events-none on the
          row so clicks pass through to the map except where the badge
          itself is (pointer-events-auto on the badge). */}
      {!isLoading && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-5">
          <div className="pointer-events-auto">
            <LiveRiskTicker zones={zones} />
          </div>
        </div>
      )}

      {isError && (
        <div className="pointer-events-none absolute inset-x-5 top-20 z-10">
          <div className="pointer-events-auto rounded-xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-700 shadow-sm backdrop-blur">
            Couldn't load heat zones. Check that the API is running and reachable.
          </div>
        </div>
      )}

      {/* Bottom overlay: zone detail panel, or a helper hint when nothing
          is selected. Centered with a max width so it doesn't stretch
          full-width on large screens. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-5">
        <div className="pointer-events-auto mx-auto max-w-xl">
          {selectedZoneId ? (
            <ZoneDetailPanel zoneId={selectedZoneId} onClose={() => setSelectedZoneId(null)} />
          ) : (
            <div className="rounded-2xl border border-dashed border-mist-200 bg-white/90 p-5 text-sm text-ink-600 shadow-sm backdrop-blur">
              Tap a zone marker on the map to see its temperature, risk level, and trend.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}