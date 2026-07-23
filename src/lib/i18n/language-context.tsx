import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { translations, type Lang } from './translations'

export type { Lang }

const STORAGE_KEY = 'a-yate-sitt-lang'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'mm' ? 'mm' : 'en'
  } catch {
    return 'en'
  }
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? ''))
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)

  const value = useMemo<LanguageContextValue>(() => {
    function setLang(next: Lang) {
      setLangState(next)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // localStorage unavailable — language choice just won't persist
      }
      document.documentElement.lang = next === 'mm' ? 'my' : 'en'
    }

    function t(key: string, params?: Record<string, string | number>): string {
      const entry = translations[key]
      if (!entry) return key
      return interpolate(entry[lang], params)
    }

    return { lang, setLang, t }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
