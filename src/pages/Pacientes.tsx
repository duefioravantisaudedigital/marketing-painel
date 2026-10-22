import { useState, type FormEvent } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  FILTROS_INICIAIS,
  TAMANHO_PAGINA,
  listarOrigens,
  exportarPacientes,
  listarPacientes,
  type Filtros,
  type Origem,
} from '../lib/pacientes'
import { Link } from 'react-router'
import { formatarData, formatarNumero, formatarTelefone } from '../lib/formato'
import { MAX_SELECAO, useSelecao } from '../lib/selecao'

// Atestta e medsync separados; em cada grupo, o total ("todos") vem primeiro e os medicos depois
function agruparOrigens(origens: Origem[]) {
  const peso = (o: string) => (o === 'Atestta' || o === 'medsync (todos)' ? 0 : o === 'medsync (base antiga)' ? 1 : 2)
  const ordenar = (lista: Origem[]) =>
    [...lista].sort((a, b) => peso(a.origem) - peso(b.origem) || a.origem.localeCompare(b.origem, 'pt-BR'))
  const atestta = origens.filter((o) => o.origem.startsWith('Atestta'))
  const medsync = origens.filter((o) => !o.origem.startsWith('Atestta'))
  return [
    { grupo: 'Atestta', itens: ordenar(atestta) },
    { grupo: 'medsync', itens: ordenar(medsync) },
  ].filter((g) => g.itens.length > 0)
}

const campo =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-marca-turquesa focus:outline-none focus:ring-2 focus:ring-marca-turquesa/30'
const rotulo = 'mb-1 block text-xs font-medium text-slate-600'


export default function Pacientes() {
  // "rascunho" e o que esta no formulario; "filtros" e o que foi aplicado.
  // So vai a API ao clicar em Filtrar, nao a cada tecla (poupa o banco).
  const [rascunho, setRascunho] = useState<Filtros>(FILTROS_INICIAIS)
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS)
  const [pagina, setPagina] = useState(0)
  const { selecionados, alternar, adicionar, remover, limpar } = useSelecao()

  const origens = useQuery({
    queryKey: ['origens'],
    queryFn: listarOrigens,
    staleTime: 60 * 60 * 1000, // so muda no sync diario
  })

  const [exportando, setExportando] = useState(false)
  const [erroExportacao, setErroExportacao] = useState<string | null>(null)

  async function exportar() {
    setExportando(true)
    setErroExportacao(null)
    try {
      await exportarPacientes(filtros)
    } catch (e) {
      setErroExportacao(e instanceof Error ? e.message : 'Não foi possível exportar.')
    } finally {
      setExportando(false)
    }
  }

  const lista = useQuery({
    queryKey: ['pacientes', filtros, pagina],
    queryFn: () => listarPacientes(filtros, pagina),
    placeholderData: keepPreviousData,
  })

  const total = lista.data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / TAMANHO_PAGINA))
  const itens = lista.data?.itens ?? []

  function alterar<K extends keyof Filtros>(chave: K, valor: Filtros[K]) {
    setRascunho((r) => ({ ...r, [chave]: valor }))
  }

  function aplicar(e: FormEvent) {
    e.preventDefault()
    setFiltros(rascunho)
    setPagina(0)
  }

  function limparFiltros() {
    setRascunho(FILTROS_INICIAIS)
    setFiltros(FILTROS_INICIAIS)
    setPagina(0)
  }

  const todosDaPagina = itens.length > 0 && itens.every((p) => selecionados.has(p.id))

  function alternarPagina() {
    if (todosDaPagina) remover(itens.map((p) => p.id))
    else adicionar(itens)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-marca-escuro">Pacientes</h1>
          <p className="text-sm text-slate-500">
            {lista.data ? `${formatarNumero(total)} pacientes com telefone neste filtro` : 'Carregando…'}
          </p>
        </div>
        <div className="text-right">
          <button onClick={exportar} disabled={exportando || total === 0}
            title="Baixa todos os pacientes do filtro aplicado, com origem, como conheceu, datas e histórico de envio"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            {exportando ? 'Exportando…' : `Exportar CSV (${formatarNumero(total)})`}
          </button>
          {erroExportacao && <p className="mt-1 text-xs text-red-700">{erroExportacao}</p>}
        </div>
      </div>

      {/* Filtros */}
      <form onSubmit={aplicar} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className={rotulo} htmlFor="busca">Buscar por nome ou telefone</label>
            <input
              id="busca"
              className={campo}
              value={rascunho.busca}
              maxLength={100}
              placeholder="Ex.: Maria ou 99999"
              onChange={(e) => alterar('busca', e.target.value)}
            />
          </div>
          <div>
            <label className={rotulo} htmlFor="origem">Origem</label>
            <select id="origem" className={campo} value={rascunho.origem} onChange={(e) => alterar('origem', e.target.value)}>
              <option value="">Todas</option>
              {agruparOrigens(origens.data ?? []).map((g) => (
                <optgroup key={g.grupo} label={g.grupo}>
                  {g.itens.map((o) => (
                    <option key={o.origem} value={o.origem}>
                      {o.origem} ({formatarNumero(o.pacientes)})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className={rotulo} htmlFor="cidade">Cidade</label>
            <input id="cidade" className={campo} value={rascunho.cidade} maxLength={100} onChange={(e) => alterar('cidade', e.target.value)} />
          </div>
          <div>
            <label className={rotulo} htmlFor="consultou">Consultou nos últimos (dias)</label>
            <input id="consultou" type="number" min={1} max={3650} className={campo} value={rascunho.consultouUltimosDias}
              onChange={(e) => alterar('consultouUltimosDias', e.target.value)} />
          </div>
          <div>
            <label className={rotulo} htmlFor="sem">Sem consulta há mais de (dias)</label>
            <input id="sem" type="number" min={1} max={3650} className={campo} value={rascunho.semConsultaUltimosDias}
              onChange={(e) => alterar('semConsultaUltimosDias', e.target.value)} />
          </div>
          <div>
            <label className={rotulo} htmlFor="passagens">Mínimo de passagens</label>
            <input id="passagens" type="number" min={1} max={1000} className={campo} value={rascunho.minPassagens}
              onChange={(e) => alterar('minPassagens', e.target.value)} />
          </div>
          <div>
            <label className={rotulo} htmlFor="historico">Já recebeu mensagem</label>
            <select id="historico" className={campo} value={rascunho.historicoEnvio}
              onChange={(e) => alterar('historicoEnvio', e.target.value as Filtros['historicoEnvio'])}>
              <option value="TODOS">Tanto faz</option>
              <option value="NUNCA">Nunca recebeu</option>
              <option value="MARKETING">Já recebeu marketing</option>
              <option value="UTILITY">Já recebeu utility</option>
            </select>
          </div>
          <div>
            <label className={rotulo} htmlFor="jornada">Jornada no Atestta</label>
            <select id="jornada" className={campo} value={rascunho.jornada}
              onChange={(e) => alterar('jornada', e.target.value as Filtros['jornada'])}>
              <option value="TODAS">Tanto faz</option>
              <option value="MEDPREV_VOLTOU">Veio pela Medprev e voltou direto</option>
              <option value="SO_MEDPREV">Só Medprev (nunca veio direto)</option>
            </select>
          </div>
          <div>
            <label className={rotulo} htmlFor="ordenacao">Ordenar por</label>
            <select id="ordenacao" className={campo} value={rascunho.ordenacao}
              onChange={(e) => alterar('ordenacao', e.target.value as Filtros['ordenacao'])}>
              <option value="ULTIMA_CONSULTA">Última consulta</option>
              <option value="NOME">Nome</option>
              <option value="PASSAGENS">Passagens</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={limparFiltros}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Limpar filtros
          </button>
          <button type="submit"
            className="rounded-md bg-marca-petroleo px-4 py-2 text-sm font-semibold text-white hover:bg-marca-escuro">
            Filtrar
          </button>
        </div>
      </form>

      {/* Barra de selecao */}
      {selecionados.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-marca-turquesa/40 bg-marca-claro/50 px-4 py-3 text-sm">
          <span className="text-marca-escuro">
            <strong>{formatarNumero(selecionados.size)}</strong> selecionado(s)
            {selecionados.size >= MAX_SELECAO && ' — limite de 1.000 por campanha'}
          </span>
          <div className="flex items-center gap-4">
            <button onClick={limpar} className="font-medium text-marca-petroleo hover:underline">
              Limpar seleção
            </button>
            <Link to="/campanhas/nova"
              className="rounded-md bg-marca-turquesa px-4 py-2 font-semibold text-white hover:bg-marca-petroleo">
              Criar campanha
            </Link>
          </div>
        </div>
      )}

      {lista.isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {lista.error.message}
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className={`w-full text-left text-sm ${lista.isPlaceholderData ? 'opacity-60' : ''}`}>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 px-3 py-3">
                <input type="checkbox" aria-label="Selecionar todos da página" checked={todosDaPagina}
                  onChange={alternarPagina} className="accent-marca-turquesa" />
              </th>
              <th className="px-3 py-3">Paciente</th>
              <th className="px-3 py-3">Telefone</th>
              <th className="px-3 py-3">Cidade</th>
              <th className="px-3 py-3 text-right">Passagens</th>
              <th className="px-3 py-3">Última consulta</th>
              <th className="px-3 py-3">Último marketing</th>
              <th className="px-3 py-3">Último utility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lista.isPending &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-3 py-3">
                    <div className="h-4 animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ))}
            {!lista.isPending && itens.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-slate-500">
                  Nenhum paciente encontrado com esses filtros.
                </td>
              </tr>
            )}
            {itens.map((p) => {
              const marcado = selecionados.has(p.id)
              return (
                <tr key={p.id} onClick={() => alternar(p)}
                  className={`cursor-pointer ${marcado ? 'bg-marca-claro/40' : 'hover:bg-slate-50'}`}>
                  <td className="px-3 py-2.5">
                    <input type="checkbox" checked={marcado} readOnly aria-label={`Selecionar ${p.nome}`}
                      className="pointer-events-none accent-marca-turquesa" />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-slate-800">{p.nome}</div>
                    {p.email && <div className="text-xs text-slate-500">{p.email}</div>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">{formatarTelefone(p.telefone)}</td>
                  <td className="px-3 py-2.5 text-slate-700">
                    {p.cidade ? `${p.cidade}${p.estado ? `/${p.estado}` : ''}` : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{p.passagens}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                    {formatarData(p.ultimaConsulta, !p.historicoCompleto)}
                    {!p.historicoCompleto && (
                      <span title="Paciente da carga antiga: só temos o resumo, sem as consultas uma a uma"
                        className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                        base antiga
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">{formatarData(p.ultimoMarketing)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">{formatarData(p.ultimoUtility)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginacao */}
      {total > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Página {pagina + 1} de {formatarNumero(totalPaginas)}
          </span>
          <div className="flex gap-2">
            <button disabled={pagina === 0 || lista.isFetching} onClick={() => setPagina((p) => p - 1)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40">
              Anterior
            </button>
            <button disabled={pagina + 1 >= totalPaginas || lista.isFetching} onClick={() => setPagina((p) => p + 1)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40">
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
