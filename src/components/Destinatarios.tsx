import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listarDestinatarios, type Destinatario, type FiltroDestinatario } from '../lib/campanhas'
import { formatarData, formatarDataHora, formatarNumero, formatarTelefone } from '../lib/formato'

const FILTROS: { valor: FiltroDestinatario; nome: string }[] = [
  { valor: 'TODOS', nome: 'Todos' },
  { valor: 'LERAM', nome: 'Leram' },
  { valor: 'CLICARAM', nome: 'Clicaram' },
  { valor: 'CONVERTERAM', nome: 'Converteram' },
  { valor: 'CONVERTERAM_MEDPREV', nome: 'Pela Medprev' },
  { valor: 'NAO_LERAM', nome: 'Não leram' },
  { valor: 'FALHARAM', nome: 'Falharam' },
]

const STATUS: Record<Destinatario['status'], { nome: string; classe: string }> = {
  pendente: { nome: 'Na fila', classe: 'bg-slate-100 text-slate-600' },
  enviando: { nome: 'Enviando', classe: 'bg-slate-100 text-slate-600' },
  enviado: { nome: 'Enviada', classe: 'bg-slate-100 text-slate-700' },
  entregue: { nome: 'Entregue', classe: 'bg-marca-claro text-marca-escuro' },
  lido: { nome: 'Lida', classe: 'bg-marca-escuro text-white' },
  falhou: { nome: 'Falhou', classe: 'bg-red-100 text-red-800' },
}

/** Quem recebeu a campanha, com leitura e clique de cada um. */
export function Destinatarios({ campanhaId, versao }: { campanhaId: number; versao: string }) {
  const [filtro, setFiltro] = useState<FiltroDestinatario>('TODOS')
  const [pagina, setPagina] = useState(0)
  const lista = useQuery({
    // "versao" muda quando os numeros da campanha mudam: ai a lista busca de novo
    queryKey: ['destinatarios', campanhaId, filtro, pagina, versao],
    queryFn: () => listarDestinatarios(campanhaId, filtro, pagina),
    placeholderData: keepPreviousData,
  })
  const total = lista.data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / 50))

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-medium text-slate-700">Destinatários</h2>
        <div className="flex flex-wrap gap-1 text-sm" role="group" aria-label="Filtrar destinatários">
          {FILTROS.map((f) => (
            <button key={f.valor} aria-pressed={filtro === f.valor}
              onClick={() => { setFiltro(f.valor); setPagina(0) }}
              className={`rounded-md px-3 py-1 font-medium ${filtro === f.valor ? 'bg-marca-petroleo text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {f.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full text-left text-sm ${lista.isPlaceholderData ? 'opacity-60' : ''}`}>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-2.5">Paciente</th>
              <th className="px-5 py-2.5">Telefone</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5">Entregue</th>
              <th className="px-5 py-2.5">Lida</th>
              <th className="px-5 py-2.5">Clicou</th>
              <th className="px-5 py-2.5">Consultou</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lista.data?.itens.map((d) => (
              <tr key={d.envioId}>
                <td className="px-5 py-2.5 font-medium text-slate-800">{d.nome ?? '—'}</td>
                <td className="whitespace-nowrap px-5 py-2.5 text-slate-700">{formatarTelefone(d.telefone)}</td>
                <td className="px-5 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[d.status].classe}`} title={d.erro ?? undefined}>
                    {STATUS[d.status].nome}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-2.5 text-slate-700">{formatarDataHora(d.entregueEm)}</td>
                <td className="whitespace-nowrap px-5 py-2.5 text-slate-700">{formatarDataHora(d.lidoEm)}</td>
                <td className="px-5 py-2.5">
                  {d.botao ? (
                    <div>
                      <span className="rounded bg-marca-claro/60 px-1.5 py-0.5 text-xs font-medium text-marca-escuro">{d.botao}</span>
                      <div className="mt-0.5 text-xs text-slate-500">{formatarDataHora(d.clicouEm)}</div>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-5 py-2.5">
                  {d.consultouEm ? (
                    <div>
                      <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${d.viaMedprev ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {formatarData(d.consultouEm)}
                      </span>
                      <div className="mt-0.5 text-xs text-slate-500">{d.consultouOrigem}</div>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {lista.data && lista.data.itens.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">Ninguém neste recorte.</td></tr>
            )}
            {lista.isPending && (
              <tr><td colSpan={7} className="px-5 py-3"><div className="h-4 animate-pulse rounded bg-slate-100" /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 50 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
          <span>{formatarNumero(total)} pacientes · página {pagina + 1} de {totalPaginas}</span>
          <div className="flex gap-2">
            <button disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40">Anterior</button>
            <button disabled={pagina + 1 >= totalPaginas} onClick={() => setPagina((p) => p + 1)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40">Próxima</button>
          </div>
        </div>
      )}
    </div>
  )
}
