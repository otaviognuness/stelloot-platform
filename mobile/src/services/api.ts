import { Deal, Session, User } from '@/src/types/api';
import { deduplicateDeals, enrichDeal, getGameKey } from '@/src/utils/deals';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
export const PAGE_SIZE = 20;

type WishlistResponse = {
  catalogOnly?: boolean;
  dealId?: string;
  displayTitle?: string;
  externalGameId: string;
  id: number;
  normalPrice?: number;
  salePrice?: number;
  savings?: number;
  steamAppId?: string;
  storeId?: string;
  targetPrice?: number;
  thumb?: string;
  title: string;
};

async function request<T>(path: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || Object.values(data || {})[0] || 'Não foi possível concluir a ação.';
    throw new Error(String(message));
  }

  return data as T;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function mapWishlistItem(item: WishlistResponse): Deal {
  return enrichDeal({
    catalogOnly: item.catalogOnly,
    dealID: item.dealId || `wishlist-${item.id}`,
    displayTitle: item.displayTitle,
    gameID: item.externalGameId,
    normalPrice: String(item.normalPrice || 0),
    salePrice: String(item.salePrice || 0),
    savings: String(item.savings || 0),
    steamAppID: item.steamAppId,
    storeID: item.storeId || 'catalog',
    targetPrice: item.targetPrice,
    thumb: item.thumb,
    title: item.title,
    wishlistId: item.id,
  });
}

function toWishlistPayload(game: Deal, targetPrice?: number) {
  return {
    catalogOnly: Boolean(game.catalogOnly),
    dealId: game.dealID,
    displayTitle: game.displayTitle,
    externalGameId: getGameKey(game),
    normalPrice: Number(game.normalPrice || 0),
    salePrice: Number(game.salePrice || 0),
    savings: Number(game.savings || 0),
    steamAppId: game.steamAppID,
    storeId: game.storeID,
    targetPrice: targetPrice ?? game.targetPrice,
    thumb: game.thumb,
    title: game.title,
  };
}

export async function login(email: string, password: string) {
  return request<Session>('/auth/login', {
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
}

export async function register(username: string, email: string, password: string) {
  return request<Session>('/auth/register', {
    body: JSON.stringify({ email, password, username }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
}

export async function getCurrentUser(token: string) {
  return request<User>('/auth/me', { headers: authHeaders(token) });
}

export async function getDeals(pageNumber = 0) {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(PAGE_SIZE),
    sortBy: 'DealRating',
  });
  const deals = await request<Deal[]>(`/deals?${params.toString()}`);
  return deduplicateDeals(deals);
}

export async function searchCatalog(title: string) {
  const params = new URLSearchParams({ limit: '30', title });
  const games = await request<{
    cheapest?: string;
    cheapestDealID?: string;
    external: string;
    gameID: string;
    steamAppID?: string;
    thumb?: string;
  }[]>(`/games/search?${params.toString()}`);

  return games.map((game) => enrichDeal({
    catalogOnly: true,
    dealID: game.cheapestDealID || `catalog-${game.gameID}`,
    gameID: game.gameID,
    normalPrice: game.cheapest || '0',
    salePrice: game.cheapest || '0',
    savings: '0',
    steamAppID: game.steamAppID,
    storeID: 'catalog',
    thumb: game.thumb,
    title: game.external,
  }));
}

export async function getWishlist(token: string) {
  const items = await request<WishlistResponse[]>('/wishlist', { headers: authHeaders(token) });
  return items.map(mapWishlistItem);
}

export async function saveWishlist(token: string, game: Deal, targetPrice?: number) {
  const item = await request<WishlistResponse>('/wishlist', {
    body: JSON.stringify(toWishlistPayload(game, targetPrice)),
    headers: authHeaders(token),
    method: 'POST',
  });
  return mapWishlistItem(item);
}

export async function updateTargetPrice(token: string, wishlistId: number, targetPrice: number) {
  const item = await request<WishlistResponse>(`/wishlist/${wishlistId}/target-price`, {
    body: JSON.stringify({ targetPrice }),
    headers: authHeaders(token),
    method: 'PATCH',
  });
  return mapWishlistItem(item);
}

export async function removeWishlist(token: string, wishlistId: number) {
  const response = await fetch(`${API_URL}/wishlist/${wishlistId}`, {
    headers: authHeaders(token),
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Não foi possível remover este jogo.');
  }
}
