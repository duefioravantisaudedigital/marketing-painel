import { useState } from 'react'
import { formatarNumero } from '../lib/formato'

export interface PontoBarra {
  chave: string
  rotulo: string // rotulo curto do eixo x
  titulo: string // titulo do tooltip e da linha da tabela
  valor: number
  detalhes?: { nome: string; valor: string }[]
}

const ALTURA = 180

/**
 * Barras verticais de uma serie so: barras finas, topo arredondado, 2px de folga,
 * tooltip ao passar o mouse e opcao de ver os mesmos numeros em tabela.
 */
export function BarrasVerticais({
  titulo,
  pontos,
  passoRotulo = 1,
  vazio = 'Sem dados no período.',
}: {
  titulo: string
  pontos: PontoBarra[]
  passoRotulo?: number
  vazio?: string
}) {
  const [ativo, setAtivo] = useState<string | null>(null)
  const [tabela, setTabela] = useState(false)
  const maximo = Math.max(1, ...pontos.map((p) => p.valor))
  const pontoAtivo = pontos.find((p) => p.chave === ativo)
  const colunasExtra = pontos[0]?.detalhes?.map((d) => d.nome) ?? []

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-slate-700">{titulo}</h2>
        <button onClick={() => setTabela((t) => !t)} className="text-xs font-medium text-marca-petroleo hover:underline">
          {tabela ? 'Ver gráfico' : 'Ver tabela'}
        </button>
      </div>

      {tabela ? (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-xs text-slate-500">
              <tr>
                <th className="py-1 text-left font-medium" />
                <th className="py-1 text-right font-medium">Total</th>
                {colunasExtra.map((c) => <th key={c} className="py-1 text-right font-medium">{c}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums text-slate-700">
              {[...pontos].reverse().filter((p) => p.valor > 0).map((p) => (
                <tr key={p.chave}>
                  <td className="py-1.5">{p.titulo}</td>
                  <td className="py-1.5 text-right">{formatarNumero(p.valor)}</td>
                  {p.detalhes?.map((d) => <td key={d.nome} className="py-1.5 text-right">{d.valor}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {pontos.every((p) => p.valor === 0) && <p className="py-6 text-center text-sm text-slate-500">{vazio}</p>}
        </div>
      ) : (
        <div className="flex gap-2">
          {/* Eixo y: so o topo e o zero, grade discreta */}
          <div className="flex flex-col justify-between pb-5 text-right text-[10px] tabular-nums text-slate-400" style={{ height: ALTURA + 20 }}>
            <span>{formatarNumero(maximo)}</span>
            <span>0</span>
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="pointer-events-none absolute inset-x-0 top-1.5 border-t border-dashed border-slate-200" />
            <div className="flex items-end border-b border-slate-300" style={{ height: ALTURA, gap: 2 }}
              onMouseLeave={() => setAtivo(null)}>
              {pontos.map((p) => (
                // A area de passar o mouse e a coluna inteira, maior que a barra
                <div key={p.chave} className="flex h-full min-w-0 flex-1 items-end justify-center" onMouseEnter={() => setAtivo(p.chave)}>
                  <div
                    className={`w-full max-w-7 rounded-t ${ativo === p.chave ? 'bg-marca-escuro' : 'bg-marca-petroleo'}`}
                    style={{ height: p.valor ? `${Math.max(2, (p.valor / maximo) * (ALTURA - 8))}px` : 0 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex h-5" style={{ gap: 2 }}>
              {pontos.map((p, i) => (
                <div key={p.chave} className="relative min-w-0 flex-1">
                  {(i % passoRotulo === 0 || i === pontos.length - 1) && (
                    <span className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-400">
                      {p.rotulo}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {pontoAtivo && (
              <div className="pointer-events-none absolute right-0 top-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
                <div className="mb-1 font-medium text-slate-800">{pontoAtivo.titulo}</div>
                <Linha nome="Total" valor={formatarNumero(pontoAtivo.valor)} />
                {pontoAtivo.detalhes?.map((d) => <Linha key={d.nome} nome={d.nome} valor={d.valor} />)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Linha({ nome, valor }: { nome: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 tabular-nums">
      <span className="text-slate-500">{nome}</span>
      <span className="text-slate-800">{valor}</span>
    </div>
  )
}
