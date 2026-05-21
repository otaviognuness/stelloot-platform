import { getStoreName } from '../config/stores'

export const USD_TO_BRL_RATE = 5.35

const EDITION_WORDS = [
  'complete',
  'deluxe',
  'definitive',
  'directors',
  'enhanced',
  'game of the year',
  'gold',
  'goty',
  'legacy',
  'premium',
  'standard',
  'ultimate',
]

export function formatDollar(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'USD',
  })
}

export function dollarToBRL(value) {
  return Number(value || 0) * USD_TO_BRL_RATE
}

export function formatBRLFromDollar(value) {
  return dollarToBRL(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function getDealUrl(dealID) {
  return `https://www.cheapshark.com/redirect?dealID=${dealID}`
}

export function getGameKey(game) {
  return String(game?.gameID || game?.steamAppID || normalizeTitle(game?.title || ''))
}

export function normalizeTitle(title = '') {
  const normalized = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[''`]/g, '')
    .replace(/\b(v)\b/g, '5')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(grand theft auto|gta)\s+5\b/g, 'grand theft auto 5')
    .trim()

  return EDITION_WORDS.reduce(
    (result, word) => result.replace(new RegExp(`\\b${word}\\b`, 'g'), ''),
    normalized
  )
    .replace(/\bedition\b|\bcut\b|\bbundle\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isSameKnownGame(dealTitle, game) {
  const dealKey = normalizeTitle(dealTitle)
  const acceptedTitles = [game.title, game.query, ...(game.aliases || [])]
    .filter(Boolean)
    .map(normalizeTitle)

  return acceptedTitles.some((titleKey) => dealKey === titleKey)
}

function getSearchRelevance(dealTitle, searchTitle) {
  if (!searchTitle) return 0

  const dealKey = normalizeTitle(dealTitle)
  const searchKey = normalizeTitle(searchTitle)

  if (dealKey === searchKey) return 0
  if (dealKey.startsWith(`${searchKey} `)) return 1
  if (dealKey.includes(searchKey)) return 2
  return 3
}

export function hasRealDiscount(deal) {
  return Number(deal.savings || 0) > 0 && Number(deal.salePrice || 0) > 0
}

export function pickBetterDeal(currentDeal, nextDeal) {
  if (!currentDeal) return nextDeal

  const currentPrice = Number(currentDeal.salePrice || Number.MAX_VALUE)
  const nextPrice = Number(nextDeal.salePrice || Number.MAX_VALUE)

  if (nextPrice !== currentPrice) {
    return nextPrice < currentPrice ? nextDeal : currentDeal
  }

  const currentSavings = Number(currentDeal.savings || 0)
  const nextSavings = Number(nextDeal.savings || 0)

  if (nextSavings !== currentSavings) {
    return nextSavings > currentSavings ? nextDeal : currentDeal
  }

  return Number(nextDeal.dealRating || 0) > Number(currentDeal.dealRating || 0)
    ? nextDeal
    : currentDeal
}

export function enhanceDeal(deal) {
  return {
    ...deal,
    storeName: getStoreName(deal.storeID),
    dealUrl: getDealUrl(deal.dealID),
  }
}

export function selectBestDeals(deals, limit = 24, { searchTitle = '' } = {}) {
  const bestDeals = deals.filter(hasRealDiscount).reduce((acc, deal) => {
    const key = normalizeTitle(deal.title)
    acc.set(key, pickBetterDeal(acc.get(key), deal))
    return acc
  }, new Map())

  return Array.from(bestDeals.values())
    .map(enhanceDeal)
    .sort((a, b) => {
      const relevance =
        getSearchRelevance(a.title, searchTitle) -
        getSearchRelevance(b.title, searchTitle)

      if (relevance !== 0) return relevance

      return Number(b.savings || 0) - Number(a.savings || 0)
    })
    .slice(0, limit)
}
