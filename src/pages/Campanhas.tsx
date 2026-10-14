import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { ProgressoCampanha, StatusCampanha } from '../components/ProgressoCampanha'
import { INTERVALO_ATUALIZACAO_MS, emAndamento, listarCampanhas } from '../lib/campanhas'
import { formatarDataHora, formatarNumero, porcentagem } from '../lib/formato'

export default function Campanhas() {
  const navigate = useNavigate()
  const campanhas = useQuery({
    queryKey: ['campanhas'],
    queryFn: listarCampanhas,
    staleTime: 0,
    // Atualiza sozinha so enquanto alguma campanha ainda esta enviando
    refetchInterval: (q) => (q.state.data?.some(emAndamento) ? INTERVALO_ATUALIZACAO_MS : false),
  })

  const lista = campanhas.data ?? []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-marca-escuro">Campanhas</h1>
        <p className="text-sm text-slate-500">As 100 mais recentes</p>
      </div>

      {campanhas.isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{campanhas.error.message}</div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Campanha</th>
              <th className="px-4 py-3">Criada</th>
              <th className="px-4 py-3 text-right">Mensagens</th>
              <th className="w-56 px-4 py-3">Andamento</th>
              <th className="px-4 py-3 text-right">Entregues</th>
              <th className="px-4 py-3 text-right">Lidas</th>
              <th className="px-4 py-3 text-right">Falhas</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campanhas.isPending &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-slate-100" /></td></tr>
              ))}
            {!campanhas.isPending && lista.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  Nenhuma campanha ainda. Selecione pacientes na <Link to="/" className="text-marca-petroleo hover:underline">lista</Link> para criar a primeira.
                </td>
              </tr>
            )}
            {lista.map((c) => (
              <tr key={c.id} onClick={() => navigate(`/campanhas/${c.id}`)} className="cursor-pointer hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{c.nome}</div>
                  <div className="text-xs text-slate-500">
                    <span className="font-mono">{c.template}</span> · {c.tipo === 'utility' ? 'Utility' : 'Marketing'}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                  {formatarDataHora(c.criadoEm)}
                  <div className="text-xs text-slate-500">{c.criadoPor}</div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatarNumero(c.total)}</td>
                <td className="px-4 py-3"><ProgressoCampanha campanha={c} /></td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">{porcentagem(c.entregues, c.total)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">{porcentagem(c.lidos, c.total)}</td>
                <td className={`px-4 py-3 text-right tabular-nums ${c.falhas > 0 ? 'text-red-700' : 'text-slate-700'}`}>
                  {formatarNumero(c.falhas)}
                </td>
                <td className="px-4 py-3"><StatusCampanha campanha={c} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
