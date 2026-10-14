import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { BarrasVerticais } from './BarrasVerticais'
import { PERIODOS, buscarResumoEnvios, diasDoPeriodo } from '../lib/dashboard'
import { formatarNumero, porcentagem } from '../lib/formato'

// "2026-10-14" -> "14/10"
const diaMes = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

/** Numeros dos envios no periodo: fica no topo da aba Campanhas. */
export function ResumoEnvios() {
  const [dias, setDias] = useState<number>(30)
  const resumo = useQuery({
    queryKey: ['resumo-envios', dias],
    queryFn: () => buscarResumoEnvios(dias),
    placeholderData: keepPreviousData,
  })
  const d = resumo.data
  const t = d?.total

  const porDia = new Map(d?.porDia.map((p) => [p.dia, p]))
  const pontos = diasDoPeriodo(dias).map((dia) => {
    const p = porDia.get(dia)
    const mensagens = p?.mensagens ?? 0
    return {
      chave: dia,
      rotulo: diaMes(dia),
      titulo: diaMes(dia),
      valor: mensagens,
      detalhes: [
        { nome: 'Entregues', valor: `${formatarNumero(p?.entregues ?? 0)} (${porcentagem(p?.entregues ?? 0, mensagens)})` },
        { nome: 'Lidas', valor: `${formatarNumero(p?.lidos ?? 0)} (${porcentagem(p?.lidos ?? 0, mensagens)})` },
        { nome: 'Falhas', valor: formatarNumero(p?.falhas ?? 0) },
      ],
    }
  })

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-slate-500">Envios nos últimos {dias} dias</p>
        <div className="flex rounded-md border border-slate-300 bg-white p-0.5 text-sm" role="group" aria-label="Período">
          {PERIODOS.map((p) => (
            <button key={p} onClick={() => setDias(p)} aria-pressed={dias === p}
              className={`rounded px-3 py-1.5 font-medium ${dias === p ? 'bg-marca-petroleo text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {p} dias
            </button>
          ))}
        </div>
      </div>

      {resumo.isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{resumo.error.message}</div>
      )}

      {!d || !t ? (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-100" />)}
        </div>
      ) : (
        <div className={`space-y-4 ${resumo.isPlaceholderData ? 'opacity-60' : ''}`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Numero nome="Mensagens" valor={formatarNumero(t.mensagens)} detalhe={`${formatarNumero(d.campanhas)} ${d.campanhas === 1 ? "campanha" : "campanhas"}`} />
            <Numero nome="Entregues" valor={porcentagem(t.entregues, t.mensagens)} detalhe={formatarNumero(t.entregues)} />
            <Numero nome="Lidas" valor={porcentagem(t.lidos, t.mensagens)} detalhe={formatarNumero(t.lidos)} />
            <Numero nome="Falhas" valor={formatarNumero(t.falhas)} detalhe={porcentagem(t.falhas, t.mensagens)} alerta={t.falhas > 0} />
            <Numero nome="Pacientes alcançados" valor={formatarNumero(t.pacientes)} detalhe="no período" />
            <Numero nome="Cobertura da base" valor={porcentagem(d.base.jaContatados, d.base.comTelefone)}
              detalhe={`${formatarNumero(d.base.jaContatados)} de ${formatarNumero(d.base.comTelefone)} já receberam`} />
          </div>
          <BarrasVerticais titulo="Mensagens por dia" pontos={pontos}
            passoRotulo={dias <= 7 ? 1 : dias <= 30 ? 5 : 15} vazio="Nenhum envio no período." />
        </div>
      )}
    </section>
  )
}

export function Numero({ nome, valor, detalhe, alerta = false }: { nome: string; valor: string; detalhe: string; alerta?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{nome}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${alerta ? 'text-red-700' : 'text-marca-escuro'}`}>{valor}</div>
      <div className="text-xs text-slate-500">{detalhe}</div>
    </div>
  )
}
