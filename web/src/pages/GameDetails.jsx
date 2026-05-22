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
  savedGame,
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
        Voltar
      </button>

      <div
        className="details-hero"
        style={{ backgroundImage: `url(${game.thumb})` }}
      >
        <div className="details-hero-overlay">
          <span>{game.storeName} - PC</span>
          <h2>{title}</h2>

          <div className="details-price-row">
            <strong>{formatBRLFromDollar(game.salePrice)}</strong>
            <span>{formatBRLFromDollar(game.normalPrice)}</span>
            <mark>-{discount}%</mark>
          </div>
          <p className="price-note">{formatDollar(game.salePrice)} na origem - R$ estimado</p>

          {savedGame?.targetPrice && (
            <p className="price-note target-note">
              Preco alvo: {Number(savedGame.targetPrice).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          )}

          <div className="details-actions">
            <a href={dealUrl} rel="noreferrer" target="_blank">
              Ver oferta
            </a>
            <button onClick={() => onToggleWishlist(game)} type="button">
              {isWishlisted ? 'Remover da wishlist' : 'Adicionar a wishlist'}
            </button>
            <button onClick={() => onCreateAlert(game)} type="button">
              Definir preco alvo
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
          <small>Preco original</small>
          <strong>{formatBRLFromDollar(game.normalPrice)}</strong>
        </article>
        <article>
          <small>Preco atual</small>
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
