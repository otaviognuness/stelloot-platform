import { useEffect, useMemo, useState } from 'react'
import FilterTabs from '../components/FilterTabs'
import GameCard from '../components/GameCard'
import StoreSelector from '../components/StoreSelector'
import { STORE_FILTERS } from '../config/stores'
import { searchGames } from '../services/cheapSharkService'
import {
  DISCOUNT_FILTERS,
  filterByDiscount,
  filterByPrice,
  filterBySearch,
  filterByStore,
  PRICE_FILTERS,
  SORT_OPTIONS,
  sortDeals,
} from '../utils/catalog'
import { getGameKey } from '../utils/deals'

function mergeCatalogAndDeals(catalogResults, dealResults) {
  const map = new Map()

  catalogResults.forEach((game) => {
    map.set(getGameKey(game), game)
  })

  dealResults.forEach((game) => {
    map.set(getGameKey(game), game)
  })

  return Array.from(map.values())
}

function Offers({
  deals,
  error,
  getWishlistedGame,
  hasMoreDeals,
  initialSearch = '',
  isWishlisted,
  loading,
  loadingMore,
  onCreateAlert,
  onLoadMoreDeals,
  onOpenGame,
  onRefreshDeals,
  onToggleWishlist,
  warning,
}) {
  const [search, setSearch] = useState(initialSearch)
  const [storeFilter, setStoreFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [discountFilter, setDiscountFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dealRating')
  const [catalogResults, setCatalogResults] = useState([])
  const [catalogQuery, setCatalogQuery] = useState('')
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(24)
  const [animatedBatchStart, setAnimatedBatchStart] = useState(null)

  useEffect(() => {
    const term = search.trim()

    if (term.length < 2) {
      return undefined
    }

    let active = true

    const timer = window.setTimeout(async () => {
      try {
        setCatalogLoading(true)
        const results = await searchGames(term)
        if (active) {
          setCatalogQuery(term)
          setCatalogResults(results)
        }
      } catch {
        if (active) {
          setCatalogQuery(term)
          setCatalogResults([])
        }
      } finally {
        if (active) setCatalogLoading(false)
      }
    }, 350)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [search])

  const filteredDeals = useMemo(() => {
    const term = search.trim()
    const searchedDeals = filterBySearch(deals, term)
    const sourceDeals = term.length >= 2 && catalogQuery === term
      ? mergeCatalogAndDeals(catalogResults, searchedDeals)
      : deals

    const filtered = filterByDiscount(
      filterByPrice(
        filterBySearch(filterByStore(sourceDeals, storeFilter), search),
        priceFilter
      ),
      discountFilter
    )

    return sortDeals(filtered, sortBy)
  }, [catalogQuery, catalogResults, deals, discountFilter, priceFilter, search, sortBy, storeFilter])
  const visibleDeals = filteredDeals.slice(0, visibleCount)
  const hasHiddenResults = visibleDeals.length < filteredDeals.length

  function handleSearchChange(event) {
    setSearch(event.target.value)
    setVisibleCount(24)
    setAnimatedBatchStart(null)
  }

  function handleStoreChange(value) {
    setStoreFilter(value)
    setVisibleCount(24)
    setAnimatedBatchStart(null)
  }

  function handlePriceChange(value) {
    setPriceFilter(value)
    setVisibleCount(24)
    setAnimatedBatchStart(null)
  }

  function handleDiscountChange(value) {
    setDiscountFilter(value)
    setVisibleCount(24)
    setAnimatedBatchStart(null)
  }

  async function handleLoadMoreResults() {
    if (hasHiddenResults) {
      setAnimatedBatchStart(visibleCount)
      setVisibleCount((current) => current + 24)
      return
    }

    if (!search.trim() && hasMoreDeals) {
      const currentCount = visibleDeals.length
      await onLoadMoreDeals()
      setAnimatedBatchStart(currentCount)
      setVisibleCount((current) => current + 24)
    }
  }

  const canLoadMore = hasHiddenResults || (!search.trim() && hasMoreDeals)

  return (
    <>
      <header className="page-heading offers-heading">
        <div>
            <span className="tag">Catálogo PC</span>
            <h2>Ofertas de jogos</h2>
            <p>
            Filtre promoções por loja, preço e desconto. A busca também traz
            jogos do catálogo da CheapShark mesmo quando não há desconto ativo.
            </p>
        </div>

        <button onClick={onRefreshDeals} type="button">Atualizar</button>
      </header>

      <section className="catalog-panel">
        <form className="search catalog-search" onSubmit={(event) => event.preventDefault()}>
          <span className="search-icon">Search</span>
          <input
            placeholder="Buscar no catálogo..."
            value={search}
            onChange={handleSearchChange}
          />
        </form>

        <button
          aria-expanded={filtersOpen}
          className="mobile-filters-trigger"
          onClick={() => setFiltersOpen((current) => !current)}
          type="button"
        >
          <span>Filtros e ordenação</span>
          <strong>{filtersOpen ? 'Fechar' : 'Abrir'}</strong>
        </button>

        <div className={`filter-row${filtersOpen ? ' mobile-open' : ''}`}>
          <div className="store-filter-group">
            <StoreSelector
              label="Loja"
              onChange={handleStoreChange}
              options={STORE_FILTERS}
              value={storeFilter}
            />
          </div>
          <div>
            <small>Preço</small>
            <FilterTabs
              label="Preço"
              onChange={handlePriceChange}
              options={PRICE_FILTERS}
              value={priceFilter}
            />
          </div>
          <div>
            <small>Desconto</small>
            <FilterTabs
              label="Desconto"
              onChange={handleDiscountChange}
              options={DISCOUNT_FILTERS}
              value={discountFilter}
            />
          </div>
          <div className="sort-filter-group">
            <StoreSelector
              className="sort-select"
              label="Ordenar por"
              onChange={setSortBy}
              options={SORT_OPTIONS}
              value={sortBy}
            />
          </div>
        </div>

        <div className="catalog-meta">
          <strong>
            {filteredDeals.length} {search.trim() ? 'resultados encontrados' : 'ofertas encontradas'}
          </strong>
          {catalogLoading && <span>Buscando no catálogo...</span>}
        </div>
      </section>

      {loading && <p className="status-message">Carregando ofertas...</p>}
      {catalogLoading && !loading && <p className="status-message">Buscando jogos fora de promoção...</p>}
      {warning && !loading && <p className="status-message warning">{warning}</p>}
      {error && !loading && <p className="status-message error">{error}</p>}

      {!loading && !error && filteredDeals.length === 0 && (
        <p className="status-message">Nenhuma oferta encontrada com esses filtros.</p>
      )}

      {!loading && !error && filteredDeals.length > 0 && (
        <>
          <section className="games-grid offers-grid">
            {visibleDeals.map((game, index) => (
              <GameCard
                animateIn={animatedBatchStart !== null && index >= animatedBatchStart}
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

          {canLoadMore && (
            <div className="load-more-row">
              <button
                className="load-more-button"
                disabled={loadingMore}
                onClick={handleLoadMoreResults}
                type="button"
              >
                {loadingMore
                  ? 'Carregando...'
                  : search.trim()
                    ? 'Mostrar mais jogos'
                    : 'Carregar mais ofertas'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default Offers
