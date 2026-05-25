import {
  formatBRLFromDollar,
  formatDollar,
  getDealUrl,
  getGameArtwork,
} from '../utils/deals'

function GameCard({
  animateIn = false,
  game,
  isWishlisted = false,
  onCreateAlert,
  onSelect,
  onToggleWishlist,
  savedGame,
}) {
  const discount = Math.round(Number(game.savings || 0))
  const title = game.displayTitle || game.title
  const dealUrl = game.dealUrl || getDealUrl(game.dealID)
  const artwork = getGameArtwork(game)
  const hasPrice = Number(game.salePrice || 0) > 0
  const hasOriginalPrice = Number(game.normalPrice || 0) > Number(game.salePrice || 0)

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
      className={`game-card${game.catalogOnly ? ' catalog-card' : ''}${animateIn ? ' game-card-new' : ''}`}
      onClick={handleOpenDetails}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="game-cover">
        <img
          alt=""
          decoding="async"
          loading="lazy"
          onError={(event) => {
            if (game.thumb && event.currentTarget.src !== game.thumb) {
              event.currentTarget.src = game.thumb
            }
          }}
          src={artwork}
        />
        <span>{discount > 0 ? `-${discount}%` : 'Catálogo'}</span>
      </div>

      <div className="game-info">
        <small>{game.storeName} - PC</small>
        <h4>{title}</h4>

        <div className="prices">
          <strong>{hasPrice ? formatBRLFromDollar(game.salePrice) : 'Ver preço'}</strong>
          {hasOriginalPrice && <span>{formatBRLFromDollar(game.normalPrice)}</span>}
        </div>
        {hasPrice && <em className="price-note">{formatDollar(game.salePrice)} na origem</em>}
        {game.catalogOnly && (
          <em className="price-note target-note">
            Resultado de catálogo, mesmo sem promoção ativa.
          </em>
        )}
        {savedGame?.targetPrice && (
          <em className="price-note target-note">
            Alvo: {Number(savedGame.targetPrice).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </em>
        )}

        <div className="game-actions">
          <button
            className={isWishlisted ? 'remove-action' : ''}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggleWishlist?.(game)
            }}
          >
            {isWishlisted ? 'Remover' : 'Wishlist'}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onCreateAlert?.(game)
            }}
          >
            {savedGame?.targetPrice ? 'Editar alvo' : 'Preço alvo'}
          </button>
          <a
            href={dealUrl}
            onClick={(event) => event.stopPropagation()}
            rel="noreferrer"
            target="_blank"
          >
            {game.catalogOnly ? 'Ver jogo' : 'Ver oferta'}
          </a>
        </div>
      </div>
    </article>
  )
}

export default GameCard
