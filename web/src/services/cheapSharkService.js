import { STORE_FILTERS } from '../config/stores'
import { selectBestDeals } from '../utils/deals'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const CACHE_KEY = 'stelloot:backend:pc-deals:v2'
const CACHE_TTL = 1000 * 60 * 12

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

export async function getPcDeals({ forceRefresh = false } = {}) {
  const cached = readCachedDeals()
  const hasFreshCache = cached && Date.now() - cached.createdAt < CACHE_TTL

  if (!forceRefresh && hasFreshCache) {
    return {
      deals: cached.deals,
      fromCache: true,
      updatedAt: cached.createdAt,
    }
  }

  try {
    const data = await fetchBackendDeals({
      pageSize: 60,
      allPages: true,
      maxPages: 0,
      sortBy: 'DealRating',
      forceRefresh,
    })
    const deals = selectBestDeals(data)

    writeCachedDeals(deals)

    return {
      deals,
      fromCache: false,
      updatedAt: Date.now(),
    }
  } catch (error) {
    if (cached?.deals?.length) {
      return {
        deals: cached.deals,
        fromCache: true,
        updatedAt: cached.createdAt,
        warning: 'Usando ofertas salvas porque o backend nao respondeu agora.',
      }
    }

    throw error
  }
}

export async function searchDeals(title) {
  const data = await fetchBackendDeals({
    title,
    pageSize: 60,
    allPages: true,
    maxPages: 0,
    sortBy: 'DealRating',
  })

  return selectBestDeals(data, undefined, { searchTitle: title })
}

export async function searchGames(title) {
  const data = await fetchBackendDeals({
    title,
    limit: 60,
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
    storeName: 'Catalogo CheapShark',
    dealUrl: game.cheapestDealID
      ? `https://www.cheapshark.com/redirect?dealID=${game.cheapestDealID}`
      : 'https://www.cheapshark.com/',
    catalogOnly: true,
  }))
}
