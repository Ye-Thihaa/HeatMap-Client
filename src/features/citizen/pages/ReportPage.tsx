import { useEffect, useState, type ComponentType, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, MapPin, Tag, Users, FileText, Bell } from 'lucide-react'
import { LocationPinMap } from '../components/report/LocationPinMap'
import { ChipGroup } from '../components/report/ChipGroup'
import { SeveritySelector } from '../components/report/SeveritySelector'
import { MyReportsList } from '../components/report/MyReportsList'
import { ReportConfirmation } from '../components/report/ReportConfirmation'
import { loadMyReports, nextReportId, saveMyReports } from '../lib/report-storage'
import { useLanguage } from '@/lib/i18n/language-context'
import {
  AFFECTED_GROUPS,
  ISSUE_CATEGORIES,
  type AffectedGroup,
  type IssueCategory,
  type MyReport,
  type Severity
} from '../lib/report-types'

function Section({
  icon: Icon,
  title,
  optional,
  optionalLabel,
  children
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  optional?: boolean
  optionalLabel?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-mist-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-ink-500" />
        <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
        {optional && <span className="text-xs font-normal text-ink-500">{optionalLabel}</span>}
      </div>
      {children}
    </div>
  )
}

export function ReportGapPage() {
  const { lang, t } = useLanguage()

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
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoError(t('report.geoUnsupported'))
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
        setGeoError(t('report.geoDenied'))
        setLocating(false)
      }
    )
  }

  const canSubmit = location !== null && category !== null && !submitting

  function resetForm() {
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

  const categoryOptions = ISSUE_CATEGORIES.map((c) => ({ value: c.value, label: t(c.labelKey) }))
  const affectedOptions = AFFECTED_GROUPS.map((a) => ({ value: a.value, label: t(a.labelKey) }))
  const optionalLabel = t('common.optional')
  const dateTimeLabel = now.toLocaleString(lang === 'mm' ? 'my-MM' : undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <div className="mx-auto max-w-lg space-y-5 px-5 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t('report.title')}</h1>
        <p className="text-sm text-ink-600">{t('report.subtitle')}</p>
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
            <Section icon={MapPin} title={t('report.section.location')}>
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                className="w-full rounded-lg bg-ink-900 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {locating
                  ? t('report.locating')
                  : location
                    ? t('report.redetectLocation')
                    : t('report.useCurrentLocation')}
              </button>
              {geoError && <p className="text-xs text-red-600">{geoError}</p>}

              <input
                type="text"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder={t('report.addressPlaceholder')}
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
                placeholder={t('report.landmarkPlaceholder')}
                className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
              />
            </Section>

            <Section icon={Tag} title={t('report.section.category')}>
              <ChipGroup options={categoryOptions} value={category} onChange={setCategory} />
            </Section>

            <Section icon={Bell} title={t('report.section.severity')}>
              <SeveritySelector value={severity} onChange={setSeverity} />
            </Section>

            <Section icon={Users} title={t('report.section.affected')} optional optionalLabel={optionalLabel}>
              <ChipGroup multiple options={affectedOptions} value={affected} onChange={setAffected} />
            </Section>

            <Section icon={FileText} title={t('report.section.description')} optional optionalLabel={optionalLabel}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={t('report.descriptionPlaceholder')}
                className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
              />
            </Section>

            <div className="flex items-center justify-between rounded-2xl border border-mist-200 bg-white px-5 py-3 shadow-sm">
              <span className="flex items-center gap-1.5 text-sm text-ink-600">
                <Clock className="h-4 w-4 text-ink-500" />
                {t('report.dateTime')}
              </span>
              <span className="text-sm font-medium text-ink-800">{dateTimeLabel}</span>
            </div>

            <Section icon={Bell} title={t('report.section.contact')} optional optionalLabel={optionalLabel}>
              <div className="inline-flex rounded-full bg-mist-100 p-1">
                <button
                  type="button"
                  onClick={() => setContactMode('anonymous')}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    contactMode === 'anonymous' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-600'
                  }`}
                >
                  {t('report.anonymous')}
                </button>
                <button
                  type="button"
                  onClick={() => setContactMode('notify')}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    contactMode === 'notify' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-600'
                  }`}
                >
                  {t('report.notify')}
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
                      placeholder={t('report.emailPlaceholder')}
                      className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('report.phonePlaceholder')}
                      className="w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Section>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? t('report.submitting') : t('report.submit')}
            </button>
            {!canSubmit && !submitting && (!location || !category) && (
              <p className="text-center text-xs text-ink-500">{t('report.submitHint')}</p>
            )}
          </motion.form>
        )}
      </AnimatePresence>

      <MyReportsList reports={myReports} />
    </div>
  )
}
