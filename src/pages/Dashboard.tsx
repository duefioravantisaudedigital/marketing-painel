import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { GraficoDiario } from '../components/GraficoDiario'
import { PERIODOS, buscarDashboard } from '../lib/dashboard'
import { formatarNumero, porcentagem } from '../lib/formato'

export default function Dashboard() {
  const [dias, setDias] = useState<number>(30)
  const painel = useQuery({
    queryKey: ['dashboard', dias],
    queryFn: () => buscarDashboard(dias),
    placeholderData: keepPreviousData,
  })
  const d = painel.data
  const t = d?.total
  const nuncaContatados = d ? Math.max(0, d.base.comTelefone - d.base.jaContatados) : 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-marca-escuro">Dashboard</h1>
          <p className="text-sm text-slate-500">Envios pelo painel nos últimos {dias} dias</p>
        </div>
        <div className="flex rounded-md border border-slate-300 bg-white p-0.5 text-sm" role="group" aria-label="Período">
          {PERIODOS.map((p) => (
            <button key={p} onClick={() => setDias(p)} aria-pressed={dias === p}
              className={`rounded px-3 py-1.5 font-medium ${dias === p ? 'bg-marca-petroleo text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {p} dias
            </button>
          ))}
        </div>
      </div>

      {painel.isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{painel.error.message}</div>
      )}

      {!d ? (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-100" />)}
        </div>
      ) : (
        <div className={`space-y-5 ${painel.isPlaceholderData ? 'opacity-60' : ''}`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Numero nome="Mensagens" valor={formatarNumero(t!.mensagens)} detalhe={`${formatarNumero(d.campanhas)} campanhas`} />
            <Numero nome="Entregues" valor={porcentagem(t!.entregues, t!.mensagens)} detalhe={formatarNumero(t!.entregues)} />
            <Numero nome="Lidas" valor={porcentagem(t!.lidos, t!.mensagens)} detalhe={formatarNumero(t!.lidos)} />
            <Numero nome="Falhas" valor={formatarNumero(t!.falhas)} detalhe={porcentagem(t!.falhas, t!.mensagens)} alerta={t!.falhas > 0} />
            <Numero nome="Pacientes alcançados" valor={formatarNumero(t!.pacientes)} detalhe="no período" />
            <Numero nome="Nunca receberam" valor={formatarNumero(nuncaContatados)} detalhe={`de ${formatarNumero(d.base.comTelefone)} com telefone`} />
          </div>

          <GraficoDiario dados={d.porDia} dias={dias} />

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <h2 className="border-b border-slate-200 px-5 py-3 text-sm font-medium text-slate-700">Por tipo</h2>
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-2 text-left font-medium">Tipo</th>
                    <th className="px-5 py-2 text-right font-medium">Mensagens</th>
                    <th className="px-5 py-2 text-right font-medium">Entregues</th>
                    <th className="px-5 py-2 text-right font-medium">Lidas</th>
                    <th className="px-5 py-2 text-right font-medium">Falhas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums text-slate-700">
                  {d.porTipo.map((p) => (
                    <tr key={p.tipo}>
                      <td className="px-5 py-2.5">{p.tipo === 'utility' ? 'Utility' : 'Marketing'}</td>
                      <td className="px-5 py-2.5 text-right">{formatarNumero(p.mensagens)}</td>
                      <td className="px-5 py-2.5 text-right">{porcentagem(p.entregues, p.mensagens)}</td>
                      <td className="px-5 py-2.5 text-right">{porcentagem(p.lidos, p.mensagens)}</td>
                      <td className="px-5 py-2.5 text-right">{formatarNumero(p.falhas)}</td>
                    </tr>
                  ))}
                  {d.porTipo.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-500">Nenhum envio no período.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-medium text-slate-700">Cobertura da base</h2>
              <p className="mt-1 text-xs text-slate-500">Pacientes com telefone que já receberam alguma mensagem por este painel, desde o início.</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-marca-escuro">{porcentagem(d.base.jaContatados, d.base.comTelefone)}</span>
                <span className="text-sm text-slate-500">
                  {formatarNumero(d.base.jaContatados)} de {formatarNumero(d.base.comTelefone)}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-marca-turquesa"
                  style={{ width: `${Math.min(100, (d.base.jaContatados / Math.max(1, d.base.comTelefone)) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Numero({ nome, valor, detalhe, alerta = false }: { nome: string; valor: string; detalhe: string; alerta?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{nome}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${alerta ? 'text-red-700' : 'text-marca-escuro'}`}>{valor}</div>
      <div className="text-xs text-slate-500">{detalhe}</div>
    </div>
  )
}
