import { getStoreName } from '../config/stores'
import { getDealUrl, getGameKey } from '../utils/deals'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function readResponse(response) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Falha ao sincronizar a wishlist')
  }

  return data
}

function toRequest(game, targetPrice) {
  return {
    externalGameId: getGameKey(game),
    dealId: game.dealID,
    storeId: game.storeID,
    steamAppId: game.steamAppID,
    title: game.title,
    displayTitle: game.displayTitle,
    thumb: game.thumb,
    salePrice: Number(game.salePrice || 0),
    normalPrice: Number(game.normalPrice || 0),
    savings: Number(game.savings || 0),
    targetPrice: targetPrice || game.targetPrice,
    catalogOnly: Boolean(game.catalogOnly),
  }
}

function toGame(item) {
  return {
    wishlistId: item.id,
    gameID: item.externalGameId,
    dealID: item.dealId || `wishlist-${item.id}`,
    storeID: item.storeId || 'catalog',
    steamAppID: item.steamAppId,
    title: item.title,
    displayTitle: item.displayTitle,
    thumb: item.thumb,
    salePrice: String(item.salePrice || 0),
    normalPrice: String(item.normalPrice || 0),
    savings: String(item.savings || 0),
    targetPrice: item.targetPrice,
    savedAt: item.savedAt,
    catalogOnly: Boolean(item.catalogOnly),
    storeName: getStoreName(item.storeId),
    dealUrl: item.dealId ? getDealUrl(item.dealId) : 'https://www.cheapshark.com/',
  }
}

export async function getWishlist(token) {
  const response = await fetch(`${API_BASE_URL}/wishlist`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await readResponse(response)
  return data.map(toGame)
}

export async function saveWishlistItem(token, game, targetPrice) {
  const response = await fetch(`${API_BASE_URL}/wishlist`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toRequest(game, targetPrice)),
  })

  return toGame(await readResponse(response))
}

export async function updateWishlistTargetPrice(token, wishlistId, targetPrice) {
  const response = await fetch(`${API_BASE_URL}/wishlist/${wishlistId}/target-price`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetPrice }),
  })

  return toGame(await readResponse(response))
}

export async function removeWishlistItem(token, wishlistId) {
  const response = await fetch(`${API_BASE_URL}/wishlist/${wishlistId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error('Falha ao remover item da wishlist')
  }
}
