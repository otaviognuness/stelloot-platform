import { dollarToBRL, formatBRLFromDollar } from '../utils/deals'

function Dashboard({ deals, onNavigate, wishlist }) {
  const bestDiscount = deals.reduce((bestDeal, deal) => {
    if (!bestDeal) return deal
    return Number(deal.savings || 0) > Number(bestDeal.savings || 0) ? deal : bestDeal
  }, null)

  const reachedTargets = wishlist.filter((game) => {
    if (!game.targetPrice) return false
    return dollarToBRL(game.salePrice) <= Number(game.targetPrice)
  })

  const averageTarget = wishlist.length
    ? wishlist.reduce((sum, game) => sum + Number(game.targetPrice || 0), 0) / wishlist.length
    : 0

  return (
    <>
      <header className="page-heading">
        <div>
          <span className="tag">Resumo PC</span>
          <h2>Dashboard</h2>
          <p>Resumo da wishlist, precos alvo e melhores oportunidades atuais.</p>
        </div>

        <button onClick={() => onNavigate('offers')} type="button">Ver ofertas</button>
      </header>

      <section className="dashboard-grid">
        <article>
          <small>Jogos na wishlist</small>
          <strong>{wishlist.length}</strong>
        </article>
        <article>
          <small>Precos alvo</small>
          <strong>{wishlist.filter((game) => game.targetPrice).length}</strong>
        </article>
        <article>
          <small>No alvo</small>
          <strong>{reachedTargets.length}</strong>
        </article>
        <article>
          <small>Melhor desconto</small>
          <strong>{bestDiscount ? `${Math.round(Number(bestDiscount.savings || 0))}%` : '0%'}</strong>
        </article>
      </section>

      <section className="dashboard-feature">
        <div>
          <h3>
            {reachedTargets[0]?.displayTitle ||
              reachedTargets[0]?.title ||
              bestDiscount?.displayTitle ||
              bestDiscount?.title ||
              'Nenhum jogo preso'}
          </h3>
          <p>
            {reachedTargets[0]
              ? `Este jogo ja esta abaixo do alvo: ${formatBRLFromDollar(reachedTargets[0].salePrice)}.`
              : bestDiscount
                ? `Melhor oferta atual: ${formatBRLFromDollar(bestDiscount.salePrice)} em ${bestDiscount.storeName}.`
                : 'Atualize as ofertas para montar seu resumo.'}
          </p>
          {averageTarget > 0 && (
            <small className="currency-note">
              Media dos seus alvos: {averageTarget.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </small>
          )}
        </div>
        <button onClick={() => onNavigate('wishlist')} type="button">Abrir wishlist</button>
      </section>
    </>
  )
}

export default Dashboard
