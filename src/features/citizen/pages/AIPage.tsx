import { Brain } from 'lucide-react'

export function AIPage() {
  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">AI Heat Analysis</h1>
        <p className="text-sm text-ink-600">
          Machine learning models analyze heat patterns, predict risk zones, and suggest
          interventions.
        </p>
      </div>

      <div className="rounded-2xl border border-mist-200 bg-white p-8 text-center shadow-sm">
        <Brain className="mx-auto h-12 w-12 text-risk-high" />
        <p className="mt-4 text-sm text-ink-600">
          AI-powered analysis dashboard coming soon.
        </p>
      </div>
    </div>
  )
}
