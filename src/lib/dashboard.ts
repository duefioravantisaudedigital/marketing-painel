import { api } from './api'

// ---------- Resumo de envios (topo da aba Campanhas) ----------

export interface Contagens {
  mensagens: number
  enviados: number
  entregues: number
  lidos: number
  falhas: number
}

export interface ResumoEnvios {
  dias: number
  campanhas: number
  total: Contagens & { pacientes: number }
  porTipo: (Contagens & { tipo: string })[]
  porDia: { dia: string; mensagens: number; entregues: number; lidos: number; falhas: number }[]
  base: { comTelefone: number; jaContatados: number }
}

export const PERIODOS = [7, 30, 90] as const

export function buscarResumoEnvios(dias: number) {
  return api<ResumoEnvios>(`/envios/resumo?dias=${dias}`)
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

// ---------- Dashboard de pacientes ----------

export interface Local {
  nome: string
  uf: string | null
  pacientes: number
}

export interface DashboardPacientes {
  base: { total: number; comTelefone: number; comEmail: number }
  porMes: { mes: string; consultas: number; novos: number }[]
  recorrencia: { uma: number; duas: number; tresACinco: number; seisOuMais: number }
  inatividade: { ate30: number; de31a90: number; de91a180: number; de181a365: number; maisDe365: number; semData: number }
  estados: Local[]
  cidades: Local[]
  semEstado: number
  semCidade: number
}

export function buscarDashboardPacientes() {
  return api<DashboardPacientes>('/dashboard/pacientes')
}
