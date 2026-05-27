import { useMemo } from 'react'
import { useState } from 'react'
import FeaturedSections from '../components/FeaturedSections'

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

  function handleSearch(event) {
    event.preventDefault()
    if (search.trim()) onNavigate('offers', { search: search.trim() })
  }

  return (
    <>
      {/* ── Top bar ── */}
      <header className="topbar">
        <form className="search" onSubmit={handleSearch}>
          <span className="search-icon">Search</span>
          <input
            placeholder="Buscar jogo, oferta ou catálogo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

      {/* ── Hero ── */}
      <section className="hero">
        <div>
          <span className="tag">Ofertas PC em tempo real</span>
          <h2>Encontre o menor preço dos seus jogos favoritos</h2>
          <p>
            Compare promoções de PC, salve jogos na wishlist e acompanhe
            descontos com preço estimado em reais.
          </p>
          <div className="hero-actions">
            <button onClick={() => onNavigate('offers')} type="button">Ver promoções</button>
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

      {/* ── Status ── */}
      {loading && <p className="status-message">Carregando promoções...</p>}
      {warning && !loading && <p className="status-message warning">{warning}</p>}
      {error && !loading && <p className="status-message error">{error}</p>}

      {/* ── Featured sections — substitui tabs + grid antigos ── */}
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