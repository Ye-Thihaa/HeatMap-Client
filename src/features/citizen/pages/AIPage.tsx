import { useState } from 'react'
import { Send } from 'lucide-react'

export function AIPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setMessages((prev) => [...prev, { role: 'user', text: input }])
    setInput('')
  }

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {messages.length === 0 && (
          <p className="pt-20 text-center text-sm text-ink-500">Start a conversation</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-ink-900 text-white'
                  : 'border border-mist-200 bg-white text-ink-900'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-mist-200 p-4">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-mist-200 bg-mist-50 px-4 py-2.5 text-sm outline-none focus:border-ink-300"
          />
          <button
            onClick={handleSend}
            className="grid h-10 w-10 place-items-center rounded-xl bg-ink-900 text-white transition-colors hover:bg-ink-700"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
