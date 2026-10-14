import { formatarNumero, porcentagem } from '../lib/formato'

export interface ItemBarra {
  rotulo: string
  valor: number
}

/**
 * Ranking ou distribuicao em barras horizontais de uma cor so.
 * O numero fica escrito ao lado (texto em tinta, nunca na cor da barra).
 */
export function BarrasHorizontais({
  titulo,
  itens,
  total,
  nota,
}: {
  titulo: string
  itens: ItemBarra[]
  total?: number // quando informado, mostra a % de cada item sobre ele
  nota?: string
}) {
  const maximo = Math.max(1, ...itens.map((i) => i.valor))
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-medium text-slate-700">{titulo}</h2>
      {itens.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">Sem dados.</p>
      ) : (
        <ul className="space-y-2.5">
          {itens.map((i) => (
            <li key={i.rotulo} title={`${i.rotulo}: ${formatarNumero(i.valor)}`}>
              <div className="mb-1 flex justify-between gap-3 text-sm">
                <span className="truncate text-slate-700">{i.rotulo}</span>
                <span className="shrink-0 tabular-nums text-slate-800">
                  {formatarNumero(i.valor)}
                  {total !== undefined && <span className="ml-1.5 text-xs text-slate-500">{porcentagem(i.valor, total)}</span>}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-marca-turquesa" style={{ width: `${(i.valor / maximo) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
      {nota && <p className="mt-4 text-xs text-slate-500">{nota}</p>}
    </div>
  )
}
