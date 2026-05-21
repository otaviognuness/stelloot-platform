export const STORE_NAMES = {
  1: 'Steam',
  2: 'GamersGate',
  3: 'Green Man Gaming',
  7: 'GOG',
  8: 'Origin',
  11: 'Humble Store',
  13: 'Ubisoft Store',
  15: 'Fanatical',
  21: 'WinGameStore',
  23: 'GameBillet',
  24: 'Voidu',
  25: 'Epic Games Store',
  27: 'Gamesplanet',
  28: 'Gamesload',
  29: '2Game',
  30: 'IndieGala',
  31: 'Blizzard Shop',
  33: 'DLGamer',
  34: 'Noctre',
  35: 'DreamGame',
}

export const STORE_FILTERS = [
  { id: 'all', label: 'Todas', storeIDs: ['1', '25'] },
  { id: 'steam', label: 'Steam', storeIDs: ['1'] },
  { id: 'epic', label: 'Epic', storeIDs: ['25'] },
]

export function getStoreFilter(filterId = 'all') {
  return STORE_FILTERS.find((filter) => filter.id === filterId) || STORE_FILTERS[0]
}

export function getStoreName(storeID) {
  return STORE_NAMES[storeID] || `Loja #${storeID}`
}
