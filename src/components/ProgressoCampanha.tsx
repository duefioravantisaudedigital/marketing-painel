import type { Campanha } from '../lib/campanhas'

/**
 * Barra empilhada: lidas, entregues (sem ler), enviadas (sem confirmar entrega), na fila e falhas.
 * Os numeros da API sao acumulados (entregues inclui lidas), entao aqui separa cada faixa.
 */
export function ProgressoCampanha({ campanha: c, alta = false }: { campanha: Campanha; alta?: boolean }) {
  const faixas = [
    { valor: c.lidos, cor: 'bg-marca-escuro', nome: 'Lidas' },
    { valor: c.entregues - c.lidos, cor: 'bg-marca-turquesa', nome: 'Entregues' },
    { valor: c.enviados - c.entregues, cor: 'bg-marca-claro', nome: 'Enviadas' },
    { valor: c.pendentes, cor: 'bg-slate-200', nome: 'Na fila' },
    { valor: c.falhas, cor: 'bg-red-400', nome: 'Falhas' },
  ]
  return (
    <div className={`flex w-full overflow-hidden rounded-full bg-slate-100 ${alta ? 'h-3' : 'h-2'}`}>
      {c.total > 0 &&
        faixas
          .filter((f) => f.valor > 0)
          .map((f) => (
            <div key={f.nome} className={f.cor} style={{ width: `${(f.valor / c.total) * 100}%` }}
              title={`${f.nome}: ${f.valor}`} />
          ))}
    </div>
  )
}

export function StatusCampanha({ campanha: c }: { campanha: Campanha }) {
  if (c.pendentes > 0)
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Enviando</span>
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Concluída</span>
}
