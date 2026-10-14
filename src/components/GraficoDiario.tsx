import { useState } from 'react'
import type { Dashboard } from '../lib/dashboard'
import { diasDoPeriodo } from '../lib/dashboard'
import { formatarNumero, porcentagem } from '../lib/formato'

type Ponto = Dashboard['porDia'][number]

const ALTURA = 180

// "2026-10-14" -> "14/10"
const diaMes = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

/**
 * Mensagens por dia: uma serie so, barras finas com topo arredondado e 2px de folga.
 * Passar o mouse mostra o dia com entregues, lidas e falhas.
 */
export function GraficoDiario({ dados, dias }: { dados: Ponto[]; dias: number }) {
  const [ativo, setAtivo] = useState<string | null>(null)
  const [tabela, setTabela] = useState(false)

  const porDia = new Map(dados.map((d) => [d.dia, d]))
  const serie: Ponto[] = diasDoPeriodo(dias).map(
    (dia) => porDia.get(dia) ?? { dia, mensagens: 0, entregues: 0, lidos: 0, falhas: 0 },
  )
  const maximo = Math.max(1, ...serie.map((p) => p.mensagens))
  // Rotulos do eixo x espacados para nao encavalar
  const passo = dias <= 7 ? 1 : dias <= 30 ? 5 : 15
  const pontoAtivo = serie.find((p) => p.dia === ativo)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-slate-700">Mensagens por dia</h2>
        <button onClick={() => setTabela((t) => !t)} className="text-xs font-medium text-marca-petroleo hover:underline">
          {tabela ? 'Ver gráfico' : 'Ver tabela'}
        </button>
      </div>

      {tabela ? (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-xs text-slate-500">
              <tr>
                <th className="py-1 text-left font-medium">Dia</th>
                <th className="py-1 text-right font-medium">Mensagens</th>
                <th className="py-1 text-right font-medium">Entregues</th>
                <th className="py-1 text-right font-medium">Lidas</th>
                <th className="py-1 text-right font-medium">Falhas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums text-slate-700">
              {serie.filter((p) => p.mensagens > 0).reverse().map((p) => (
                <tr key={p.dia}>
                  <td className="py-1.5">{diaMes(p.dia)}</td>
                  <td className="py-1.5 text-right">{formatarNumero(p.mensagens)}</td>
                  <td className="py-1.5 text-right">{formatarNumero(p.entregues)}</td>
                  <td className="py-1.5 text-right">{formatarNumero(p.lidos)}</td>
                  <td className="py-1.5 text-right">{formatarNumero(p.falhas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {serie.every((p) => p.mensagens === 0) && <p className="py-6 text-center text-sm text-slate-500">Nenhum envio no período.</p>}
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
              {serie.map((p) => (
                // Area de passar o mouse e a coluna inteira, maior que a barra
                <div key={p.dia} className="flex h-full min-w-0 flex-1 items-end justify-center" onMouseEnter={() => setAtivo(p.dia)}>
                  <div
                    className={`w-full max-w-7 rounded-t ${ativo === p.dia ? 'bg-marca-escuro' : 'bg-marca-petroleo'}`}
                    style={{ height: p.mensagens ? `${Math.max(2, (p.mensagens / maximo) * (ALTURA - 8))}px` : 0 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex h-5" style={{ gap: 2 }}>
              {serie.map((p, i) => (
                <div key={p.dia} className="relative min-w-0 flex-1">
                  {(i % passo === 0 || i === serie.length - 1) && (
                    <span className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-400">
                      {diaMes(p.dia)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {pontoAtivo && (
              <div className="pointer-events-none absolute right-0 top-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
                <div className="mb-1 font-medium text-slate-800">{diaMes(pontoAtivo.dia)}</div>
                <Linha nome="Mensagens" valor={formatarNumero(pontoAtivo.mensagens)} />
                <Linha nome="Entregues" valor={`${formatarNumero(pontoAtivo.entregues)} (${porcentagem(pontoAtivo.entregues, pontoAtivo.mensagens)})`} />
                <Linha nome="Lidas" valor={`${formatarNumero(pontoAtivo.lidos)} (${porcentagem(pontoAtivo.lidos, pontoAtivo.mensagens)})`} />
                <Linha nome="Falhas" valor={formatarNumero(pontoAtivo.falhas)} />
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
