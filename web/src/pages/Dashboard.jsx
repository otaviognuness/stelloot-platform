import { dollarToBRL, formatBRLFromDollar } from '../utils/deals'

function Dashboard({ alerts, deals, onNavigate, wishlist }) {
  const bestDiscount = deals.reduce((bestDeal, deal) => {
    if (!bestDeal) return deal
    return Number(deal.savings || 0) > Number(bestDeal.savings || 0) ? deal : bestDeal
  }, null)

  const reachedAlerts = alerts.filter((alert) =>
    dollarToBRL(alert.game.salePrice) <= Number(alert.targetPrice)
  )

  return (
    <>
      <header className="page-heading">
        <div>
          <span className="tag">Resumo PC</span>
          <h2>Dashboard</h2>
          <p>Um resumo rápido da sua wishlist, alertas e melhores oportunidades.</p>
        </div>

        <button onClick={() => onNavigate('offers')} type="button">Ver ofertas</button>
      </header>

      <section className="dashboard-grid">
        <article>
          <small>Jogos na wishlist</small>
          <strong>{wishlist.length}</strong>
        </article>
        <article>
          <small>Alertas ativos</small>
          <strong>{alerts.length}</strong>
        </article>
        <article>
          <small>Alertas no alvo</small>
          <strong>{reachedAlerts.length}</strong>
        </article>
        <article>
          <small>Melhor desconto</small>
          <strong>{bestDiscount ? `${Math.round(Number(bestDiscount.savings || 0))}%` : '0%'}</strong>
        </article>
      </section>

      <section className="dashboard-feature">
        <div>
          <h3>{bestDiscount?.displayTitle || bestDiscount?.title || 'Carregando ofertas'}</h3>
          <p>
            {bestDiscount
              ? `Melhor oferta atual: ${formatBRLFromDollar(bestDiscount.salePrice)} em ${bestDiscount.storeName}.`
              : 'Atualize as ofertas para montar seu resumo.'}
          </p>
        </div>
        <button onClick={() => onNavigate('offers')} type="button">Abrir catálogo</button>
      </section>
    </>
  )
}

export default Dashboard
