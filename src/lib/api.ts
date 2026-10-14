import { lerToken, limparSessao } from './sessao'

const BASE = import.meta.env.VITE_API_URL ?? ''

/** Erro vindo da API, ja com a mensagem pronta para mostrar na tela. */
export class ErroApi extends Error {
  status: number
  campos?: Record<string, string>

  constructor(status: number, mensagem: string, campos?: Record<string, string>) {
    super(mensagem)
    this.status = status
    this.campos = campos
  }
}

/**
 * Chamada a API com o token da sessao. Em 401 (token vencido ou invalido),
 * encerra a sessao e manda para o login.
 */
export async function api<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = lerToken()
  const headers = new Headers(opcoes.headers)
  if (opcoes.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let resposta: Response
  try {
    resposta = await fetch(`${BASE}${caminho}`, { ...opcoes, headers })
  } catch {
    throw new ErroApi(0, 'Não foi possível falar com o servidor. Verifique sua conexão.')
  }

  if (resposta.status === 401 && caminho !== '/auth/login') {
    limparSessao()
    window.location.assign('/login')
    throw new ErroApi(401, 'Sessão expirada. Entre novamente.')
  }

  if (!resposta.ok) {
    // A API responde erros no formato ProblemDetail (title, detail, erros)
    let corpo: { title?: string; detail?: string; erros?: Record<string, string> } = {}
    try {
      corpo = await resposta.json()
    } catch {
      // resposta sem corpo
    }
    const mensagem = corpo.detail ?? corpo.title ?? `Erro ${resposta.status}`
    throw new ErroApi(resposta.status, mensagem, corpo.erros)
  }

  if (resposta.status === 204) return undefined as T
  return (await resposta.json()) as T
}
