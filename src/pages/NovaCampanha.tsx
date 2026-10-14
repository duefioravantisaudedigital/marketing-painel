import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { ErroApi } from '../lib/api'
import { criarCampanha, listarTemplates, type Campanha, type Template } from '../lib/campanhas'
import { NOME_FONTE, formatarNumero, formatarTelefone } from '../lib/formato'
import { useSelecao } from '../lib/selecao'

const campo =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-marca-turquesa focus:outline-none focus:ring-2 focus:ring-marca-turquesa/30'
const rotulo = 'mb-1 block text-sm font-medium text-slate-700'
const ajuda = 'mt-1 text-xs text-slate-500'

// Mesma regra da API, para avisar antes de enviar
const PADRAO_IMAGEM = /^https:\/\/\S+$/

const NOME_CATEGORIA = { MARKETING: 'Marketing', UTILITY: 'Utility' } as const

const chave = (t: Template) => `${t.nome}|${t.idioma}`

// Mesma regra do envio na API (EnvioWorker.primeiroNome): "TARIK SILVA" vira "Tarik"
function primeiroNome(nome: string | undefined) {
  const primeiro = nome?.trim().split(/\s+/)[0]?.toLowerCase()
  if (!primeiro) return 'Paciente'
  return primeiro.charAt(0).toUpperCase() + primeiro.slice(1)
}

export default function NovaCampanha() {
  const { selecionados, remover, limpar } = useSelecao()
  const queryClient = useQueryClient()

  const [nome, setNome] = useState('')
  const [chaveTemplate, setChaveTemplate] = useState('')
  const [imagemUrl, setImagemUrl] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [mostrarLista, setMostrarLista] = useState(false)
  const [criada, setCriada] = useState<Campanha | null>(null)

  const pacientes = [...selecionados.values()]

  const templates = useQuery({ queryKey: ['templates'], queryFn: listarTemplates })
  const template = templates.data?.find((t) => chave(t) === chaveTemplate) ?? null
  // Na previa, {{1}} vira o primeiro nome do primeiro paciente da lista
  const nomeExemplo = primeiroNome(pacientes[0]?.nome)

  const criar = useMutation({
    mutationFn: criarCampanha,
    onSuccess: (campanha) => {
      setCriada(campanha)
      limpar()
      // A coluna "ultimo marketing/utility" da listagem muda: busca de novo na proxima vez
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
    },
    onSettled: () => setConfirmando(false),
  })

  const errosCampos = criar.error instanceof ErroApi ? criar.error.campos : undefined

  // Validacao local: so libera o botao com o formulario valido
  const erros: Record<string, string> = {}
  if (!nome.trim()) erros.nome = 'Dê um nome para a campanha.'
  if (!template) erros.template = 'Escolha o template.'
  if (template?.exigeImagem && !imagemUrl.trim()) erros.imagemUrl = 'Este template tem imagem no cabeçalho: informe o link.'
  else if (imagemUrl.trim() && !PADRAO_IMAGEM.test(imagemUrl.trim())) erros.imagemUrl = 'O link precisa começar com https://'
  const valido = Object.keys(erros).length === 0 && pacientes.length > 0 && !!template?.suportado

  function revisar(e: FormEvent) {
    e.preventDefault()
    if (valido) setConfirmando(true)
  }

  function enviar() {
    if (!template) return
    criar.mutate({
      nome: nome.trim(),
      tipo: template.categoria,
      template: template.nome,
      idioma: template.idioma,
      // So preenche {{1}} quando o template tem a variavel
      usarPrimeiroNome: template.variaveis === 1,
      imagemUrl: template.exigeImagem ? imagemUrl.trim() : null,
      pacienteIds: pacientes.map((p) => p.id),
    })
  }

  if (criada) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-marca-claro text-2xl text-marca-turquesa">
          ✓
        </div>
        <h1 className="text-xl font-semibold text-marca-escuro">Campanha criada</h1>
        <p className="mt-2 text-sm text-slate-600">
          <strong>{criada.nome}</strong> entrou na fila com {formatarNumero(criada.total)} mensagens.
          {criada.falhas > 0 && ` ${formatarNumero(criada.falhas)} ficaram de fora por telefone inválido.`}
        </p>
        <p className="mt-1 text-sm text-slate-500">O envio acontece aos poucos, em segundo plano.</p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-marca-petroleo px-4 py-2 text-sm font-semibold text-white hover:bg-marca-escuro">
          Voltar para pacientes
        </Link>
      </div>
    )
  }

  if (pacientes.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-marca-escuro">Nenhum paciente selecionado</h1>
        <p className="mt-2 text-sm text-slate-600">Escolha os pacientes na lista antes de montar a campanha.</p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-marca-petroleo px-4 py-2 text-sm font-semibold text-white hover:bg-marca-escuro">
          Ir para pacientes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <Link to="/" className="text-sm text-marca-petroleo hover:underline">← Voltar para pacientes</Link>
        <h1 className="mt-2 text-xl font-semibold text-marca-escuro">Nova campanha</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Formulario */}
        <form onSubmit={revisar} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div>
            <label className={rotulo} htmlFor="nome">Nome da campanha</label>
            <input id="nome" className={campo} value={nome} maxLength={100} placeholder="Ex.: Cupom outubro - inativos 90 dias"
              onChange={(e) => setNome(e.target.value)} />
            <p className={ajuda}>Só para vocês identificarem depois. O paciente não vê.</p>
          </div>

          <div>
            <label className={rotulo} htmlFor="template">Template</label>
            <select id="template" className={campo} value={chaveTemplate} disabled={!templates.data}
              onChange={(e) => setChaveTemplate(e.target.value)}>
              <option value="">
                {templates.isPending ? 'Carregando templates da Meta…' : 'Escolha um template aprovado'}
              </option>
              {templates.data?.map((t) => (
                <option key={chave(t)} value={chave(t)} disabled={!t.suportado}>
                  {t.nome} ({t.idioma}) · {NOME_CATEGORIA[t.categoria]}
                  {t.exigeImagem ? ' · com imagem' : ''}
                  {!t.suportado ? ' · não suportado' : ''}
                </option>
              ))}
            </select>
            {templates.isError && (
              <p className="mt-1 text-xs text-red-700">Não deu para carregar os templates: {templates.error.message}</p>
            )}
            {templates.data && templates.data.length === 0 && (
              <p className="mt-1 text-xs text-amber-700">Nenhum template de marketing ou utility aprovado na Meta.</p>
            )}
            {template && (
              <p className={ajuda}>
                Categoria na Meta: <strong>{NOME_CATEGORIA[template.categoria]}</strong>
                {template.variaveis === 1 && ' · o {{1}} do texto recebe o primeiro nome de cada paciente'}
              </p>
            )}
            {template && !template.suportado && (
              <p className="mt-1 text-xs text-red-700">{template.motivo}</p>
            )}
          </div>

          {template?.exigeImagem && (
            <div>
              <label className={rotulo} htmlFor="imagem">Imagem do cabeçalho</label>
              <input id="imagem" className={campo} value={imagemUrl} maxLength={1000} placeholder="https://..."
                onChange={(e) => setImagemUrl(e.target.value)} />
              <p className={ajuda}>Link público em https (jpg ou png). É a imagem que aparece no topo da mensagem.</p>
            </div>
          )}

          {template && <Previa template={template} nomeExemplo={nomeExemplo} imagemUrl={imagemUrl.trim()} />}

          {/* Erros: primeiro os locais, depois os que a API devolveu */}
          {Object.keys(erros).length > 0 && (nome || template) && (
            <ul className="list-disc space-y-1 rounded-md bg-amber-50 px-8 py-3 text-sm text-amber-800">
              {Object.entries(erros).map(([k, v]) => <li key={k}>{v}</li>)}
            </ul>
          )}
          {criar.isError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {criar.error.message}
              {errosCampos && (
                <ul className="mt-1 list-disc pl-5">
                  {Object.entries(errosCampos).map(([k, v]) => <li key={k}>{k}: {v}</li>)}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={!valido}
              className="rounded-md bg-marca-petroleo px-5 py-2 text-sm font-semibold text-white hover:bg-marca-escuro disabled:cursor-not-allowed disabled:opacity-40">
              Revisar e enviar
            </button>
          </div>
        </form>

        {/* Destinatarios */}
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-700">Destinatários</h2>
          <p className="mt-1 text-3xl font-semibold text-marca-escuro">{formatarNumero(pacientes.length)}</p>
          <p className="text-xs text-slate-500">pacientes selecionados</p>
          <button type="button" onClick={() => setMostrarLista((v) => !v)}
            className="mt-3 text-sm font-medium text-marca-petroleo hover:underline">
            {mostrarLista ? 'Esconder lista' : 'Ver lista'}
          </button>
          {mostrarLista && (
            <ul className="mt-3 max-h-96 divide-y divide-slate-100 overflow-y-auto text-sm">
              {pacientes.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-slate-800">{p.nome}</div>
                    <div className="text-xs text-slate-500">
                      {formatarTelefone(p.telefone)} · {NOME_FONTE[p.fonte] ?? p.fonte}
                    </div>
                  </div>
                  <button type="button" onClick={() => remover([p.id])} aria-label={`Tirar ${p.nome}`}
                    className="shrink-0 rounded px-2 py-1 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700">
                    Tirar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {/* Confirmacao: depois de criada, a fila comeca a enviar */}
      {confirmando && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-marca-escuro">Confirmar envio</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Campanha</dt><dd className="font-medium">{nome.trim()}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Tipo</dt><dd className="font-medium">{template && NOME_CATEGORIA[template.categoria]}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Template</dt><dd className="font-mono">{template?.nome} ({template?.idioma})</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Primeiro nome</dt><dd>{template?.variaveis === 1 ? 'Sim' : 'Não'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Imagem</dt><dd>{template?.exigeImagem ? 'Sim' : 'Não'}</dd></div>
            </dl>
            <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Serão enviadas <strong>{formatarNumero(pacientes.length)} mensagens</strong> pelo WhatsApp.
              Depois de confirmar, não dá para desfazer.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setConfirmando(false)} disabled={criar.isPending}
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Voltar
              </button>
              <button onClick={enviar} disabled={criar.isPending}
                className="rounded-md bg-marca-turquesa px-4 py-2 text-sm font-semibold text-white hover:bg-marca-petroleo disabled:opacity-60">
                {criar.isPending ? 'Criando…' : 'Confirmar e enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Previa no formato de balao do WhatsApp, com o {{1}} ja trocado pelo nome de exemplo. */
function Previa({ template, nomeExemplo, imagemUrl }: { template: Template; nomeExemplo: string; imagemUrl: string }) {
  const preencher = (texto: string | null) => texto?.replace(/\{\{\s*1\s*\}\}/g, nomeExemplo) ?? ''
  // Guarda o link que falhou: se a imagem nao abre aqui, a Meta tambem nao vai conseguir baixar
  const [linkQuebrado, setLinkQuebrado] = useState<string | null>(null)
  const imagemValida = PADRAO_IMAGEM.test(imagemUrl) && linkQuebrado !== imagemUrl
  return (
    <div>
      <p className={rotulo}>Prévia</p>
      <div className="rounded-lg bg-[#efeae2] p-4">
        <div className="max-w-sm overflow-hidden rounded-lg bg-white text-sm shadow-sm">
          {template.cabecalho === 'IMAGEM' &&
            (imagemValida ? (
              <img src={imagemUrl} alt="" referrerPolicy="no-referrer" onError={() => setLinkQuebrado(imagemUrl)}
                className="max-h-56 min-h-32 w-full bg-slate-100 object-cover" />
            ) : (
              <div className={`flex h-32 items-center justify-center bg-slate-100 text-xs ${linkQuebrado === imagemUrl && imagemUrl ? 'text-red-600' : 'text-slate-400'}`}>
                {linkQuebrado === imagemUrl && imagemUrl ? 'Não deu para abrir a imagem desse link' : 'Imagem'}
              </div>
            ))}
          <div className="space-y-1 px-3 py-2">
            {template.cabecalho === 'TEXTO' && <p className="font-semibold">{template.cabecalhoTexto}</p>}
            <p className="whitespace-pre-line text-slate-800">{preencher(template.corpo)}</p>
            {template.rodape && <p className="text-xs text-slate-500">{template.rodape}</p>}
          </div>
          {template.botoes.map((b) => (
            <div key={b} className="border-t border-slate-100 py-2 text-center text-sm font-medium text-sky-600">{b}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
