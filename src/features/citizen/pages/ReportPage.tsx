import { useEffect, useState, type ComponentType, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, MapPin, Tag, Users, FileText, Bell } from 'lucide-react'
import { LocationPinMap } from '../components/report/LocationPinMap'
import { ChipGroup } from '../components/report/ChipGroup'
import { PhotoUpload, type PhotoItem } from '../components/report/PhotoUpload'
import { SeveritySelector } from '../components/report/SeveritySelector'
import { MyReportsList } from '../components/report/MyReportsList'
import { ReportConfirmation } from '../components/report/ReportConfirmation'
import { loadMyReports, nextReportId, saveMyReports } from '../lib/report-storage'
import {
  AFFECTED_GROUPS,
  ISSUE_CATEGORIES,
  type AffectedGroup,
  type AiPhotoAnalysis,
  type IssueCategory,
  type MyReport,
  type Severity
} from '../lib/report-types'

const ANALYSIS_POOL: AiPhotoAnalysis[] = [
  { surfaceType: 'Asphalt', shadeCoveragePct: 8, visibleDamage: true, suggestedUrgency: 'high' },
  { surfaceType: 'Concrete pavement', shadeCoveragePct: 35, visibleDamage: false, suggestedUrgency: 'low' },
  { surfaceType: 'Mixed (asphalt + bare soil)', shadeCoveragePct: 14, visibleDamage: true, suggestedUrgency: 'high' },
  { surfaceType: 'Concrete', shadeCoveragePct: 22, visibleDamage: false, suggestedUrgency: 'medium' }
]

function Section({
  icon: Icon,
  title,
  optional,
  children
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-mist-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-ink-500" />
        <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
        {optional && <span className="text-xs font-normal text-ink-500">(optional)</span>}
      </div>
      {children}
    </div>
  )
}

export function ReportGapPage() {
  const [photos, setPhotos] = useState<(PhotoItem & { file: File })[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AiPhotoAnalysis | null>(null)

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationVersion, setLocationVersion] = useState(0)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [addressText, setAddressText] = useState('')
  const [landmarkNote, setLandmarkNote] = useState('')

  const [category, setCategory] = useState<IssueCategory | null>(null)
  const [severity, setSeverity] = useState<Severity>('medium')
  const [affected, setAffected] = useState<AffectedGroup[]>([])
  const [description, setDescription] = useState('')

  const [contactMode, setContactMode] = useState<'anonymous' | 'notify'>('anonymous')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [myReports, setMyReports] = useState<MyReport[]>([])

  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    setMyReports(loadMyReports())
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  // Simulated AI photo analysis — runs whenever the photo count changes.
  useEffect(() => {
    if (photos.length === 0) {
      setAnalyzing(false)
      setAnalysis(null)
      return
    }
    setAnalyzing(true)
    const t = setTimeout(() => {
      setAnalysis(ANALYSIS_POOL[photos.length % ANALYSIS_POOL.length])
      setAnalyzing(false)
    }, 1300)
    return () => clearTimeout(t)
  }, [photos.length])

  // Revoke object URLs on unmount so we don't leak blob references.
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleAddPhotos(files: FileList) {
    const room = 3 - photos.length
    const additions = Array.from(files)
      .slice(0, room)
      .map((file) => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) }))
    setPhotos((prev) => [...prev, ...additions])
  }

  function handleRemovePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.')
      return
    }
    setLocating(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLocation({ lat, lng })
        setAddressText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        setLocationVersion((v) => v + 1)
        setLocating(false)
      },
      () => {
        setGeoError('Location access was denied. You can still type an address manually.')
        setLocating(false)
      }
    )
  }

  const canSubmit = photos.length > 0 && location !== null && category !== null && !submitting

  function resetForm() {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    setPhotos([])
    setLocation(null)
    setAddressText('')
    setLandmarkNote('')
    setCategory(null)
    setSeverity('medium')
    setAffected([])
    setDescription('')
    setContactMode('anonymous')
    setEmail('')
    setPhone('')
    setSubmittedId(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit || !location || !category) return

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 900))

    const report: MyReport = {
      id: nextReportId(),
      category,
      severity,
      aiUrgency: analysis?.suggestedUrgency ?? null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      addressText: addressText || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
    }
    const updated = [report, ...myReports]
    setMyReports(updated)
    saveMyReports(updated)
    setSubmitting(false)
    setSubmittedId(report.id)
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 px-5 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Report</h1>
        <p className="text-sm text-ink-600">Help planners see what's missing on the ground.</p>
      </div>

      <AnimatePresence mode="wait">
        {submittedId ? (
          <motion.div key="confirmation" exit={{ opacity: 0 }}>
            <ReportConfirmation reportId={submittedId} onReset={resetForm} />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <PhotoUpload
              photos={photos}
              onAdd={handleAddPhotos}
              onRemove={handleRemovePhoto}
              analyzing={analyzing}
              analysis={analysis}
            />

            <Section icon={MapPin} title="Location">
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                className="w-full rounded-lg bg-ink-900 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {locating ? 'Locating…' : location ? 'Re-detect my location' : 'Use current location'}
              </button>
              {geoError && <p className="text-xs text-red-600">{geoError}</p>}

              <input
                type="text"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="Address (auto-filled once located, editable)"
                className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
              />

              {location && (
                <LocationPinMap
                  key={locationVersion}
                  lat={location.lat}
                  lng={location.lng}
                  onChange={(lat, lng) => setLocation({ lat, lng })}
                />
              )}

              <input
                type="text"
                value={landmarkNote}
                onChange={(e) => setLandmarkNote(e.target.value)}
                placeholder='Landmark note, e.g. "near Jollibee Katipunan" (optional)'
                className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
              />
            </Section>

            <Section icon={Tag} title="Issue category">
              <ChipGroup options={ISSUE_CATEGORIES} value={category} onChange={setCategory} />
            </Section>

            <Section icon={Bell} title="Severity">
              <SeveritySelector value={severity} onChange={setSeverity} aiSuggested={analysis?.suggestedUrgency ?? null} />
            </Section>

            <Section icon={Users} title="Who's affected" optional>
              <ChipGroup multiple options={AFFECTED_GROUPS} value={affected} onChange={setAffected} />
            </Section>

            <Section icon={FileText} title="Description" optional>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Anything else officials should know?"
                className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
              />
            </Section>

            <div className="flex items-center justify-between rounded-2xl border border-mist-200 bg-white px-5 py-3 shadow-sm">
              <span className="flex items-center gap-1.5 text-sm text-ink-600">
                <Clock className="h-4 w-4 text-ink-500" />
                Date &amp; time
              </span>
              <span className="text-sm font-medium text-ink-800">
                {now.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>

            <Section icon={Bell} title="Contact" optional>
              <div className="inline-flex rounded-full bg-mist-100 p-1">
                <button
                  type="button"
                  onClick={() => setContactMode('anonymous')}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    contactMode === 'anonymous' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-600'
                  }`}
                >
                  Report anonymously
                </button>
                <button
                  type="button"
                  onClick={() => setContactMode('notify')}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    contactMode === 'notify' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-600'
                  }`}
                >
                  Notify me of updates
                </button>
              </div>

              <AnimatePresence>
                {contactMode === 'notify' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number (optional)"
                      className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Section>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-lg bg-risk-high py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit report'}
            </button>
            {!canSubmit && !submitting && (photos.length === 0 || !location || !category) && (
              <p className="text-center text-xs text-ink-500">
                Add a photo, confirm a location, and pick an issue category to submit.
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>

      <MyReportsList reports={myReports} />
    </div>
  )
}
