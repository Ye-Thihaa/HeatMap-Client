import type { MyReport } from './report-types'

const REPORTS_KEY = 'kly_my_reports'
const SEQ_KEY = 'kly_report_seq'

export function loadMyReports(): MyReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY)
    return raw ? (JSON.parse(raw) as MyReport[]) : []
  } catch {
    return []
  }
}

export function saveMyReports(reports: MyReport[]) {
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
  } catch {
    // localStorage unavailable (e.g. private browsing) — reports still work
    // for the current session via in-memory state, just won't persist.
  }
}

export function nextReportId(): string {
  let seq = 700
  try {
    seq = Number(localStorage.getItem(SEQ_KEY)) || 700
  } catch {
    // ignore — fall back to the default seed
  }
  seq += 1
  try {
    localStorage.setItem(SEQ_KEY, String(seq))
  } catch {
    // ignore
  }
  const year = new Date().getFullYear()
  return `KLY-${year}-${String(seq).padStart(4, '0')}`
}
