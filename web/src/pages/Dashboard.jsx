import { dollarToBRL, formatBRLFromDollar } from '../utils/deals'

function Dashboard({ onNavigate, wishlist }) {
  const trackedGames = wishlist.filter((game) => game.targetPrice)
  const reachedTargets = wishlist.filter((game) => {
    if (!game.targetPrice) return false
    if (Number(game.salePrice || 0) <= 0) return false
    return dollarToBRL(game.salePrice) <= Number(game.targetPrice)
  })

  const averageTarget = trackedGames.length
    ? trackedGames.reduce((sum, game) => sum + Number(game.targetPrice), 0) / trackedGames.length
    : 0

  const desiredSavings = trackedGames.reduce(
    (sum, game) =>
      Number(game.salePrice || 0) > 0
        ? sum + Math.max(0, dollarToBRL(game.salePrice) - Number(game.targetPrice))
        : sum,
    0
  )

  const featuredAlert = reachedTargets[0]
  const nearestTarget = trackedGames
    .filter((game) => Number(game.salePrice || 0) > 0 && !reachedTargets.includes(game))
    .sort(
      (first, second) =>
        dollarToBRL(first.salePrice) - Number(first.targetPrice) -
        (dollarToBRL(second.salePrice) - Number(second.targetPrice))
    )[0]

  let featureTitle = 'Sua wishlist está vazia'
  let featureText = 'Salve jogos e defina um preço alvo para acompanhar oportunidades aqui.'
  let featureAction = 'Explorar ofertas'
  let featureDestination = 'offers'

  if (featuredAlert) {
    featureTitle = featuredAlert.displayTitle || featuredAlert.title
    featureText = `Preço atual de ${formatBRLFromDollar(featuredAlert.salePrice)} atingiu seu alvo.`
    featureAction = 'Abrir wishlist'
    featureDestination = 'wishlist'
  } else if (trackedGames.length) {
    featureTitle = 'Nenhum preço alvo atingido'
    featureText = nearestTarget
      ? `Mais próximo agora: ${nearestTarget.displayTitle || nearestTarget.title}. Continue acompanhando pela wishlist.`
      : 'Seus jogos monitorados ainda não atingiram o valor desejado.'
    featureAction = 'Abrir wishlist'
    featureDestination = 'wishlist'
  } else if (wishlist.length) {
    featureTitle = 'Defina um preço alvo'
    featureText = 'Você já salvou jogos. Defina quanto quer pagar para ativar o acompanhamento.'
    featureAction = 'Abrir wishlist'
    featureDestination = 'wishlist'
  }

  return (
    <div className="dashboard-page">
      <header className="page-heading">
        <div>
          <span className="tag">Resumo PC</span>
          <h2>Dashboard</h2>
          <p>Resumo da wishlist, preços alvo e melhores oportunidades atuais.</p>
        </div>

        <button onClick={() => onNavigate('offers')} type="button">Ver ofertas</button>
      </header>

      <section className="dashboard-grid">
        <article>
          <small>Jogos na wishlist</small>
          <strong>{wishlist.length}</strong>
        </article>
        <article>
          <small>Preços alvo</small>
          <strong>{wishlist.filter((game) => game.targetPrice).length}</strong>
        </article>
        <article>
          <small>No alvo</small>
          <strong>{reachedTargets.length}</strong>
        </article>
        <article>
          <small>Economia desejada</small>
          <strong className="dashboard-currency">
            {desiredSavings.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumFractionDigits: 0,
            })}
          </strong>
        </article>
      </section>

      <section className="dashboard-feature">
        <div>
          <h3>{featureTitle}</h3>
          <p>{featureText}</p>
          {averageTarget > 0 && (
            <small className="currency-note">
              Média dos seus alvos: {averageTarget.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </small>
          )}
        </div>
        <button onClick={() => onNavigate(featureDestination)} type="button">{featureAction}</button>
      </section>
    </div>
  )
}

export default Dashboard
