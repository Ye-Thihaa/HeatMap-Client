import { useState, type FormEvent, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubmitCoolingGapReport, useSubmitHeatReport } from '@/lib/queries'
import type { CoolingGapCategory } from '@/lib/types'

const CATEGORIES: { value: CoolingGapCategory; label: string }[] = [
  { value: 'no_cooling_center', label: 'No cooling center nearby' },
  { value: 'insufficient_capacity', label: 'Insufficient capacity' },
  { value: 'closed_or_inactive', label: 'Closed or inactive' },
  { value: 'too_far', label: 'Too far to reach' },
  { value: 'other', label: 'Other' }
]

export function ReportGapPage() {
  const [mode, setMode] = useState<'gap' | 'heat'>('gap')

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Report</h1>
        <p className="text-sm text-ink-600">Help planners see what's missing on the ground.</p>
      </div>

      <div className="inline-flex rounded-full bg-mist-100 p-1">
        <ModeButton active={mode === 'gap'} onClick={() => setMode('gap')}>
          Cooling gap
        </ModeButton>
        <ModeButton active={mode === 'heat'} onClick={() => setMode('heat')}>
          Extreme heat spot
        </ModeButton>
      </div>

      {mode === 'gap' ? <CoolingGapForm /> : <HeatReportForm />}
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-600'
      }`}
    >
      {children}
    </button>
  )
}

function CoolingGapForm() {
  const [category, setCategory] = useState<CoolingGapCategory>('no_cooling_center')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const mutation = useSubmitCoolingGapReport()

  function useMyLocation() {
    navigator.geolocation?.getCurrentPosition((pos) =>
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!location) return
    mutation.mutate({ ...location, category, description: description || undefined })
  }

  if (mutation.isSuccess) return <SubmitConfirmation onReset={() => mutation.reset()} />

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-mist-200 bg-white p-5 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium">Location</label>
        <button
          type="button"
          onClick={useMyLocation}
          className="w-full rounded-lg border border-mist-200 px-3 py-2 text-left text-sm text-ink-700 hover:bg-mist-50"
        >
          {location
            ? `Pinned: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
            : 'Use current location'}
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">What's the issue?</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CoolingGapCategory)}
          className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Details (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
          placeholder="Anything planners should know?"
        />
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-600">Something went wrong. Try again.</p>
      )}

      <button
        type="submit"
        disabled={!location || mutation.isPending}
        className="w-full rounded-lg bg-ink-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {mutation.isPending ? 'Submitting…' : 'Submit report'}
      </button>
    </form>
  )
}

function HeatReportForm() {
  const [temp, setTemp] = useState(38)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const mutation = useSubmitHeatReport()

  function useMyLocation() {
    navigator.geolocation?.getCurrentPosition((pos) =>
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!location) return
    mutation.mutate({ ...location, estimated_temp_c: temp, description: description || undefined })
  }

  if (mutation.isSuccess) return <SubmitConfirmation onReset={() => mutation.reset()} />

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-mist-200 bg-white p-5 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium">Location</label>
        <button
          type="button"
          onClick={useMyLocation}
          className="w-full rounded-lg border border-mist-200 px-3 py-2 text-left text-sm text-ink-700 hover:bg-mist-50"
        >
          {location
            ? `Pinned: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
            : 'Use current location'}
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Estimated temperature: <span className="font-mono">{temp}°C</span>
        </label>
        <input
          type="range"
          min={25}
          max={50}
          value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
          className="w-full accent-risk-high"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Details (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={!location || mutation.isPending}
        className="w-full rounded-lg bg-risk-high py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {mutation.isPending ? 'Submitting…' : 'Flag this spot'}
      </button>
    </form>
  )
}

function SubmitConfirmation({ onReset }: { onReset: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-mist-200 bg-white p-8 text-center shadow-sm"
      >
        <motion.svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          initial="hidden"
          animate="visible"
        >
          <motion.circle
            cx="28"
            cy="28"
            r="26"
            stroke="#2DD4BF"
            strokeWidth="3"
            variants={{
              hidden: { pathLength: 0 },
              visible: { pathLength: 1, transition: { duration: 0.5 } }
            }}
          />
          <motion.path
            d="M17 29L24 36L39 20"
            stroke="#2DD4BF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              hidden: { pathLength: 0 },
              visible: { pathLength: 1, transition: { duration: 0.4, delay: 0.4 } }
            }}
          />
        </motion.svg>
        <div>
          <p className="font-display font-semibold">Thanks — that's on the record.</p>
          <p className="text-sm text-ink-600">Planners can see this in their priority queue.</p>
        </div>
        <button onClick={onReset} className="text-sm font-medium text-ink-700 underline">
          Submit another
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
