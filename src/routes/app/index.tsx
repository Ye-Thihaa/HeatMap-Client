import { useState } from 'react'
import { HeatMap } from '@/components/map/HeatMap'
import { ZoneDetailPanel } from '@/components/map/ZoneDetailPanel'
import { LiveRiskTicker } from '@/components/map/LiveRiskTicker'
import { useHeatZones } from '@/lib/queries'

export function CitizenMapPage() {
  const { data: zones = [], isLoading, isError } = useHeatZones()
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Live heat map</h1>
          <p className="text-sm text-ink-600">
            Zones update automatically as new sensor data comes in.
          </p>
        </div>
        {!isLoading && <LiveRiskTicker zones={zones} />}
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn't load heat zones. Check that the API is running and reachable.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <HeatMap
          zones={zones}
          onSelectZone={setSelectedZoneId}
          selectedZoneId={selectedZoneId ?? undefined}
        />
        <div className="space-y-4">
          {selectedZoneId ? (
            <ZoneDetailPanel zoneId={selectedZoneId} onClose={() => setSelectedZoneId(null)} />
          ) : (
            <div className="rounded-2xl border border-dashed border-mist-200 p-5 text-sm text-ink-600">
              Tap a zone marker on the map to see its temperature, risk level, and trend.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
