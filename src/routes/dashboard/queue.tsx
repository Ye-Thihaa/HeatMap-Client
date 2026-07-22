import { useState } from 'react'
import { useCoolingGapReports, useUpdateCoolingGapReport } from '@/lib/queries'
import type { CoolingGapStatus } from '@/lib/types'

const STATUSES: CoolingGapStatus[] = [
  'submitted',
  'under_review',
  'action_planned',
  'resolved',
  'dismissed'
]

const STATUS_LABEL: Record<CoolingGapStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under review',
  action_planned: 'Action planned',
  resolved: 'Resolved',
  dismissed: 'Dismissed'
}

export function ReportQueuePage() {
  const [filter, setFilter] = useState<CoolingGapStatus | undefined>(undefined)
  const { data: reports = [], isLoading } = useCoolingGapReports(filter)
  const updateStatus = useUpdateCoolingGapReport()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
            Report queue
          </h1>
          <p className="text-sm text-ink-600">Every cooling gap report submitted by citizens.</p>
        </div>
        <select
          value={filter ?? ''}
          onChange={(e) => setFilter((e.target.value || undefined) as CoolingGapStatus | undefined)}
          className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm text-mist-100"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-sm text-ink-600">Loading…</p>}

      <div className="overflow-hidden rounded-2xl border border-ink-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-900 text-ink-600">
            <tr>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Description</th>
              <th className="px-4 py-2.5 font-medium">Submitted</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800 bg-ink-950">
            {reports.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-mist-100">{String(r.category).replaceAll('_', ' ')}</td>
                <td className="max-w-xs truncate px-4 py-3 text-ink-600">
                  {r.description ?? '—'}
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) =>
                      updateStatus.mutate({ id: r.id, status: e.target.value as CoolingGapStatus })
                    }
                    className="rounded-md border border-ink-700 bg-ink-900 px-2 py-1 text-xs text-mist-100"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
