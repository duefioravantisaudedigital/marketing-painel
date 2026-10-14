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
