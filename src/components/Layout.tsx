import type { ReactNode } from 'react'
import { useAuth } from '../lib/auth'
import { Marca } from './Marca'

export function Layout({ children }: { children: ReactNode }) {
  const { sair } = useAuth()
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Marca />
          <button
            onClick={sair}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-marca-escuro"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}
