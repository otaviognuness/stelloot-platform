import { useMemo, useState } from 'react'
import FilterTabs from '../components/FilterTabs'
import GameCard from '../components/GameCard'
import StoreSelector from '../components/StoreSelector'
import { STORE_FILTERS } from '../config/stores'
import {
  filterBySearch,
  filterByStore,
  getPopularRank,
  sortDeals,
} from '../utils/catalog'

const HOME_TABS = [
  { id: 'popular', label: 'Populares' },
  { id: 'deals', label: 'Ofertas' },
]

function Home({
  currentUser,
  deals,
  error,
  getWishlistedGame,
  isWishlisted,
  loading,
  onCreateAlert,
  onLogin,
  onLogout,
  onNavigate,
  onOpenGame,
  onToggleWishlist,
  warning,
}) {
  const [activeTab, setActiveTab] = useState('popular')
  const [search, setSearch] = useState('')
  const [storeFilter, setStoreFilter] = useState('featured')
  const visibleLimit = activeTab === 'popular' ? 8 : 12

  const visibleDeals = useMemo(() => {
    const filteredDeals = filterBySearch(filterByStore(deals, storeFilter), search)

    if (activeTab === 'popular') {
      const knownDeals = filteredDeals.filter((deal) => getPopularRank(deal) < 999)
      const sourceDeals = knownDeals.length ? knownDeals : filteredDeals

      return [...sourceDeals]
        .sort((a, b) => {
          const rank = getPopularRank(a) - getPopularRank(b)
          return rank !== 0 ? rank : Number(b.dealRating || 0) - Number(a.dealRating || 0)
        })
        .slice(0, visibleLimit)
    }

    return sortDeals(filteredDeals, 'discount').slice(0, visibleLimit)
  }, [activeTab, deals, search, storeFilter, visibleLimit])

  const highlightDeal = useMemo(
    () =>
      visibleDeals.reduce((bestDeal, game) => {
        if (!bestDeal) return game
        return Number(game.savings || 0) > Number(bestDeal.savings || 0)
          ? game
          : bestDeal
      }, null),
    [visibleDeals]
  )

  function handleSearch(event) {
    event.preventDefault()
    if (search.trim()) {
      onNavigate('offers', { search: search.trim() })
    }
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

      <section className="hero">
        <div>
          <span className="tag">Ofertas PC em tempo real</span>
          <h2>Encontre o menor preco dos seus jogos favoritos</h2>
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
            {highlightDeal
              ? `-${Math.round(Number(highlightDeal.savings || 0))}%`
              : '-0%'}
          </strong>
          <p>{highlightDeal?.displayTitle || highlightDeal?.title || 'Carregando...'}</p>
        </div>
      </section>

      <section className="section-title">
        <div>
          <h3>{activeTab === 'popular' ? 'Populares em promocao' : 'Melhores ofertas'}</h3>
          <p>
            {activeTab === 'popular'
              ? 'Jogos de PC conhecidos quando estiverem disponiveis na API.'
              : 'Catalogo rapido com uma melhor oferta por jogo.'}
          </p>
          <small className="currency-note">
            Valores em R$ sao estimativas a partir do preco em dolar da CheapShark.
          </small>
        </div>

        <button
          className="see-all-button"
          onClick={() => onNavigate('offers')}
          type="button"
        >
          Ver todos
        </button>
      </section>

      <section className="deals-toolbar">
        <FilterTabs
          label="Categoria"
          onChange={setActiveTab}
          options={HOME_TABS}
          value={activeTab}
        />

        <StoreSelector
          label="Loja"
          onChange={setStoreFilter}
          options={STORE_FILTERS}
          value={storeFilter}
        />
      </section>

      {loading && <p className="status-message">Carregando promocoes...</p>}
      {warning && !loading && <p className="status-message warning">{warning}</p>}
      {error && !loading && <p className="status-message error">{error}</p>}

      {!loading && !error && visibleDeals.length === 0 && (
        <p className="status-message">Nenhuma promocao encontrada nessa selecao.</p>
      )}

      {!loading && !error && visibleDeals.length > 0 && (
        <section className="games-grid">
          {visibleDeals.map((game) => (
            <GameCard
              game={game}
              isWishlisted={isWishlisted(game)}
              key={game.dealID}
              onCreateAlert={onCreateAlert}
              onSelect={onOpenGame}
              onToggleWishlist={onToggleWishlist}
              savedGame={getWishlistedGame?.(game)}
            />
          ))}
        </section>
      )}
    </>
  )
}

export default Home
