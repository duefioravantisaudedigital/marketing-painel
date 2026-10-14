import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Marca } from '../components/Marca'
import { ErroApi } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { autenticado, entrar } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (autenticado) return <Navigate to="/" replace />

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await entrar(email.trim(), senha)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ErroApi && err.status === 401) {
        setErro('E-mail ou senha inválidos.')
      } else if (err instanceof ErroApi && err.status === 429) {
        setErro('Muitas tentativas seguidas. Aguarde um minuto e tente de novo.')
      } else if (err instanceof ErroApi && err.status === 400) {
        setErro('Preencha um e-mail válido e a senha.')
      } else {
        setErro(err instanceof Error ? err.message : 'Erro inesperado.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-marca-escuro via-marca-petroleo to-marca-turquesa p-12">
        <Marca claro />
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold text-white leading-snug">
            Pacientes, campanhas e resultados em um só lugar.
          </h1>
          <p className="mt-4 text-marca-claro">
            Filtre a base, selecione quem recebe e acompanhe cada mensagem até a leitura.
          </p>
        </div>
        <p className="text-xs text-marca-claro/70">Acesso restrito à equipe Due Fioravanti.</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={aoEnviar} className="w-full max-w-sm space-y-6" noValidate>
          <div className="lg:hidden">
            <Marca />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-marca-escuro">Entrar</h2>
            <p className="mt-1 text-sm text-slate-500">Use o e-mail e a senha cadastrados para você.</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">E-mail</span>
              <input
                type="email"
                autoComplete="username"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-marca-turquesa focus:ring-2 focus:ring-marca-turquesa/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Senha</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-marca-turquesa focus:ring-2 focus:ring-marca-turquesa/20"
              />
            </label>
          </div>

          {erro && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando || !email || !senha}
            className="w-full rounded-lg bg-marca-escuro py-2.5 font-medium text-white transition hover:bg-marca-petroleo disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
