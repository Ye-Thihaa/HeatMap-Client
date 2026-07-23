import { ISSUE_CATEGORY_LABEL, STATUS_META, type MyReport } from '../../lib/report-types'

export function MyReportsList({ reports }: { reports: MyReport[] }) {
  if (reports.length === 0) return null

  return (
    <div className="space-y-2">
      <h2 className="font-display text-sm font-semibold text-ink-900">My Reports</h2>
      <div className="space-y-2">
        {reports.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-mist-200 bg-white p-3 shadow-sm"
          >
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-ink-500">{r.id}</p>
              <p className="truncate text-sm font-medium text-ink-900">{ISSUE_CATEGORY_LABEL[r.category]}</p>
              <p className="truncate text-xs text-ink-500">{r.addressText}</p>
            </div>
            <span
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_META[r.status].className}`}
            >
              {STATUS_META[r.status].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
