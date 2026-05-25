import { STORE_FILTERS } from '../config/stores'
import { selectBestDeals } from '../utils/deals'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const CACHE_KEY = 'stelloot:backend:pc-deals:v3'
const CACHE_TTL = 1000 * 60 * 12
export const DEALS_PAGE_SIZE = 24

function buildApiUrl(path, params) {
  const url = new URL(`${API_BASE_URL}${path}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  return url.toString()
}

function readCachedDeals() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))

    if (!cached?.deals?.length) return null

    return cached
  } catch {
    return null
  }
}

function writeCachedDeals(deals) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      createdAt: Date.now(),
      deals,
    })
  )
}

async function fetchBackendDeals(params, path = '/deals') {
  const response = await fetch(buildApiUrl(path, params))

  if (!response.ok) {
    throw new Error('Erro ao buscar dados no backend')
  }

  return response.json()
}

export { STORE_FILTERS }

export function getCachedPcDeals() {
  return readCachedDeals()?.deals || []
}

export async function getPcDeals({ forceRefresh = false, pageNumber = 0 } = {}) {
  const isFirstPage = pageNumber === 0
  const cached = isFirstPage ? readCachedDeals() : null
  const hasFreshCache = cached && Date.now() - cached.createdAt < CACHE_TTL

  if (!forceRefresh && hasFreshCache) {
    return {
      deals: cached.deals,
      fromCache: true,
      hasMore: true,
      pageNumber: 0,
      updatedAt: cached.createdAt,
    }
  }

  try {
    const data = await fetchBackendDeals({
      pageSize: DEALS_PAGE_SIZE,
      pageNumber,
      sortBy: 'DealRating',
      forceRefresh: isFirstPage && forceRefresh,
    })
    const deals = selectBestDeals(data)

    if (isFirstPage) {
      writeCachedDeals(deals)
    }

    return {
      deals,
      fromCache: false,
      hasMore: data.length >= DEALS_PAGE_SIZE,
      pageNumber,
      updatedAt: Date.now(),
    }
  } catch (error) {
    if (cached?.deals?.length) {
      return {
        deals: cached.deals,
        fromCache: true,
        hasMore: true,
        pageNumber: 0,
        updatedAt: cached.createdAt,
        warning: 'Usando ofertas salvas porque o backend não respondeu agora.',
      }
    }

    throw error
  }
}

export async function searchDeals(title, pageNumber = 0) {
  const data = await fetchBackendDeals({
    title,
    pageSize: DEALS_PAGE_SIZE,
    pageNumber,
    sortBy: 'DealRating',
  })

  return selectBestDeals(data, undefined, { searchTitle: title })
}

export async function searchGames(title) {
  const data = await fetchBackendDeals({
    title,
    limit: 30,
  }, '/games/search')

  return data.map((game) => ({
    gameID: game.gameID,
    steamAppID: game.steamAppID,
    dealID: game.cheapestDealID || `catalog-${game.gameID}`,
    storeID: 'catalog',
    title: game.external,
    salePrice: game.cheapest || '0',
    normalPrice: game.cheapest || '0',
    savings: '0',
    dealRating: '0',
    steamRatingText: '',
    thumb: game.thumb,
    storeName: 'Catálogo CheapShark',
    dealUrl: game.cheapestDealID
      ? `https://www.cheapshark.com/redirect?dealID=${game.cheapestDealID}`
      : 'https://www.cheapshark.com/',
    catalogOnly: true,
  }))
}
