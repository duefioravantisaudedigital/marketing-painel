import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { useAuth } from '../lib/auth'
import { Marca } from './Marca'

const classeLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 font-medium transition ${
    isActive ? 'bg-marca-claro/60 text-marca-escuro' : 'text-slate-600 hover:bg-slate-100 hover:text-marca-escuro'
  }`

export function Layout({ children }: { children: ReactNode }) {
  const { sair } = useAuth()
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Marca />
            <nav className="flex gap-1 text-sm">
              <NavLink to="/" end className={classeLink}>Pacientes</NavLink>
              <NavLink to="/campanhas" className={classeLink}>Campanhas</NavLink>
            </nav>
          </div>
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
