import { api } from './api'

export type HistoricoEnvio = 'TODOS' | 'NUNCA' | 'MARKETING' | 'UTILITY'
export type Ordenacao = 'ULTIMA_CONSULTA' | 'NOME' | 'PASSAGENS'

export interface Filtros {
  origem: string
  consultouUltimosDias: string
  semConsultaUltimosDias: string
  minPassagens: string
  historicoEnvio: HistoricoEnvio
  cidade: string
  busca: string
  ordenacao: Ordenacao
}

export const FILTROS_INICIAIS: Filtros = {
  origem: '',
  consultouUltimosDias: '',
  semConsultaUltimosDias: '',
  minPassagens: '',
  historicoEnvio: 'TODOS',
  cidade: '',
  busca: '',
  ordenacao: 'ULTIMA_CONSULTA',
}

export interface Paciente {
  id: number
  nome: string
  telefone: string
  email: string | null
  cidade: string | null
  estado: string | null
  fonte: string
  passagens: number
  ultimaConsulta: string | null
  historicoCompleto: boolean
  ultimoMarketing: string | null
  ultimoUtility: string | null
}

export interface Pagina<T> {
  itens: T[]
  pagina: number
  tamanho: number
  total: number
}

export interface Origem {
  origem: string
  pacientes: number
}

export const TAMANHO_PAGINA = 50

export function listarPacientes(filtros: Filtros, pagina: number) {
  const params = new URLSearchParams()
  // So manda o que foi preenchido: campo vazio = sem filtro
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== '' && valor !== null) params.set(chave, String(valor).trim())
  }
  params.set('pagina', String(pagina))
  params.set('tamanho', String(TAMANHO_PAGINA))
  return api<Pagina<Paciente>>(`/pacientes?${params.toString()}`)
}

export function listarOrigens() {
  return api<Origem[]>('/pacientes/origens')
}
