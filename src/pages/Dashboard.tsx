import { useQuery } from '@tanstack/react-query'
import { BarrasHorizontais } from '../components/BarrasHorizontais'
import { BarrasVerticais, type PontoBarra } from '../components/BarrasVerticais'
import { Numero } from '../components/ResumoEnvios'
import { buscarDashboardPacientes } from '../lib/dashboard'
import { formatarNumero, porcentagem } from '../lib/formato'
import { listarOrigens } from '../lib/pacientes'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// "2026-10-01" -> "out/26"
const mesAno = (iso: string) => `${MESES[Number(iso.slice(5, 7)) - 1]}/${iso.slice(2, 4)}`

export default function Dashboard() {
  // A base so muda no sync das 20h: pode ficar uma hora em cache no navegador
  const painel = useQuery({ queryKey: ['dashboard-pacientes'], queryFn: buscarDashboardPacientes, staleTime: 60 * 60 * 1000 })
  const origens = useQuery({ queryKey: ['origens'], queryFn: listarOrigens, staleTime: 60 * 60 * 1000 })
  const d = painel.data

  if (painel.isError) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-semibold text-marca-escuro">Dashboard</h1>
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{painel.error.message}</div>
      </div>
    )
  }

  if (!d) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-semibold text-marca-escuro">Dashboard</h1>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-100" />)}
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
      </div>
    )
  }

  const { base, recorrencia: r, inatividade: i } = d
  const voltaram = r.duas + r.tresACinco + r.seisOuMais
  const parados = i.de181a365 + i.maisDe365

  const mes = (campo: 'consultas' | 'novos'): PontoBarra[] =>
    d.porMes.map((m) => ({ chave: m.mes, rotulo: mesAno(m.mes), titulo: mesAno(m.mes), valor: m[campo] }))

  // "Atestta" soma os dois canais; mostra os canais separados e tira o total repetido quando eles existem
  const listaOrigens = origens.data ?? []
  const temCanal = listaOrigens.some((o) => o.origem.startsWith('Atestta ·'))
  const itensOrigem = listaOrigens
    .filter((o) => !(temCanal && o.origem === 'Atestta'))
    .sort((a, b) => b.pacientes - a.pacientes)
    .slice(0, 10)
    .map((o) => ({ rotulo: o.origem, valor: o.pacientes }))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-marca-escuro">Dashboard</h1>
        <p className="text-sm text-slate-500">Base de pacientes, atualizada todo dia às 20h</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Numero nome="Pacientes" valor={formatarNumero(base.total)} detalhe="na base" />
        <Numero nome="Com telefone" valor={formatarNumero(base.comTelefone)} detalhe={porcentagem(base.comTelefone, base.total)} />
        <Numero nome="Com e-mail" valor={formatarNumero(base.comEmail)} detalhe={porcentagem(base.comEmail, base.total)} />
        <Numero nome="Consultaram em 30 dias" valor={formatarNumero(i.ate30)} detalhe={porcentagem(i.ate30, base.comTelefone)} />
        <Numero nome="Voltaram" valor={porcentagem(voltaram, base.comTelefone)} detalhe={`${formatarNumero(voltaram)} com 2+ passagens`} />
        <Numero nome="Parados há 6+ meses" valor={formatarNumero(parados)} detalhe={porcentagem(parados, base.comTelefone)} />
      </div>
      <p className="-mt-2 text-xs text-slate-500">
        A partir de "Consultaram em 30 dias", os números contam só quem tem telefone ({formatarNumero(base.comTelefone)}).
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        <BarrasVerticais titulo="Consultas por mês" pontos={mes('consultas')} />
        <BarrasVerticais titulo="Pacientes novos por mês" pontos={mes('novos')} />
      </div>
      <p className="-mt-2 text-xs text-slate-500">
        Os gráficos por mês usam o histórico de consultas. A carga antiga do medsync (planilha de maio) não tem as consultas
        uma a uma e fica de fora deles.
      </p>

      <div className="grid gap-5 lg:grid-cols-3">
        <BarrasHorizontais titulo="Por origem" itens={itensOrigem}
          nota="Pacientes com ao menos uma consulta na origem. Quem consultou em mais de uma aparece em cada uma." />
        <BarrasHorizontais titulo="Recorrência" total={base.comTelefone} itens={[
          { rotulo: '1 passagem', valor: r.uma },
          { rotulo: '2 passagens', valor: r.duas },
          { rotulo: '3 a 5 passagens', valor: r.tresACinco },
          { rotulo: '6 ou mais', valor: r.seisOuMais },
        ]} />
        <BarrasHorizontais titulo="Última consulta" total={base.comTelefone} itens={[
          { rotulo: 'Até 30 dias', valor: i.ate30 },
          { rotulo: '31 a 90 dias', valor: i.de31a90 },
          { rotulo: '91 a 180 dias', valor: i.de91a180 },
          { rotulo: '181 dias a 1 ano', valor: i.de181a365 },
          { rotulo: 'Mais de 1 ano', valor: i.maisDe365 },
          ...(i.semData > 0 ? [{ rotulo: 'Sem data', valor: i.semData }] : []),
        ]} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <BarrasHorizontais titulo="Estados (top 10)" total={base.comTelefone}
          itens={d.estados.map((e) => ({ rotulo: e.nome, valor: e.pacientes }))}
          nota={d.semEstado > 0 ? `${formatarNumero(d.semEstado)} sem estado cadastrado (o medsync não guarda endereço).` : undefined} />
        <BarrasHorizontais titulo="Cidades (top 10)" total={base.comTelefone}
          itens={d.cidades.map((c) => ({ rotulo: c.uf ? `${c.nome}/${c.uf}` : c.nome, valor: c.pacientes }))}
          nota={d.semCidade > 0 ? `${formatarNumero(d.semCidade)} sem cidade cadastrada (o medsync não guarda endereço).` : undefined} />
      </div>
    </div>
  )
}
