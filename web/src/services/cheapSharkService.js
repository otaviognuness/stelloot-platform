const BASE_URL = 'https://www.cheapshark.com/api/1.0'

export async function getDeals(pageSize = 8) {
  const response = await fetch(
    `${BASE_URL}/deals?pageSize=${pageSize}&sortBy=DealRating&desc=1&upperPrice=60`
  )

  if (!response.ok) {
    throw new Error('Erro ao buscar promoções')
  }

  return response.json()
}

export async function searchDeals(title) {
  const response = await fetch(
    `${BASE_URL}/deals?title=${encodeURIComponent(title)}&pageSize=24&sortBy=DealRating&desc=1`
  )

  if (!response.ok) {
    throw new Error('Erro ao buscar jogos')
  }

  return response.json()
}