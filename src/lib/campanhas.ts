import { api } from './api'
import type { Pagina } from './pacientes'

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
  cliques: number
  conversoes: number
  janelaAte: string | null
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

export interface BotaoResumo {
  botao: string
  pacientes: number
}

export type FiltroDestinatario = 'TODOS' | 'LERAM' | 'CLICARAM' | 'CONVERTERAM' | 'NAO_LERAM' | 'FALHARAM'

export interface Destinatario {
  envioId: number
  pacienteId: number
  nome: string | null
  telefone: string
  status: 'pendente' | 'enviando' | 'enviado' | 'entregue' | 'lido' | 'falhou'
  enviadoEm: string | null
  entregueEm: string | null
  lidoEm: string | null
  botao: string | null
  clicouEm: string | null
  consultouEm: string | null
  consultouOrigem: string | null
  erro: string | null
}

export function listarBotoes(id: number) {
  return api<BotaoResumo[]>(`/campanhas/${id}/botoes`)
}

export function listarDestinatarios(id: number, filtro: FiltroDestinatario, pagina: number) {
  return api<Pagina<Destinatario>>(`/campanhas/${id}/destinatarios?filtro=${filtro}&pagina=${pagina}`)
}

export function listarConversoes(id: number) {
  return api<BotaoResumo[]>(`/campanhas/${id}/conversoes`)
}

/** A janela de 30 dias ainda esta aberta: o numero de conversoes pode subir. */
export function janelaAberta(c: Campanha) {
  return !!c.janelaAte && new Date(c.janelaAte).getTime() > Date.now()
}
