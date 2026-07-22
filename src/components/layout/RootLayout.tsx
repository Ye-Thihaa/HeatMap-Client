import type { ReactNode } from 'react'

export function RootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>
}
