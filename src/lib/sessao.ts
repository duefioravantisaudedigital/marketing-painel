// Token guardado no sessionStorage: some ao fechar a aba, o que reduz a janela de uso
// indevido num computador compartilhado. A validade vem da propria API (8 horas).

const CHAVE = 'marketing.sessao'

interface Sessao {
  token: string
  expiraEm: number
}

export function salvarSessao(token: string, expiraEmSegundos: number) {
  const sessao: Sessao = { token, expiraEm: Date.now() + expiraEmSegundos * 1000 }
  sessionStorage.setItem(CHAVE, JSON.stringify(sessao))
}

export function lerToken(): string | null {
  const bruto = sessionStorage.getItem(CHAVE)
  if (!bruto) return null
  try {
    const sessao = JSON.parse(bruto) as Sessao
    if (Date.now() >= sessao.expiraEm) {
      limparSessao()
      return null
    }
    return sessao.token
  } catch {
    limparSessao()
    return null
  }
}

export function limparSessao() {
  sessionStorage.removeItem(CHAVE)
}
