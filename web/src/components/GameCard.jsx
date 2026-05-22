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
  savedGame,
}) {
  const discount = Math.round(Number(game.savings || 0))
  const title = game.displayTitle || game.title
  const dealUrl = game.dealUrl || getDealUrl(game.dealID)
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
      className={`game-card${game.catalogOnly ? ' catalog-card' : ''}`}
      onClick={handleOpenDetails}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div
        className="game-cover"
        style={{ backgroundImage: `url(${game.thumb})` }}
      >
        <span>{discount > 0 ? `-${discount}%` : 'Catalogo'}</span>
      </div>

      <div className="game-info">
        <small>{game.storeName} - PC</small>
        <h4>{title}</h4>

        <div className="prices">
          <strong>{hasPrice ? formatBRLFromDollar(game.salePrice) : 'Ver preco'}</strong>
          {hasOriginalPrice && <span>{formatBRLFromDollar(game.normalPrice)}</span>}
        </div>
        {hasPrice && <em className="price-note">{formatDollar(game.salePrice)} na origem</em>}
        {game.catalogOnly && (
          <em className="price-note target-note">
            Resultado de catalogo, mesmo sem promocao ativa.
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
            Preco alvo
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
