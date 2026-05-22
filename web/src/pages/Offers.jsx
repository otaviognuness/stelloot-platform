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
  initialSearch = '',
  isWishlisted,
  loading,
  onCreateAlert,
  onOpenGame,
  onRefreshDeals,
  onToggleWishlist,
  warning,
}) {
  const [search, setSearch] = useState(initialSearch)
  const [storeFilter, setStoreFilter] = useState('featured')
  const [priceFilter, setPriceFilter] = useState('all')
  const [discountFilter, setDiscountFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dealRating')
  const [catalogResults, setCatalogResults] = useState([])
  const [catalogQuery, setCatalogQuery] = useState('')
  const [catalogLoading, setCatalogLoading] = useState(false)

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

  return (
    <>
      <header className="page-heading">
        <div>
            <span className="tag">Catalogo PC</span>
            <h2>Ofertas de jogos</h2>
            <p>
            Filtre promocoes por loja, preco e desconto. A busca tambem traz
            jogos do catalogo da CheapShark mesmo quando nao ha desconto ativo.
            </p>
        </div>

        <button onClick={onRefreshDeals} type="button">Atualizar</button>
      </header>

      <section className="catalog-panel">
        <form className="search catalog-search" onSubmit={(event) => event.preventDefault()}>
          <span className="search-icon">Search</span>
          <input
            placeholder="Buscar no catalogo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </form>

        <div className="filter-row">
          <div className="store-filter-group">
            <StoreSelector
              label="Loja"
              onChange={setStoreFilter}
              options={STORE_FILTERS}
              value={storeFilter}
            />
          </div>
          <div>
            <small>Preco</small>
            <FilterTabs
              label="Preco"
              onChange={setPriceFilter}
              options={PRICE_FILTERS}
              value={priceFilter}
            />
          </div>
          <div>
            <small>Desconto</small>
            <FilterTabs
              label="Desconto"
              onChange={setDiscountFilter}
              options={DISCOUNT_FILTERS}
              value={discountFilter}
            />
          </div>
        </div>

        <div className="catalog-meta">
          <strong>
            {filteredDeals.length} {search.trim() ? 'resultados encontrados' : 'ofertas encontradas'}
          </strong>
          {catalogLoading && <span>Buscando no catalogo...</span>}
          <label>
            Ordenar por
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {loading && <p className="status-message">Carregando ofertas...</p>}
      {catalogLoading && !loading && <p className="status-message">Buscando jogos fora de promocao...</p>}
      {warning && !loading && <p className="status-message warning">{warning}</p>}
      {error && !loading && <p className="status-message error">{error}</p>}

      {!loading && !error && filteredDeals.length === 0 && (
        <p className="status-message">Nenhuma oferta encontrada com esses filtros.</p>
      )}

      {!loading && !error && filteredDeals.length > 0 && (
        <section className="games-grid">
          {filteredDeals.map((game) => (
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

export default Offers
