import { api } from './api'

export type TipoCampanha = 'MARKETING' | 'UTILITY'

export interface NovaCampanha {
  nome: string
  tipo: TipoCampanha
  template: string
  idioma: string
  usarPrimeiroNome: boolean
  imagemUrl: string | null
  pacienteIds: number[]
}

export interface Campanha {
  id: number
  nome: string
  tipo: string
  template: string
  criadoPor: string
  criadoEm: string
  total: number
  pendentes: number
  enviados: number
  entregues: number
  lidos: number
  falhas: number
}

export function criarCampanha(dados: NovaCampanha) {
  return api<Campanha>('/campanhas', { method: 'POST', body: JSON.stringify(dados) })
}

export interface Template {
  nome: string
  idioma: string
  categoria: 'MARKETING' | 'UTILITY'
  cabecalho: 'NENHUM' | 'TEXTO' | 'IMAGEM' | 'VIDEO' | 'DOCUMENTO' | 'OUTRO'
  cabecalhoTexto: string | null
  corpo: string | null
  rodape: string | null
  botoes: string[]
  variaveis: number
  exigeImagem: boolean
  suportado: boolean
  motivo: string | null
}

export function listarTemplates() {
  return api<Template[]>('/templates')
}

export interface FalhaResumo {
  motivo: string
  quantidade: number
}

export function listarCampanhas() {
  return api<Campanha[]>('/campanhas')
}

export function buscarCampanha(id: number) {
  return api<Campanha>(`/campanhas/${id}`)
}

export function listarFalhas(id: number) {
  return api<FalhaResumo[]>(`/campanhas/${id}/falhas`)
}

// Enquanto ha mensagens na fila, a tela atualiza sozinha. Depois para, para o Neon poder dormir.
export const INTERVALO_ATUALIZACAO_MS = 15_000

export function emAndamento(c: Campanha) {
  return c.pendentes > 0
}
