import { POPULAR_GAMES } from '../config/popularGames'
import { getStoreFilter } from '../config/stores'
import { dollarToBRL, isSameKnownGame } from './deals'

export const PRICE_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'under50', label: 'Ate R$50', max: 50 },
  { id: 'under100', label: 'Ate R$100', max: 100 },
  { id: 'under150', label: 'Ate R$150', max: 150 },
]

export const DISCOUNT_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: '50', label: '50%+' },
  { id: '75', label: '75%+' },
  { id: '90', label: '90%+' },
]

export const SORT_OPTIONS = [
  { id: 'dealRating', label: 'Populares' },
  { id: 'price', label: 'Menor preco' },
  { id: 'discount', label: 'Maior desconto' },
  { id: 'title', label: 'A-Z' },
]

export function getPopularRank(game) {
  const index = POPULAR_GAMES.findIndex((popularGame) =>
    isSameKnownGame(game.displayTitle || game.title, popularGame)
  )

  return index === -1 ? 999 : index
}

export function filterByStore(deals, storeFilter) {
  if (!storeFilter || storeFilter === 'featured') return deals

  const selectedStore = getStoreFilter(storeFilter)
  if (!selectedStore.storeIDs.length) return deals

  return deals.filter((deal) => selectedStore.storeIDs.includes(String(deal.storeID)))
}

export function filterBySearch(deals, search) {
  const term = search.trim().toLowerCase()

  if (!term) return deals

  return deals.filter((deal) =>
    (deal.displayTitle || deal.title).toLowerCase().includes(term)
  )
}

export function filterByPrice(deals, priceFilter) {
  const filter = PRICE_FILTERS.find((item) => item.id === priceFilter)

  if (!filter?.max) return deals

  return deals.filter((deal) => dollarToBRL(deal.salePrice) <= filter.max)
}

export function filterByDiscount(deals, discountFilter) {
  const minimum = Number(discountFilter || 0)

  if (!minimum) return deals

  return deals.filter((deal) => Number(deal.savings || 0) >= minimum)
}

export function sortDeals(deals, sortBy) {
  return [...deals].sort((a, b) => {
    if (sortBy === 'price') {
      return Number(a.salePrice || 0) - Number(b.salePrice || 0)
    }

    if (sortBy === 'discount') {
      return Number(b.savings || 0) - Number(a.savings || 0)
    }

    if (sortBy === 'title') {
      return (a.displayTitle || a.title).localeCompare(b.displayTitle || b.title)
    }

    return Number(b.dealRating || 0) - Number(a.dealRating || 0)
  })
}
