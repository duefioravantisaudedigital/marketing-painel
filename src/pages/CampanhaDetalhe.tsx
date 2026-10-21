import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { ProgressoCampanha, StatusCampanha } from '../components/ProgressoCampanha'
import { BarrasHorizontais } from '../components/BarrasHorizontais'
import { Destinatarios } from '../components/Destinatarios'
import { INTERVALO_ATUALIZACAO_MS, buscarCampanha, emAndamento, janelaAberta, listarBotoes, listarConversoes, listarFalhas } from '../lib/campanhas'
import { formatarData, formatarDataHora, formatarNumero, porcentagem } from '../lib/formato'

export default function CampanhaDetalhe() {
  const id = Number(useParams().id)

  const campanha = useQuery({
    queryKey: ['campanha', id],
    queryFn: () => buscarCampanha(id),
    enabled: Number.isInteger(id) && id > 0,
    staleTime: 0,
    refetchInterval: (q) => (q.state.data && emAndamento(q.state.data) ? INTERVALO_ATUALIZACAO_MS : false),
  })
  const c = campanha.data

  // Motivos das falhas: so busca quando existe falha, e de novo quando o numero muda
  const falhas = useQuery({
    queryKey: ['campanha', id, 'falhas', c?.falhas],
    queryFn: () => listarFalhas(id),
    enabled: !!c && c.falhas > 0,
  })

  // Cliques por botao: busca de novo quando o total de cliques muda
  const botoes = useQuery({
    queryKey: ['campanha', id, 'botoes', c?.cliques],
    queryFn: () => listarBotoes(id),
    enabled: !!c && c.cliques > 0,
  })

  const conversoes = useQuery({
    queryKey: ['campanha', id, 'conversoes', c?.conversoes],
    queryFn: () => listarConversoes(id),
    enabled: !!c && c.conversoes > 0,
  })

  if (campanha.isError) {
    return (
      <div className="space-y-3">
        <Link to="/campanhas" className="text-sm text-marca-petroleo hover:underline">← Campanhas</Link>
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{campanha.error.message}</div>
      </div>
    )
  }

  if (!c) return <div className="h-40 animate-pulse rounded-lg bg-slate-100" />

  const aberta = janelaAberta(c)
  const numeros = [
    { nome: 'Mensagens', valor: c.total, extra: null },
    { nome: 'Entregues', valor: c.entregues, extra: porcentagem(c.entregues, c.total) },
    { nome: 'Lidas', valor: c.lidos, extra: porcentagem(c.lidos, c.total) },
    { nome: 'Clicaram', valor: c.cliques, extra: porcentagem(c.cliques, c.total) },
    {
      nome: 'Converteram',
      valor: c.conversoes,
      extra: `${porcentagem(c.conversoes, c.enviados)}${aberta && c.janelaAte ? ` · até ${formatarData(c.janelaAte)}` : ''}`,
    },
    { nome: c.pendentes > 0 ? 'Na fila' : 'Falhas', valor: c.pendentes > 0 ? c.pendentes : c.falhas,
      extra: c.pendentes > 0 ? null : porcentagem(c.falhas, c.total) },
  ]
  // Muda quando qualquer numero muda: a lista de destinatarios usa para saber quando atualizar
  const versao = `${c.entregues}-${c.lidos}-${c.cliques}-${c.conversoes}-${c.falhas}-${c.pendentes}`

  return (
    <div className="space-y-5">
      <div>
        <Link to="/campanhas" className="text-sm text-marca-petroleo hover:underline">← Campanhas</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-marca-escuro">{c.nome}</h1>
          <StatusCampanha campanha={c} />
        </div>
        <p className="text-sm text-slate-500">
          <button onClick={() => campanha.refetch()} disabled={campanha.isFetching}
            className="float-right rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            {campanha.isFetching ? 'Atualizando…' : 'Atualizar'}
          </button>
          <span className="font-mono">{c.template}</span> · {c.tipo === 'utility' ? 'Utility' : 'Marketing'} · criada em{' '}
          {formatarDataHora(c.criadoEm)} por {c.criadoPor}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {numeros.map((n) => (
          <div key={n.nome} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">{n.nome}</div>
            <div className={`mt-1 text-2xl font-semibold ${n.nome === 'Falhas' && n.valor > 0 ? 'text-red-700' : n.nome === 'Converteram' && n.valor > 0 ? 'text-emerald-700' : 'text-marca-escuro'}`}>
              {formatarNumero(n.valor)}
            </div>
            {n.extra && <div className="text-xs text-slate-500">{n.extra}</div>}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <ProgressoCampanha campanha={c} alta />
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
          <Legenda cor="bg-marca-escuro" nome="Lidas" />
          <Legenda cor="bg-marca-turquesa" nome="Entregues" />
          <Legenda cor="bg-marca-claro" nome="Enviadas" />
          <Legenda cor="bg-slate-200" nome="Na fila" />
          <Legenda cor="bg-red-400" nome="Falhas" />
        </div>
        {emAndamento(c) ? (
          <p className="mt-3 text-xs text-slate-500">Enviando aos poucos. Esta tela atualiza sozinha a cada 15 segundos.</p>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Leituras e cliques continuam chegando depois do envio: use "Atualizar". Quem desligou a confirmação de leitura
            no WhatsApp só aparece como lida se clicar em um botão.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-slate-700">Conversão em consulta</h2>
        <p className="mt-1 text-sm text-slate-600">
          Conta quem passou em consulta na plataforma em <strong>até 30 dias</strong> depois de receber a mensagem.
          O mesmo paciente pode contar em mais de uma campanha. O canal mostra por onde o agendamento chegou:
          base própria ou Medprev, no Atestta, ou a médica, no medsync. As consultas chegam pelo sync das 20h, então
          uma consulta de hoje aparece amanhã.
          {aberta && c.janelaAte && <> A janela desta campanha fica aberta até <strong>{formatarData(c.janelaAte)}</strong>.</>}
        </p>
        {c.conversoes > 0 && (
          <div className="mt-4">
            <BarrasHorizontais titulo="Canal do agendamento" total={c.conversoes}
              itens={(conversoes.data ?? []).map((o) => ({ rotulo: o.botao, valor: o.pacientes }))} />
          </div>
        )}
      </div>

      {c.cliques > 0 && (
        <BarrasHorizontais titulo="Botões clicados" total={c.total}
          itens={(botoes.data ?? []).map((b) => ({ rotulo: b.botao, valor: b.pacientes }))}
          nota="Pacientes que clicaram em cada botão. Quem clicou também conta como lida." />
      )}

      <Destinatarios campanhaId={id} versao={versao} />

      {c.falhas > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-200 px-5 py-3 text-sm font-medium text-slate-700">Motivos das falhas</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {falhas.data?.map((f) => (
              <li key={f.motivo} className="flex justify-between gap-4 px-5 py-3">
                <span className="text-slate-700">{f.motivo}</span>
                <span className="shrink-0 tabular-nums text-red-700">{formatarNumero(f.quantidade)}</span>
              </li>
            ))}
            {falhas.isPending && <li className="px-5 py-3 text-slate-400">Carregando…</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

function Legenda({ cor, nome }: { cor: string; nome: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${cor}`} /> {nome}
    </span>
  )
}
