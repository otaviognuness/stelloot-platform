import {
  formatBRLFromDollar,
  formatDollar,
  getDealUrl,
} from '../utils/deals'

function GameDetails({
  game,
  isWishlisted = false,
  onBack,
  onCreateAlert,
  onToggleWishlist,
}) {
  if (!game) {
    return null
  }

  const title = game.displayTitle || game.title
  const discount = Math.round(Number(game.savings || 0))
  const dealUrl = game.dealUrl || getDealUrl(game.dealID)

  return (
    <section className="details-page">
      <button className="details-back" onClick={onBack} type="button">
        ← Voltar
      </button>

      <div
        className="details-hero"
        style={{ backgroundImage: `url(${game.thumb})` }}
      >
        <div className="details-hero-overlay">
          <span>{game.storeName} · PC</span>
          <h2>{title}</h2>

          <div className="details-price-row">
            <strong>{formatBRLFromDollar(game.salePrice)}</strong>
            <span>{formatBRLFromDollar(game.normalPrice)}</span>
            <mark>-{discount}%</mark>
          </div>
          <p className="price-note">{formatDollar(game.salePrice)} na origem · R$ estimado</p>

          <div className="details-actions">
            <a href={dealUrl} rel="noreferrer" target="_blank">
              Ver oferta
            </a>
            <button onClick={() => onToggleWishlist(game)} type="button">
              {isWishlisted ? 'Remover da wishlist' : 'Adicionar à wishlist'}
            </button>
            <button onClick={() => onCreateAlert(game)} type="button">
              Criar alerta
            </button>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <article>
          <small>Loja</small>
          <strong>{game.storeName}</strong>
        </article>
        <article>
          <small>Preço original</small>
          <strong>{formatBRLFromDollar(game.normalPrice)}</strong>
        </article>
        <article>
          <small>Preço atual</small>
          <strong>{formatBRLFromDollar(game.salePrice)}</strong>
        </article>
        <article>
          <small>Desconto</small>
          <strong>{discount}%</strong>
        </article>
      </div>
    </section>
  )
}

export default GameDetails
