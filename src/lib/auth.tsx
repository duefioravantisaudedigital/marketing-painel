import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import { lerToken, limparSessao, salvarSessao } from './sessao'

interface LoginResposta {
  token: string
  expiraEmSegundos: number
}

interface AuthContexto {
  autenticado: boolean
  entrar: (email: string, senha: string) => Promise<void>
  sair: () => void
}

const Contexto = createContext<AuthContexto | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [autenticado, setAutenticado] = useState(() => lerToken() !== null)

  const entrar = useCallback(async (email: string, senha: string) => {
    const resposta = await api<LoginResposta>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    })
    salvarSessao(resposta.token, resposta.expiraEmSegundos)
    setAutenticado(true)
  }, [])

  const sair = useCallback(() => {
    limparSessao()
    // Apaga os dados de pacientes que ficaram em cache na memoria do navegador
    queryClient.clear()
    setAutenticado(false)
  }, [queryClient])

  return <Contexto.Provider value={{ autenticado, entrar, sair }}>{children}</Contexto.Provider>
}

export function useAuth() {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return contexto
}
