import { useMemo, useState } from 'react'
import FeaturedSections from '../components/FeaturedSections'
import { getGameArtwork } from '../utils/deals'

function Home({
  currentUser,
  deals,
  error,
  isWishlisted,
  loading,
  onLogin,
  onLogout,
  onNavigate,
  onOpenGame,
  onToggleWishlist,
  warning,
}) {
  const [search, setSearch] = useState('')

  const highlightDeal = useMemo(
    () =>
      deals.reduce((best, game) => {
        if (!best) return game
        return Number(game.savings || 0) > Number(best.savings || 0) ? game : best
      }, null),
    [deals]
  )
  const highlightArtwork = highlightDeal ? getGameArtwork(highlightDeal) : ''

  function handleSearch(event) {
    event.preventDefault()
    if (search.trim()) onNavigate('offers', { search: search.trim() })
  }

  return (
    <>
      <header className="topbar">
        <form className="search" onSubmit={handleSearch}>
          <span className="search-icon">Search</span>
          <input
            placeholder="Buscar jogo, oferta ou catalogo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="search-submit" type="submit">Buscar</button>
        </form>

        {currentUser ? (
          <div className="user-menu">
            <span aria-hidden="true">{currentUser.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            <strong>{currentUser.name}</strong>
            <button onClick={onLogout} type="button">Sair</button>
          </div>
        ) : (
          <button onClick={onLogin} type="button">Entrar</button>
        )}
      </header>

      <section className={`hero${highlightArtwork ? ' has-artwork' : ''}`}>
        {highlightArtwork && (
          <img
            alt=""
            className="hero-artwork"
            onError={(event) => {
              if (highlightDeal?.thumb && event.currentTarget.src !== highlightDeal.thumb) {
                event.currentTarget.src = highlightDeal.thumb
              }
            }}
            src={highlightArtwork}
          />
        )}
        <div className="hero-copy">
          <span className="tag">Ofertas PC em tempo real</span>
          <h2>Ofertas de PC para jogar hoje</h2>
          <p>
            Compare promocoes de PC, salve jogos na wishlist e acompanhe
            descontos com preco estimado em reais.
          </p>
          <div className="hero-actions">
            <button onClick={() => onNavigate('offers')} type="button">Ver promocoes</button>
            <button className="secondary" onClick={() => onNavigate('wishlist')} type="button">
              Wishlist
            </button>
          </div>
        </div>

        <div className="hero-card">
          <span>Maior desconto</span>
          <strong>
            {highlightDeal ? `-${Math.round(Number(highlightDeal.savings || 0))}%` : '-0%'}
          </strong>
          <p>{highlightDeal?.displayTitle || highlightDeal?.title || 'Carregando...'}</p>
        </div>
      </section>

      {loading && <p className="status-message">Carregando promocoes...</p>}
      {warning && !loading && <p className="status-message warning">{warning}</p>}
      {error && !loading && <p className="status-message error">{error}</p>}

      {!loading && !error && (
        <FeaturedSections
          deals={deals}
          isWishlisted={isWishlisted}
          onOpenGame={onOpenGame}
          onToggleWishlist={onToggleWishlist}
        />
      )}
    </>
  )
}

export default Home
