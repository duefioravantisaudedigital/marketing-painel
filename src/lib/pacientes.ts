import { api, baixar } from './api'

export type HistoricoEnvio = 'TODOS' | 'NUNCA' | 'MARKETING' | 'UTILITY'
export type Ordenacao = 'ULTIMA_CONSULTA' | 'NOME' | 'PASSAGENS'
export type Jornada = 'TODAS' | 'MEDPREV_VOLTOU' | 'SO_MEDPREV'
export type PeriodoMes = '' | 'INICIO' | 'MEIO' | 'FIM'

export interface Filtros {
  origem: string
  consultouUltimosDias: string
  semConsultaUltimosDias: string
  consultouDe: string // AAAA-MM-DD, dia de calendario em Brasilia
  consultouAte: string
  minPassagens: string
  historicoEnvio: HistoricoEnvio
  jornada: Jornada
  periodoMes: PeriodoMes
  cidade: string
  estado: string // sigla da UF ou regiao (NORDESTE...)
  busca: string
  ordenacao: Ordenacao
}

export const FILTROS_INICIAIS: Filtros = {
  origem: '',
  consultouUltimosDias: '',
  semConsultaUltimosDias: '',
  consultouDe: '',
  consultouAte: '',
  minPassagens: '',
  historicoEnvio: 'TODOS',
  jornada: 'TODAS',
  periodoMes: '',
  cidade: '',
  estado: '',
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
  uf: string | null // estado do cadastro normalizado ou, se faltar, pelo DDD
  ufPeloDdd: boolean
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

// So manda o que foi preenchido: campo vazio = sem filtro
function parametros(filtros: Filtros) {
  const params = new URLSearchParams()
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== '' && valor !== null) params.set(chave, String(valor).trim())
  }
  return params
}

export function listarPacientes(filtros: Filtros, pagina: number) {
  const params = parametros(filtros)
  params.set('pagina', String(pagina))
  params.set('tamanho', String(TAMANHO_PAGINA))
  return api<Pagina<Paciente>>(`/pacientes?${params.toString()}`)
}

/** Todos os pacientes do filtro (ate 1.000, o limite por campanha), para marcar de uma vez. */
export function selecionarTodosDoFiltro(filtros: Filtros) {
  return api<Pagina<Paciente>>(`/pacientes/selecao?${parametros(filtros).toString()}`)
}

export function listarOrigens() {
  return api<Origem[]>('/pacientes/origens')
}

/** CSV com todos os pacientes do filtro aplicado (sem paginacao). */
export function exportarPacientes(filtros: Filtros) {
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  return baixar(`/pacientes/exportar?${parametros(filtros).toString()}`, `pacientes-${hoje}.csv`)
}

// Estados agrupados por regiao, na ordem da lista do filtro
export const REGIOES: { codigo: string; nome: string; ufs: string[] }[] = [
  { codigo: 'SUDESTE', nome: 'Sudeste', ufs: ['SP', 'RJ', 'MG', 'ES'] },
  { codigo: 'SUL', nome: 'Sul', ufs: ['PR', 'SC', 'RS'] },
  { codigo: 'NORDESTE', nome: 'Nordeste', ufs: ['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE', 'MA', 'PI'] },
  { codigo: 'CENTRO_OESTE', nome: 'Centro-Oeste', ufs: ['DF', 'GO', 'MT', 'MS'] },
  { codigo: 'NORTE', nome: 'Norte', ufs: ['PA', 'AM', 'TO', 'RO', 'AC', 'AP', 'RR'] },
]
