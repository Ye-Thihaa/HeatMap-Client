import { Gauge } from 'lucide-react'
import { SEVERITY_META, type Severity } from '../../lib/report-types'

const LEVELS: Severity[] = ['low', 'medium', 'high']

interface Props {
  value: Severity
  onChange: (value: Severity) => void
  aiSuggested: Severity | null
}

export function SeveritySelector({ value, onChange, aiSuggested }: Props) {
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-sm font-medium">
          <Gauge className="h-4 w-4 text-ink-500" />
          Severity level <span className="text-risk-high">*</span>
        </label>
        {aiSuggested && (
          <span className="rounded-full bg-ink-900 px-2 py-0.5 text-[10px] font-medium text-white">
            AI suggests: {SEVERITY_META[aiSuggested].label}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {LEVELS.map((level) => {
          const active = value === level
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              aria-pressed={active}
              className={`rounded-xl border py-2 text-sm font-medium transition-colors ${
                active ? SEVERITY_META[level].active : 'border-mist-200 text-ink-600 hover:bg-mist-50'
              }`}
            >
              {SEVERITY_META[level].label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
