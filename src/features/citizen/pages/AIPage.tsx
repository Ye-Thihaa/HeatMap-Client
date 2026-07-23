import { useEffect, useRef, useState } from 'react'
import { Send, MapPin, Sparkles, User, Thermometer, Trees } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-context'
import { api } from '@/lib/api-client'

type ZoneContext = {
  name: string
  risk_level: string
  current_temp_c: number
  green_cover_pct: number
} | null

type Msg = { role: 'user' | 'assistant'; text: string }

async function sendAssistantMessage(
  message: string,
  location: { lat: number; lng: number } | null,
  history: Msg[],
  language: 'en' | 'mm',
) {
  const result = await api.sendAssistantMessage({
    message,
    lat: location?.lat ?? null,
    lng: location?.lng ?? null,
    history: history.slice(-6),
    language,
  })
  return result as { reply: string; zone_context: ZoneContext }
}

const riskStyles: Record<string, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  extreme: 'bg-red-50 text-red-700 border-red-200',
  severe: 'bg-red-50 text-red-700 border-red-200',
}

export function AIPage() {
  const { lang } = useLanguage()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(true)
  const [sending, setSending] = useState(false)
  const [zoneContext, setZoneContext] = useState<ZoneContext>(null)
  const initialized = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (!navigator.geolocation) {
      setLocating(false)
      requestInitialRecommendation(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocation(loc)
        setLocating(false)
        requestInitialRecommendation(loc)
      },
      () => {
        setLocating(false)
        requestInitialRecommendation(null)
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-request the greeting in the new language if the user switches
  // languages after the initial load (but not on first mount — that's
  // handled by the effect above).
  const firstLangRender = useRef(true)
  useEffect(() => {
    if (firstLangRender.current) {
      firstLangRender.current = false
      return
    }
    setMessages([])
    setSending(true)
    requestInitialRecommendation(location).finally(() => setSending(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  async function requestInitialRecommendation(loc: { lat: number; lng: number } | null) {
    try {
      const { reply, zone_context } = await sendAssistantMessage(
        'Give me a heat safety recommendation for my current location.',
        loc,
        [],
        lang,
      )
      setZoneContext(zone_context)
      setMessages([{ role: 'assistant', text: reply }])
    } catch {
      setMessages([
        {
          role: 'assistant',
          text: "Couldn't reach the heat safety assistant right now. You can still ask questions below.",
        },
      ])
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    const nextMessages: Msg[] = [...messages, { role: 'user', text }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)
    try {
      const { reply, zone_context } = await sendAssistantMessage(text, location, nextMessages, lang)
      if (zone_context) setZoneContext(zone_context)
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Sorry, that didn't go through. Try again." },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-lg flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-mist-200 px-5 py-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-900 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-900">Heat Safety Assistant</p>
          {locating ? (
            <p className="flex items-center gap-1 text-xs text-ink-500">
              <MapPin className="h-3 w-3" /> Getting your location…
            </p>
          ) : (
            <p className="text-xs text-ink-500">
              {location ? 'Grounded in your current location' : 'Location unavailable — general advice only'}
            </p>
          )}
        </div>
      </div>

      {/* Zone context card — real data the recommendation is grounded in */}
      {zoneContext && (
        <div className="mx-5 mt-4 rounded-2xl border border-mist-200 bg-mist-50 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
              <MapPin className="h-3.5 w-3.5 text-ink-500" />
              {zoneContext.name}
            </div>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                riskStyles[zoneContext.risk_level] ?? 'border-mist-200 bg-white text-ink-600'
              }`}
            >
              {zoneContext.risk_level} risk
            </span>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-ink-600">
            <span className="flex items-center gap-1">
              <Thermometer className="h-3.5 w-3.5" /> {zoneContext.current_temp_c}°C
            </span>
            <span className="flex items-center gap-1">
              <Trees className="h-3.5 w-3.5" /> {zoneContext.green_cover_pct}% green cover
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {messages.length === 0 && !locating && (
          <p className="pt-20 text-center text-sm text-ink-500">Start a conversation</p>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {sending && (
          <div className="flex items-end gap-2">
            <Avatar role="assistant" />
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-mist-200 bg-white px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-mist-200 p-4">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about heat safety near you..."
            className="flex-1 rounded-xl border border-mist-200 bg-mist-50 px-4 py-2.5 text-sm outline-none focus:border-ink-300"
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-900 text-white transition-colors hover:bg-ink-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Avatar({ role }: { role: 'user' | 'assistant' }) {
  return (
    <div
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
        role === 'assistant' ? 'bg-ink-900 text-white' : 'bg-mist-200 text-ink-700'
      }`}
    >
      {role === 'assistant' ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
    </div>
  )
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user'
  // Split on line breaks / sentence boundaries so multi-point replies
  // (e.g. "Stay hydrated. Avoid outdoor activity 12-4pm.") read as
  // separate lines instead of one dense paragraph.
  const paragraphs = msg.text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.?!])\s+(?=[A-Z])/))
    .filter(Boolean)

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar role={msg.role} />
      <div
        className={`max-w-[78%] space-y-1.5 rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-sm bg-ink-900 text-white'
            : 'rounded-bl-sm border border-mist-200 bg-white text-ink-900'
        }`}
      >
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  )
}