import { useEffect, useState } from 'react'
import GameCard from '../components/GameCard'
import { getDeals, searchDeals } from '../services/cheapSharkService'

function Home({ onLogin }) {
  const [games, setGames] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAll, setShowAll] = useState(false)

  async function loadDeals(limit = 8) {
    try {
      setLoading(true)
      setError('')

      const data = await getDeals(limit)
      setGames(data)
      setShowAll(limit > 8)
    } catch {
      setError('Erro ao carregar promoções.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(event) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      const data = search.trim()
        ? await searchDeals(search)
        : await getDeals(8)

      setGames(data)
      setShowAll(false)
    } catch {
      setError('Erro ao buscar jogo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeals(8)
  }, [])

  return (
    <>
      <header className="topbar">
        <form className="search" onSubmit={handleSearch}>
          <span>🔎</span>
          <input
            placeholder="Buscar jogo ou promoção..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <button onClick={onLogin}>Entrar</button>
      </header>

      <section className="hero">
        <div>
          <span className="tag">Ofertas em tempo real</span>
          <h2>Encontre o menor preço dos seus jogos favoritos</h2>
          <p>
            Compare promoções, salve jogos na wishlist e crie alertas de preço
            em uma plataforma gamer.
          </p>

          <div className="hero-actions">
            <button onClick={() => loadDeals(8)}>Ver promoções</button>
            <button className="secondary">Criar alerta</button>
          </div>
        </div>

        <div className="hero-card">
          <span>🔥 Maior desconto</span>
          <strong>
            {games[0]
              ? `-${Math.round(Number(games[0].savings || 0))}%`
              : '-0%'}
          </strong>
          <p>{games[0]?.title || 'Carregando...'}</p>
        </div>
      </section>

      <section className="section-title">
        <div>
          <h3>{search ? `Resultado para "${search}"` : 'Melhores ofertas'}</h3>
          <p>Jogos com os maiores descontos encontrados hoje.</p>
        </div>

        <button className="see-all-button" onClick={() => loadDeals(24)}>
          {showAll ? 'Atualizar' : 'Ver todos'}
        </button>
      </section>

      {loading && <p>Carregando promoções...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <section className="games-grid">
          {games.map((game) => (
            <GameCard game={game} key={game.dealID} />
          ))}
        </section>
      )}
    </>
  )
}

export default Home