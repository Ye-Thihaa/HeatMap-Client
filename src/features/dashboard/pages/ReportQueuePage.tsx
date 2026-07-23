import { useState } from 'react'
import { useCoolingGapReports, useUpdateCoolingGapReport } from '@/lib/queries'
import type { CoolingGapStatus } from '@/lib/types'
import { StatusBadge } from '../components/StatusBadge'

const STATUSES: CoolingGapStatus[] = [
  'pending',
  'in_progress',
  'submitted',
  'in_review',
  'success',
  'failed',
  'expired'
]

const STATUS_LABEL: Record<CoolingGapStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  submitted: 'Submitted',
  in_review: 'In review',
  success: 'Success',
  failed: 'Failed',
  expired: 'Expired'
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
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    <select
                      value={r.status}
                      onChange={(e) =>
                        updateStatus.mutate({ id: r.id, status: e.target.value as CoolingGapStatus })
                      }
                      className="rounded-md border border-ink-700 bg-ink-900 px-2 py-1 text-[11px] text-mist-100 opacity-60 hover:opacity-100"
                      title="Change status"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
