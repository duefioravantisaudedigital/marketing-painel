import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './auth'
import type { Paciente } from './pacientes'

// Limite de pacientes por campanha (o mesmo da API)
export const MAX_SELECAO = 1000

interface SelecaoContexto {
  selecionados: Map<number, Paciente>
  alternar: (p: Paciente) => void
  adicionar: (lista: Paciente[]) => void
  remover: (ids: number[]) => void
  limpar: () => void
}

const Contexto = createContext<SelecaoContexto | null>(null)

/**
 * Pacientes escolhidos para a proxima campanha. Fica so na memoria (nada no navegador)
 * e e apagada ao sair, junto com o resto dos dados de pacientes.
 */
export function SelecaoProvider({ children }: { children: ReactNode }) {
  const { autenticado } = useAuth()
  const [selecionados, setSelecionados] = useState<Map<number, Paciente>>(new Map())

  useEffect(() => {
    if (!autenticado) setSelecionados(new Map())
  }, [autenticado])

  const alternar = useCallback((p: Paciente) => {
    setSelecionados((atual) => {
      const novo = new Map(atual)
      if (novo.has(p.id)) novo.delete(p.id)
      else if (novo.size < MAX_SELECAO) novo.set(p.id, p)
      return novo
    })
  }, [])

  const adicionar = useCallback((lista: Paciente[]) => {
    setSelecionados((atual) => {
      const novo = new Map(atual)
      for (const p of lista) {
        if (novo.size >= MAX_SELECAO) break
        novo.set(p.id, p)
      }
      return novo
    })
  }, [])

  const remover = useCallback((ids: number[]) => {
    setSelecionados((atual) => {
      const novo = new Map(atual)
      ids.forEach((id) => novo.delete(id))
      return novo
    })
  }, [])

  const limpar = useCallback(() => setSelecionados(new Map()), [])

  return (
    <Contexto.Provider value={{ selecionados, alternar, adicionar, remover, limpar }}>{children}</Contexto.Provider>
  )
}

export function useSelecao() {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useSelecao precisa estar dentro de SelecaoProvider')
  return contexto
}
