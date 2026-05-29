import { getStoreName } from '../config/stores'

export const USD_TO_BRL_RATE = 5.35

// Limite máximo razoável em USD — qualquer coisa acima disso é dado corrompido
const MAX_PRICE_USD = 200

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

/**
 * Converte qualquer valor recebido da API num número USD confiável.
 * Lida com strings formatadas ("1,999.99"), vírgulas, espaços e valores absurdos.
 */
export function parsePrice(value) {
  if (value === null || value === undefined || value === '') return 0

  const raw = String(value)
    .trim()
    .replace(/[^0-9.,]/g, '')   // remove tudo que não é dígito, ponto ou vírgula

  // Se tiver vírgula E ponto, a vírgula é separador de milhar → remove
  // Se tiver só vírgula, trata como separador decimal (pt-BR)
  const normalized = raw.includes('.') && raw.includes(',')
    ? raw.replace(/,/g, '')
    : raw.replace(',', '.')

  const parsed = parseFloat(normalized)

  if (!Number.isFinite(parsed) || parsed < 0) return 0
  if (parsed > MAX_PRICE_USD) return 0   // valor absurdo da API → ignora

  return parsed
}

export function dollarToBRL(value) {
  return parsePrice(value) * USD_TO_BRL_RATE
}

export function formatDollar(value) {
  return parsePrice(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'USD',
  })
}

export function formatBRLFromDollar(value) {
  const brl = dollarToBRL(value)
  if (brl <= 0) return '—'
  return brl.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function getDealUrl(dealID) {
  return `https://www.cheapshark.com/redirect?dealID=${dealID}`
}

export function getGameArtwork(game) {
  if (game?.steamAppID) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steamAppID}/header.jpg`
  }
  return game?.thumb || ''
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
  return parsePrice(deal.savings) > 0 && parsePrice(deal.salePrice) > 0
}

export function pickBetterDeal(currentDeal, nextDeal) {
  if (!currentDeal) return nextDeal

  const currentPrice = parsePrice(currentDeal.salePrice) || Number.MAX_VALUE
  const nextPrice = parsePrice(nextDeal.salePrice) || Number.MAX_VALUE

  if (nextPrice !== currentPrice) {
    return nextPrice < currentPrice ? nextDeal : currentDeal
  }

  const currentSavings = parsePrice(currentDeal.savings)
  const nextSavings = parsePrice(nextDeal.savings)

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

export function selectBestDeals(deals, limit, { searchTitle = '' } = {}) {
  const bestDeals = deals.filter(hasRealDiscount).reduce((acc, deal) => {
    const key = normalizeTitle(deal.title)
    acc.set(key, pickBetterDeal(acc.get(key), deal))
    return acc
  }, new Map())

  const sortedDeals = Array.from(bestDeals.values())
    .map(enhanceDeal)
    .sort((a, b) => {
      const relevance =
        getSearchRelevance(a.title, searchTitle) -
        getSearchRelevance(b.title, searchTitle)

      if (relevance !== 0) return relevance

      return parsePrice(b.savings) - parsePrice(a.savings)
    })

  return Number.isFinite(limit) ? sortedDeals.slice(0, limit) : sortedDeals
}