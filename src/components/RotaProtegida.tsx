import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../lib/auth'

export function RotaProtegida({ children }: { children: ReactNode }) {
  const { autenticado } = useAuth()
  if (!autenticado) return <Navigate to="/login" replace />
  return <>{children}</>
}
