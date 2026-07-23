import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useHeatZones } from '@/lib/queries'
import type { HeatZoneSummary } from '@/lib/types'

export interface HeatRiskNotification {
  id: string
  zone_id: string
  zone_name: string
  from_risk: string
  to_risk: string
  direction: 'up' | 'down'
  current_temp_c: number | null
  created_at: string
  read: boolean
  is_demo?: boolean
  is_tip?: boolean
  tip_text?: string
}

interface NotificationsContextValue {
  notifications: HeatRiskNotification[]
  unreadCount: number
  markAllRead: () => void
  markRead: (id: string) => void
  clearAll: () => void
  loadDemoNotifications: () => void
  addTipNotification: (tip: string) => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

// Ranked so we can tell "got worse" from "got better" — same ordering
// already used server-side (main.py's risk_rank in /route/safety-check),
// kept consistent here rather than inventing a different scale client-side.
const RISK_RANK: Record<string, number> = { low: 0, moderate: 1, high: 2, severe: 3 }

const STORAGE_KEY = 'heat-risk-notifications'
const MAX_STORED = 50

function loadStored(): HeatRiskNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as HeatRiskNotification[]) : []
  } catch {
    return []
  }
}

function saveStored(notifications: HeatRiskNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_STORED)))
  } catch {
    // storage full or unavailable — notifications just won't persist across reloads, non-fatal
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<HeatRiskNotification[]>(() => loadStored())

  // Only watches LIVE zone data. Mock mode has no real risk changes to
  // watch — MOCK_ZONES is a static array that never mutates — so wiring
  // this to mock data would mean either nothing ever fires (accurate but
  // pointless) or fabricating fake risk changes (misleading, since the
  // user would be told a zone's risk changed when nothing really did).
  // Live risk changes are the only ones that are real and worth alerting on.
  const liveZonesQuery = useHeatZones()
  const prevZonesRef = useRef<Map<string, HeatZoneSummary> | null>(null)

  useEffect(() => {
    const zones = liveZonesQuery.data
    if (!zones || zones.length === 0) return

    const prevMap = prevZonesRef.current
    if (prevMap) {
      const newNotifications: HeatRiskNotification[] = []
      for (const zone of zones) {
        const prev = prevMap.get(zone.id)
        if (!prev) continue // newly-appeared zone, nothing to compare against yet
        if (prev.risk_level === zone.risk_level) continue

        const prevRank = RISK_RANK[prev.risk_level] ?? 0
        const nextRank = RISK_RANK[zone.risk_level] ?? 0
        newNotifications.push({
          id: `${zone.id}-${Date.now()}`,
          zone_id: zone.id,
          zone_name: zone.name,
          from_risk: prev.risk_level,
          to_risk: zone.risk_level,
          direction: nextRank > prevRank ? 'up' : 'down',
          current_temp_c: zone.current_temp_c ?? null,
          created_at: new Date().toISOString(),
          read: false,
        })
      }
      if (newNotifications.length > 0) {
        setNotifications((current) => {
          const combined = [...newNotifications, ...current].slice(0, MAX_STORED)
          saveStored(combined)
          return combined
        })
      }
    }

    prevZonesRef.current = new Map(zones.map((z) => [z.id, z]))
  }, [liveZonesQuery.data])

  const markAllRead = () => {
    setNotifications((current) => {
      const updated = current.map((n) => ({ ...n, read: true }))
      saveStored(updated)
      return updated
    })
  }

  const markRead = (id: string) => {
    setNotifications((current) => {
      const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n))
      saveStored(updated)
      return updated
    })
  }

  const clearAll = () => {
    setNotifications([])
    saveStored([])
  }

  // Seeds a few clearly-labeled sample notifications for previewing the UI
  // before any real risk change has happened yet. Marked is_demo: true so
  // they're visually distinguishable and never confused with a genuine
  // heat-risk alert derived from actual zone data.
  const loadDemoNotifications = () => {
    const now = Date.now()
    const demo: HeatRiskNotification[] = [
      {
        id: `demo-1-${now}`,
        zone_id: 'demo-zone-1',
        zone_name: 'Downtown Core',
        from_risk: 'moderate',
        to_risk: 'severe',
        direction: 'up',
        current_temp_c: 41,
        created_at: new Date(now - 5 * 60_000).toISOString(),
        read: false,
        is_demo: true,
      },
      {
        id: `demo-2-${now}`,
        zone_id: 'demo-zone-2',
        zone_name: 'Riverside District',
        from_risk: 'low',
        to_risk: 'high',
        direction: 'up',
        current_temp_c: 37,
        created_at: new Date(now - 45 * 60_000).toISOString(),
        read: true,
        is_demo: true,
      },
      {
        id: `demo-3-${now}`,
        zone_id: 'demo-zone-3',
        zone_name: 'Green Park Belt',
        from_risk: 'high',
        to_risk: 'moderate',
        direction: 'down',
        current_temp_c: 30,
        created_at: new Date(now - 3 * 60 * 60_000).toISOString(),
        read: true,
        is_demo: true,
      },
      {
        id: `demo-tip-1-${now}`,
        zone_id: '',
        zone_name: 'Heat Safety Assistant',
        from_risk: '',
        to_risk: '',
        direction: 'up',
        current_temp_c: null,
        created_at: new Date(now - 10 * 60_000).toISOString(),
        read: false,
        is_demo: true,
        is_tip: true,
        tip_text: 'Just got home? Take a cool shower, drink water, and rest in a cool room for 15 minutes.',
      },
      {
        id: `demo-tip-2-${now}`,
        zone_id: '',
        zone_name: 'Heat Safety Assistant',
        from_risk: '',
        to_risk: '',
        direction: 'up',
        current_temp_c: null,
        created_at: new Date(now - 2 * 60 * 60_000).toISOString(),
        read: false,
        is_demo: true,
        is_tip: true,
        tip_text: 'Temperature in Downtown Core rose sharply in the last hour. Avoid outdoor activity until it cools.',
      },
    ]
    setNotifications((current) => {
      const combined = [...demo, ...current].slice(0, MAX_STORED)
      saveStored(combined)
      return combined
    })
  }

  const addTipNotification = (tip: string) => {
    const notification: HeatRiskNotification = {
      id: `tip-${Date.now()}`,
      zone_id: '',
      zone_name: 'Heat Safety Assistant',
      from_risk: '',
      to_risk: '',
      direction: 'up',
      current_temp_c: null,
      created_at: new Date().toISOString(),
      read: false,
      is_tip: true,
      tip_text: tip,
    }
    setNotifications((current) => {
      const combined = [notification, ...current].slice(0, MAX_STORED)
      saveStored(combined)
      return combined
    })
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAllRead, markRead, clearAll, loadDemoNotifications, addTipNotification }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

const FALLBACK_VALUE: NotificationsContextValue = {
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  markRead: () => {},
  clearAll: () => {},
  loadDemoNotifications: () => {},
  addTipNotification: () => {},
}

let warnedMissingProvider = false

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    // Degrade instead of crashing the page: if NotificationsProvider isn't
    // mounted above this component (e.g. router wiring mistake, or a
    // file-based-routing setup where this manual route tree isn't actually
    // the one in use), consumers just see "no notifications" rather than a
    // hard error boundary. Logged once so the real wiring bug is still
    // visible and fixable, without spamming the console on every render.
    if (!warnedMissingProvider) {
      console.warn(
        '[notifications-context] useNotifications() called with no NotificationsProvider ' +
          'mounted above it — notifications will be empty. Check that NotificationsProvider ' +
          'wraps the route tree (or root layout) that is actually being rendered.'
      )
      warnedMissingProvider = true
    }
    return FALLBACK_VALUE
  }
  return ctx
}