import { AlertTriangle, Loader, Send, Search, CheckCircle2, XCircle, Clock, type LucideIcon } from 'lucide-react'
import type { CoolingGapStatus } from '@/lib/types'

const STATUS_CONFIG: Record<CoolingGapStatus, { icon: LucideIcon; label: string; bg: string; text: string }> = {
  pending: {
    icon: AlertTriangle,
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  in_progress: {
    icon: Loader,
    label: 'In progress',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  submitted: {
    icon: Send,
    label: 'Submitted',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
  in_review: {
    icon: Search,
    label: 'In review',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
  },
  success: {
    icon: CheckCircle2,
    label: 'Success',
    bg: 'bg-green-50',
    text: 'text-green-700',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    bg: 'bg-red-50',
    text: 'text-red-700',
  },
  expired: {
    icon: Clock,
    label: 'Expired',
    bg: 'bg-gray-50',
    text: 'text-gray-600',
  },
}

export function StatusBadge({ status }: { status: CoolingGapStatus }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  )
}
