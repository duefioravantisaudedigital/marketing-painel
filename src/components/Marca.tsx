/** Assinatura do painel: nome da Due e o nome do sistema. */
export function Marca({ claro = false }: { claro?: boolean }) {
  return (
    <div className="leading-tight">
      <p className={`text-lg font-semibold ${claro ? 'text-white' : 'text-marca-escuro'}`}>Due Fioravanti</p>
      <p className={`text-xs tracking-wide uppercase ${claro ? 'text-marca-claro' : 'text-marca-petroleo'}`}>
        Painel de Marketing
      </p>
    </div>
  )
}
