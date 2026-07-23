import { Bell, TrendingUp, TrendingDown, Sparkles, Lightbulb } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-context'
import { useNotifications, type HeatRiskNotification } from '@/lib/notifications-context'

const RISK_COLORS: Record<string, string> = {
  low: 'text-green-600 bg-green-50',
  moderate: 'text-amber-600 bg-amber-50',
  high: 'text-orange-600 bg-orange-50',
  severe: 'text-red-600 bg-red-50',
}

// Most i18n setups (including whatever this project's t() does) return the
// key itself when a translation is missing, rather than null/undefined —
// which is why `t('notifications.empty') ?? 'fallback'` was silently
// always picking the untranslated key (a non-null string) over the
// fallback. This checks for that "returned its own key back" case
// explicitly instead of relying on `??`.
function tt(t: (key: string, vars?: Record<string, string>) => string, key: string, fallback: string, vars?: Record<string, string>) {
  const value = t(key, vars)
  return !value || value === key ? fallback : value
}

function NotificationRow({ n, onRead, tFn }: { n: HeatRiskNotification; onRead: (id: string) => void; tFn: (k: string, v?: Record<string, string>) => string }) {
  const Icon = n.is_tip ? Lightbulb : n.direction === 'up' ? TrendingUp : TrendingDown

  return (
    <button
      type="button"
      onClick={() => onRead(n.id)}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
        n.read ? 'border-mist-200 bg-white/60' : 'border-mist-300 bg-white shadow-sm'
      }`}
    >
      <div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${n.is_tip ? 'bg-emerald-50 text-emerald-600' : RISK_COLORS[n.to_risk] ?? 'text-ink-600 bg-mist-100'}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-ink-900">{n.zone_name}</p>
          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500" />}
          {n.is_tip && (
            <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
              Tip
            </span>
          )}
          {n.is_demo && (
            <span className="shrink-0 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">
              Demo
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-ink-600">
          {n.is_tip && n.tip_text
            ? n.tip_text
            : `${tt(tFn, 'notifications.riskChanged', `Risk level changed from ${n.from_risk} to ${n.to_risk}`, { from: n.from_risk, to: n.to_risk })}${n.current_temp_c != null ? ` · ${n.current_temp_c}°C` : ''}`
          }
        </p>
        <p className="mt-1 text-xs text-ink-400">
          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </button>
  )
}

export function NotificationsPage() {
  const { t } = useLanguage()
  const { notifications, unreadCount, markAllRead, markRead, clearAll, loadDemoNotifications } = useNotifications()

  return (
    <div className="mx-auto max-w-lg space-y-5 px-5 py-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {tt(t, 'notifications.title', 'Notifications')}
          </h1>
          <p className="text-sm text-ink-600">
            {tt(t, 'notifications.subtitle', 'Stay informed about heat alerts and updates.')}
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex shrink-0 gap-2 pt-1">
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-medium text-sky-600 hover:underline">
                {tt(t, 'notifications.markAllRead', 'Mark all read')}
              </button>
            )}
            <button type="button" onClick={clearAll} className="text-xs font-medium text-ink-400 hover:underline">
              {tt(t, 'notifications.clear', 'Clear')}
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mist-200 bg-white/60 py-20 text-center">
          <Bell className="h-10 w-10 text-ink-300" />
          <p className="mt-4 text-sm text-ink-500">{tt(t, 'notifications.empty', 'No notifications yet')}</p>
          <p className="mt-1 max-w-xs text-xs text-ink-400">
            {tt(
              t,
              'notifications.emptyHint',
              "You'll see an alert here when a zone's heat risk level changes, while using live data."
            )}
          </p>
          {!import.meta.env.PROD && (
            <button
              type="button"
              onClick={loadDemoNotifications}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-mist-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 shadow-sm hover:bg-mist-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Load sample notifications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationRow key={n.id} n={n} onRead={markRead} tFn={t} />
          ))}
        </div>
      )}
    </div>
  )
}