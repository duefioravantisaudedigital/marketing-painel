// No mailing_master a fonte do medsync ficou gravada como "carol"
export const NOME_FONTE: Record<string, string> = { carol: 'medsync', atestta: 'Atestta' }

// "11999998888" -> "(11) 99999-8888"
export function formatarTelefone(telefone: string | null): string {
  if (!telefone) return '—'
  const d = telefone.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return telefone
}

/**
 * Data no horario de Brasilia. Datas "so dia" (base antiga, gravadas como meia-noite UTC)
 * sao lidas em UTC, senao apareceriam um dia antes.
 */
export function formatarData(iso: string | null, soDia = false): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: soDia ? 'UTC' : 'America/Sao_Paulo',
  }).format(new Date(iso))
}

export function formatarNumero(n: number): string {
  return new Intl.NumberFormat('pt-BR').format(n)
}

// Data e hora no horario de Brasilia: "14/10/2026 16:10"
export function formatarDataHora(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(iso))
}

export function porcentagem(parte: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((parte / total) * 100)}%`
}
