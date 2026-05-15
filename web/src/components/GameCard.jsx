const stores = {
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

function formatDollar(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'USD',
  })
}

function GameCard({ game }) {
  const discount = Math.round(Number(game.savings || 0))
  const storeName = stores[game.storeID] || `Loja #${game.storeID}`

  return (
    <article className="game-card">
      <div
        className="game-cover"
        style={{ backgroundImage: `url(${game.thumb})` }}
      >
        <span>-{discount}%</span>
      </div>

      <div className="game-info">
        <small>{storeName}</small>
        <h4>{game.title}</h4>

        <div className="prices">
          <strong>{formatDollar(game.salePrice)}</strong>
          <span>{formatDollar(game.normalPrice)}</span>
        </div>

        <button>Adicionar à wishlist</button>
      </div>
    </article>
  )
}

export default GameCard