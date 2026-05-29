import { Deal } from '@/src/types/api';

export const USD_TO_BRL_RATE = 5.35;

const storeNames: Record<string, string> = {
  '1': 'Steam',
  '2': 'GamersGate',
  '3': 'Green Man Gaming',
  '7': 'GOG',
  '8': 'Origin',
  '11': 'Humble',
  '13': 'Ubisoft Store',
  '15': 'Fanatical',
  '21': 'WinGameStore',
  '23': 'GameBillet',
  '24': 'Voidu',
  '25': 'Epic Games',
  '27': 'Gamesplanet',
  '28': 'Gamesload',
  '29': '2Game',
  '30': 'IndieGala',
  '31': 'Blizzard Shop',
  '33': 'DLGamer',
  '34': 'Noctre',
  '35': 'DreamGame',
  catalog: 'Catálogo',
};

export function getStoreName(storeId?: string) {
  return storeNames[storeId || ''] || 'Loja PC';
}

export function formatBRL(value?: string | number) {
  return (Number(value || 0) * USD_TO_BRL_RATE).toLocaleString('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  });
}

export function formatBRLValue(value?: string | number) {
  return Number(value || 0).toLocaleString('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  });
}

export function formatUSD(value?: string | number) {
  return Number(value || 0).toLocaleString('pt-BR', {
    currency: 'USD',
    style: 'currency',
  });
}

export function getArtwork(game: Deal) {
  return game.steamAppID
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steamAppID}/header.jpg`
    : game.thumb || '';
}

export function getDealUrl(dealId?: string) {
  return dealId ? `https://www.cheapshark.com/redirect?dealID=${dealId}` : 'https://www.cheapshark.com/';
}

export function getGameKey(game: Deal) {
  return String(game.gameID || game.steamAppID || game.title.toLowerCase());
}

export function enrichDeal(game: Deal): Deal {
  return { ...game, storeName: getStoreName(game.storeID) };
}

export function deduplicateDeals(deals: Deal[]) {
  const bestDeals = new Map<string, Deal>();

  deals.forEach((deal) => {
    if (Number(deal.salePrice || 0) <= 0) return;
    const key = deal.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const current = bestDeals.get(key);
    if (!current || Number(deal.salePrice) < Number(current.salePrice)) {
      bestDeals.set(key, enrichDeal(deal));
    }
  });

  return Array.from(bestDeals.values());
}
