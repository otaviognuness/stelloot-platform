import {
  formatBRLFromDollar,
  formatDollar,
  getDealUrl,
} from '../utils/deals'

function GameCard({
  game,
  isWishlisted = false,
  onCreateAlert,
  onSelect,
  onToggleWishlist,
}) {
  const discount = Math.round(Number(game.savings || 0))
  const title = game.displayTitle || game.title
  const dealUrl = game.dealUrl || getDealUrl(game.dealID)

  function handleOpenDetails() {
    onSelect?.(game)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpenDetails()
    }
  }

  return (
    <article
      className="game-card"
      onClick={handleOpenDetails}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div
        className="game-cover"
        style={{ backgroundImage: `url(${game.thumb})` }}
      >
        <span>-{discount}%</span>
      </div>

      <div className="game-info">
        <small>{game.storeName} · PC</small>
        <h4>{title}</h4>

        <div className="prices">
          <strong>{formatBRLFromDollar(game.salePrice)}</strong>
          <span>{formatBRLFromDollar(game.normalPrice)}</span>
        </div>
        <em className="price-note">{formatDollar(game.salePrice)} na origem</em>

        <div className="game-actions">
          <button
            className={isWishlisted ? 'active-action' : ''}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggleWishlist?.(game)
            }}
          >
            {isWishlisted ? 'Salvo' : 'Wishlist'}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onCreateAlert?.(game)
            }}
          >
            Alerta
          </button>
          <a
            href={dealUrl}
            onClick={(event) => event.stopPropagation()}
            rel="noreferrer"
            target="_blank"
          >
            Ver oferta
          </a>
        </div>
      </div>
    </article>
  )
}

export default GameCard
