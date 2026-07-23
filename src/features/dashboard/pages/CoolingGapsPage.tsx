import { useCoolingGapPriorities } from '@/lib/queries'

const CATEGORY_LABEL: Record<string, string> = {
  no_cooling_center: 'No center',
  insufficient_capacity: 'Capacity',
  closed_or_inactive: 'Closed',
  too_far: 'Too far',
  other: 'Other'
}

export function CoolingGapsPage() {
  const { data: priorities = [], isLoading } = useCoolingGapPriorities()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
          Cooling gap priorities
        </h1>
        <p className="text-sm text-ink-600">
          Zones ranked by open citizen reports — where action is most needed.
        </p>
      </div>

      {isLoading && <p className="text-sm text-ink-600">Loading…</p>}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {priorities.map((zone, i) => (
          <div key={zone.zone_id} className="rounded-2xl border border-ink-800 bg-ink-900 p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-ink-600">#{i + 1}</span>
                <h3 className="font-display font-semibold text-mist-100">{zone.zone_name}</h3>
              </div>
              <span className="rounded-full bg-risk-severe/15 px-2.5 py-0.5 text-xs font-medium text-risk-severe">
                {zone.open_report_count} open
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {zone.categories.map((c) => (
                <span
                  key={c.category}
                  className="rounded-full bg-ink-800 px-2 py-0.5 text-[11px] text-ink-600"
                >
                  {CATEGORY_LABEL[c.category] ?? c.category} · {c.count}
                </span>
              ))}
            </div>

            <p className="mt-3 text-xs text-ink-600">
              Latest report {new Date(zone.latest_report_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
