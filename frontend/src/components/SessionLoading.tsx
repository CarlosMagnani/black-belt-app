export function SessionLoading() {
  return (
    <main className="session-loading bb-grain" aria-live="polite">
      <p className="eyebrow">BLACK BELT</p>
      <div className="dot-loader" aria-label="Carregando sessão"><span /><span /><span /></div>
      <p>Ajustando sua faixa...</p>
    </main>
  )
}
