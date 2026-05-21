import { useMemo, useState } from 'react'
import FilterTabs from '../components/FilterTabs'
import GameCard from '../components/GameCard'
import { STORE_FILTERS } from '../config/stores'
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

function Offers({
  deals,
  error,
  isWishlisted,
  loading,
  onCreateAlert,
  onOpenGame,
  onRefreshDeals,
  onToggleWishlist,
  warning,
}) {
  const [search, setSearch] = useState('')
  const [storeFilter, setStoreFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [discountFilter, setDiscountFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dealRating')

  const filteredDeals = useMemo(() => {
    const filtered = filterByDiscount(
      filterByPrice(
        filterBySearch(filterByStore(deals, storeFilter), search),
        priceFilter
      ),
      discountFilter
    )

    return sortDeals(filtered, sortBy)
  }, [deals, discountFilter, priceFilter, search, sortBy, storeFilter])

  return (
    <>
      <header className="page-heading">
        <div>
          <span className="tag">Catálogo PC</span>
          <h2>Ofertas de jogos</h2>
          <p>
            Filtre promoções por loja, preço e desconto. Os valores em reais são
            estimados a partir do preço em dólar.
          </p>
        </div>

        <button onClick={onRefreshDeals} type="button">Atualizar</button>
      </header>

      <section className="catalog-panel">
        <form className="search catalog-search" onSubmit={(event) => event.preventDefault()}>
          <span className="search-icon">⌕</span>
          <input
            placeholder="Buscar no catálogo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </form>

        <div className="filter-row">
          <div>
            <small>Loja</small>
            <FilterTabs
              label="Loja"
              onChange={setStoreFilter}
              options={STORE_FILTERS}
              value={storeFilter}
            />
          </div>
          <div>
            <small>Preço</small>
            <FilterTabs
              label="Preço"
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
          <strong>{filteredDeals.length} ofertas encontradas</strong>
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
            />
          ))}
        </section>
      )}
    </>
  )
}

export default Offers
