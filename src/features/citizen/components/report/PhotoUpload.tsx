import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Sparkles, X } from 'lucide-react'
import type { AiPhotoAnalysis } from '../../lib/report-types'

export interface PhotoItem {
  id: string
  previewUrl: string
}

interface Props {
  photos: PhotoItem[]
  onAdd: (files: FileList) => void
  onRemove: (id: string) => void
  analyzing: boolean
  analysis: AiPhotoAnalysis | null
}

export function PhotoUpload({ photos, onAdd, onRemove, analyzing, analysis }: Props) {
  const canAddMore = photos.length < 3

  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-sm font-medium">
        <Camera className="h-4 w-4 text-ink-500" />
        Photos <span className="text-risk-high">*</span>
        <span className="ml-1 text-xs font-normal text-ink-500">(up to 3)</span>
      </label>

      <div className="flex gap-2">
        {photos.map((p) => (
          <div
            key={p.id}
            className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-mist-200"
          >
            <img src={p.previewUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(p.id)}
              aria-label="Remove photo"
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {canAddMore && (
          <label className="flex h-20 w-20 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-mist-300 text-ink-500 transition-colors hover:border-mist-400 hover:bg-mist-50">
            <Camera className="h-5 w-5" />
            <span className="text-[10px] font-medium">Add photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) onAdd(e.target.files)
                e.target.value = ''
              }}
            />
          </label>
        )}
      </div>

      <AnimatePresence mode="wait">
        {analyzing && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 rounded-xl bg-mist-50 px-3 py-2 text-xs text-ink-600"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-risk-high" />
            Analyzing photos…
          </motion.div>
        )}
        {!analyzing && analysis && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-1.5 rounded-xl border border-mist-200 bg-mist-50 p-3 text-xs"
          >
            <p className="flex items-center gap-1 font-medium text-ink-800">
              <Sparkles className="h-3.5 w-3.5 text-risk-high" />
              AI analysis
            </p>
            <div className="grid grid-cols-1 gap-1 text-ink-600 sm:grid-cols-3">
              <span>
                Surface: <b className="text-ink-900">{analysis.surfaceType}</b>
              </span>
              <span>
                Shade cover: <b className="text-ink-900">{analysis.shadeCoveragePct}%</b>
              </span>
              <span>
                Visible damage: <b className="text-ink-900">{analysis.visibleDamage ? 'Yes' : 'No'}</b>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
