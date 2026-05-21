import { useMemo, useState } from 'react'
import FilterTabs from '../components/FilterTabs'
import GameCard from '../components/GameCard'
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
  deals,
  error,
  isWishlisted,
  loading,
  onCreateAlert,
  onLogin,
  onNavigate,
  onOpenGame,
  onRefreshDeals,
  onToggleWishlist,
  warning,
}) {
  const [activeTab, setActiveTab] = useState('popular')
  const [search, setSearch] = useState('')
  const [storeFilter, setStoreFilter] = useState('all')
  const [visibleLimit, setVisibleLimit] = useState(8)

  const visibleDeals = useMemo(() => {
    const filteredDeals = filterBySearch(filterByStore(deals, storeFilter), search)

    if (activeTab === 'popular') {
      return [...filteredDeals]
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
    setVisibleLimit(12)
  }

  function handleTabChange(tab) {
    setActiveTab(tab)
    setVisibleLimit(tab === 'popular' ? 8 : 12)
  }

  function handleHeroDeals() {
    setActiveTab('deals')
    setVisibleLimit(12)
  }

  return (
    <>
      <header className="topbar">
        <form className="search" onSubmit={handleSearch}>
          <span className="search-icon">⌕</span>
          <input
            placeholder="Buscar jogo ou promoção..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="search-submit" type="submit">Buscar</button>
        </form>

        <button onClick={onLogin} type="button">Entrar</button>
      </header>

      <section className="hero">
        <div>
          <span className="tag">Ofertas PC em tempo real</span>
          <h2>Encontre o menor preço dos seus jogos favoritos</h2>
          <p>
            Compare promoções de PC, salve jogos na wishlist e acompanhe
            descontos com preço estimado em reais.
          </p>

          <div className="hero-actions">
            <button onClick={handleHeroDeals} type="button">Ver promoções</button>
            <button className="secondary" onClick={() => onNavigate('alerts')} type="button">
              Criar alerta
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
          <h3>{activeTab === 'popular' ? 'Populares em promoção' : 'Melhores ofertas'}</h3>
          <p>
            {activeTab === 'popular'
              ? 'Jogos de PC conhecidos e ofertas com melhor avaliação.'
              : 'Catálogo rápido com uma melhor oferta por jogo.'}
          </p>
          <small className="currency-note">
            Valores em R$ são estimativas a partir do preço em dólar da CheapShark.
          </small>
        </div>

        <button
          className="see-all-button"
          onClick={() => {
            if (visibleLimit >= 24) {
              onRefreshDeals()
            } else {
              setVisibleLimit(24)
            }
          }}
          type="button"
        >
          {visibleLimit >= 24 ? 'Atualizar' : 'Ver todos'}
        </button>
      </section>

      <section className="deals-toolbar">
        <FilterTabs
          label="Categoria"
          onChange={handleTabChange}
          options={HOME_TABS}
          value={activeTab}
        />

        <FilterTabs
          label="Loja"
          onChange={setStoreFilter}
          options={STORE_FILTERS}
          value={storeFilter}
        />
      </section>

      {loading && <p className="status-message">Carregando promoções...</p>}
      {warning && !loading && <p className="status-message warning">{warning}</p>}
      {error && !loading && <p className="status-message error">{error}</p>}

      {!loading && !error && visibleDeals.length === 0 && (
        <p className="status-message">Nenhuma promoção encontrada nessa seleção.</p>
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
            />
          ))}
        </section>
      )}
    </>
  )
}

export default Home
