import { STORE_FILTERS } from '../config/stores'
import { selectBestDeals } from '../utils/deals'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const CACHE_KEY = 'stelloot:backend:pc-deals'
const CACHE_TTL = 1000 * 60 * 12
const DEFAULT_STORES = ['1', '25']

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

async function fetchBackendDeals(params) {
  const response = await fetch(buildApiUrl('/deals', params))

  if (!response.ok) {
    throw new Error('Erro ao buscar ofertas no backend')
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
      storeID: DEFAULT_STORES.join(','),
      pageSize: 60,
      sortBy: 'DealRating',
      forceRefresh,
    })
    const deals = selectBestDeals(data, 60)

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
        warning: 'Usando ofertas salvas porque o backend não respondeu agora.',
      }
    }

    throw error
  }
}

export async function searchDeals(title) {
  const data = await fetchBackendDeals({
    title,
    storeID: DEFAULT_STORES.join(','),
    pageSize: 60,
    sortBy: 'DealRating',
  })

  return selectBestDeals(data, 60, { searchTitle: title })
}
