import { api } from './api'

export interface Contagens {
  mensagens: number
  enviados: number
  entregues: number
  lidos: number
  falhas: number
}

export interface Dashboard {
  dias: number
  campanhas: number
  total: Contagens & { pacientes: number }
  porTipo: (Contagens & { tipo: string })[]
  porDia: { dia: string; mensagens: number; entregues: number; lidos: number; falhas: number }[]
  base: { comTelefone: number; jaContatados: number }
}

export const PERIODOS = [7, 30, 90] as const

export function buscarDashboard(dias: number) {
  return api<Dashboard>(`/dashboard?dias=${dias}`)
}

// "2026-10-14" de hoje no horario de Brasilia
function hojeBrasilia(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

/** Todos os dias do periodo, inclusive os sem envio (o grafico precisa dos zeros). */
export function diasDoPeriodo(dias: number): string[] {
  const [a, m, d] = hojeBrasilia().split('-').map(Number)
  const hoje = Date.UTC(a, m - 1, d)
  return Array.from({ length: dias }, (_, i) =>
    new Date(hoje - (dias - 1 - i) * 86_400_000).toISOString().slice(0, 10),
  )
}
