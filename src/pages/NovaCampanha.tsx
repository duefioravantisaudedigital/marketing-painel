import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { ErroApi } from '../lib/api'
import { criarCampanha, type Campanha, type TipoCampanha } from '../lib/campanhas'
import { NOME_FONTE, formatarNumero, formatarTelefone } from '../lib/formato'
import { useSelecao } from '../lib/selecao'

const campo =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-marca-turquesa focus:outline-none focus:ring-2 focus:ring-marca-turquesa/30'
const rotulo = 'mb-1 block text-sm font-medium text-slate-700'
const ajuda = 'mt-1 text-xs text-slate-500'

// Mesmas regras da API, para avisar antes de enviar
const PADRAO_TEMPLATE = /^[a-z0-9_]+$/
const PADRAO_IMAGEM = /^https:\/\/\S+$/

const TIPOS: { valor: TipoCampanha; titulo: string; descricao: string }[] = [
  { valor: 'MARKETING', titulo: 'Marketing', descricao: 'Promoção, cupom, convite para voltar.' },
  { valor: 'UTILITY', titulo: 'Utility', descricao: 'Aviso ligado a um atendimento: lembrete, resultado, retorno.' },
]

export default function NovaCampanha() {
  const { selecionados, remover, limpar } = useSelecao()
  const queryClient = useQueryClient()

  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<TipoCampanha>('MARKETING')
  const [template, setTemplate] = useState('')
  const [idioma, setIdioma] = useState('pt_BR')
  const [usarPrimeiroNome, setUsarPrimeiroNome] = useState(true)
  const [imagemUrl, setImagemUrl] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [mostrarLista, setMostrarLista] = useState(false)
  const [criada, setCriada] = useState<Campanha | null>(null)

  const pacientes = [...selecionados.values()]

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
  if (!template.trim()) erros.template = 'Informe o nome do template.'
  else if (!PADRAO_TEMPLATE.test(template)) erros.template = 'Só letras minúsculas, números e _ (igual ao nome na Meta).'
  if (imagemUrl.trim() && !PADRAO_IMAGEM.test(imagemUrl.trim())) erros.imagemUrl = 'O link precisa começar com https://'
  const valido = Object.keys(erros).length === 0 && pacientes.length > 0

  function revisar(e: FormEvent) {
    e.preventDefault()
    if (valido) setConfirmando(true)
  }

  function enviar() {
    criar.mutate({
      nome: nome.trim(),
      tipo,
      template: template.trim(),
      idioma,
      usarPrimeiroNome,
      imagemUrl: imagemUrl.trim() || null,
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

          <fieldset>
            <legend className={rotulo}>Tipo</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {TIPOS.map((t) => (
                <label key={t.valor}
                  className={`cursor-pointer rounded-md border p-3 text-sm ${tipo === t.valor ? 'border-marca-turquesa bg-marca-claro/40' : 'border-slate-300 hover:bg-slate-50'}`}>
                  <input type="radio" name="tipo" value={t.valor} checked={tipo === t.valor}
                    onChange={() => setTipo(t.valor)} className="mr-2 accent-marca-turquesa" />
                  <span className="font-medium text-slate-800">{t.titulo}</span>
                  <span className="mt-1 block text-xs text-slate-500">{t.descricao}</span>
                </label>
              ))}
            </div>
            <p className={ajuda}>Tem que ser a mesma categoria em que o template foi aprovado na Meta.</p>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className={rotulo} htmlFor="template">Template</label>
              <input id="template" className={`${campo} font-mono`} value={template} maxLength={512} placeholder="lembrete_36"
                autoComplete="off" spellCheck={false}
                onChange={(e) => setTemplate(e.target.value)} />
              <p className={ajuda}>Nome exato do template aprovado no WhatsApp Manager.</p>
            </div>
            <div>
              <label className={rotulo} htmlFor="idioma">Idioma</label>
              <select id="idioma" className={campo} value={idioma} onChange={(e) => setIdioma(e.target.value)}>
                <option value="pt_BR">Português (pt_BR)</option>
                <option value="en_US">Inglês (en_US)</option>
                <option value="es">Espanhol (es)</option>
              </select>
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={usarPrimeiroNome} onChange={(e) => setUsarPrimeiroNome(e.target.checked)}
              className="mt-0.5 accent-marca-turquesa" />
            <span>
              <span className="font-medium text-slate-800">Preencher o primeiro nome do paciente</span>
              <span className="block text-xs text-slate-500">
                Para templates com {'{{1}}'} no texto, como "Olá, {'{{1}}'}!". Desmarque se o template não tem variável.
              </span>
            </span>
          </label>

          <div>
            <label className={rotulo} htmlFor="imagem">Imagem do cabeçalho <span className="font-normal text-slate-400">(opcional)</span></label>
            <input id="imagem" className={campo} value={imagemUrl} maxLength={1000} placeholder="https://..."
              onChange={(e) => setImagemUrl(e.target.value)} />
            <p className={ajuda}>Só se o template tiver imagem no cabeçalho. Link público em https.</p>
          </div>

          {/* Erros: primeiro os locais, depois os que a API devolveu */}
          {Object.keys(erros).length > 0 && (nome || template || imagemUrl) && (
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
              <div className="flex justify-between"><dt className="text-slate-500">Tipo</dt><dd className="font-medium">{tipo === 'MARKETING' ? 'Marketing' : 'Utility'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Template</dt><dd className="font-mono">{template.trim()} ({idioma})</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Primeiro nome</dt><dd>{usarPrimeiroNome ? 'Sim' : 'Não'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Imagem</dt><dd>{imagemUrl.trim() ? 'Sim' : 'Não'}</dd></div>
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
