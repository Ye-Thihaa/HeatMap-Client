import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ConfidenceGauge } from '@/components/dashboard/ConfidenceGauge'
import { ReasoningReveal } from '@/components/dashboard/ReasoningReveal'
import {
  useDashboardRankings,
  useEstimateIntervention,
  useInterventionHistory,
  useSaveIntervention
} from '@/lib/queries'
import type { InterventionType } from '@/lib/types'

const INTERVENTIONS: { value: InterventionType; label: string; unit: string }[] = [
  { value: 'tree_planting', label: 'Tree planting', unit: 'trees' },
  { value: 'cooling_center', label: 'Cooling center', unit: 'centers' },
  { value: 'material_change', label: 'Material change', unit: '% area' },
  { value: 'shade_structure', label: 'Shade structure', unit: 'structures' }
]

export function InterventionsPage() {
  const { data: zones = [] } = useDashboardRankings()
  const [zoneId, setZoneId] = useState('')
  const [type, setType] = useState<InterventionType>('tree_planting')
  const [quantity, setQuantity] = useState(50)

  const estimate = useEstimateIntervention()
  const save = useSaveIntervention()
  const history = useInterventionHistory(zoneId || undefined)

  function handleEstimate(e: FormEvent) {
    e.preventDefault()
    if (!zoneId) return
    estimate.mutate({ zone_id: zoneId, intervention_type: type, quantity })
  }

  function handleSave() {
    if (!estimate.data || !zoneId) return
    save.mutate({ zone_id: zoneId, intervention_type: type, quantity, ...estimate.data })
  }

  const unit = INTERVENTIONS.find((i) => i.value === type)?.unit ?? ''

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={handleEstimate} className="space-y-4 rounded-2xl border border-ink-800 bg-ink-900 p-5">
        <h1 className="font-display text-xl font-semibold text-white">AI intervention estimator</h1>
        <p className="text-sm text-ink-600">
          Model the cooling impact of a planned intervention before committing budget.
        </p>

        <div>
          <label className="mb-1 block text-sm font-medium text-mist-100">Zone</label>
          <select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-mist-100"
          >
            <option value="">Select a zone…</option>
            {zones.map((z) => (
              <option key={z.zone_id} value={z.zone_id}>
                {z.zone_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-mist-100">Intervention</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as InterventionType)}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-mist-100"
          >
            {INTERVENTIONS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-mist-100">
            Quantity ({unit})
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-mist-100"
          />
        </div>

        <button
          type="submit"
          disabled={!zoneId || estimate.isPending}
          className="w-full rounded-lg bg-safe py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-50"
        >
          {estimate.isPending ? 'Estimating…' : 'Run estimate'}
        </button>
      </form>

      <div className="space-y-4">
        {estimate.data ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-ink-800 bg-gradient-to-br from-ink-900 to-ink-800 p-6"
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <ConfidenceGauge confidence={estimate.data.confidence} />
              <div className="flex-1">
                <p className="font-mono text-3xl font-semibold text-white">
                  −{estimate.data.estimated_reduction_c.toFixed(1)}°C
                </p>
                <p className="text-sm text-ink-600">Estimated temperature reduction</p>
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-ink-950/60 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-600">
                Why this estimate
              </p>
              <ReasoningReveal text={estimate.data.reasoning} />
            </div>
            <button
              onClick={handleSave}
              disabled={save.isPending}
              className="mt-4 rounded-lg border border-safe px-4 py-2 text-sm font-medium text-safe hover:bg-safe/10 disabled:opacity-50"
            >
              {save.isPending ? 'Saving…' : save.isSuccess ? 'Saved ✓' : 'Save this estimate'}
            </button>
          </motion.div>
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-ink-800 text-sm text-ink-600">
            Run an estimate to see the AI's reasoning here.
          </div>
        )}

        {zoneId && (history.data?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-ink-800 bg-ink-900 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-600">
              Past interventions for this zone
            </p>
            <ul className="space-y-2">
              {history.data!.map((h) => (
                <li key={h.id} className="flex items-center justify-between text-sm text-mist-100">
                  <span>
                    {String(h.intervention_type).replaceAll('_', ' ')} × {h.quantity}
                  </span>
                  <span className="font-mono text-ink-600">
                    −{h.estimated_reduction_c.toFixed(1)}°C
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
