import { useState } from 'react'
import './App.css'
import logo from './assets/logo1.png'
import LoginCard from './components/LoginCard'

const games = [
  { title: 'Cyberpunk 2077', store: 'Steam', price: 'R$ 79,90', oldPrice: 'R$ 199,90', discount: '-60%' },
  { title: 'Elden Ring', store: 'Nuuvem', price: 'R$ 149,90', oldPrice: 'R$ 249,90', discount: '-40%' },
  { title: 'Hades II', store: 'Epic Games', price: 'R$ 62,90', oldPrice: 'R$ 89,90', discount: '-30%' },
  { title: 'The Witcher 3', store: 'GOG', price: 'R$ 19,99', oldPrice: 'R$ 99,99', discount: '-80%' },
]

function App() {
  const [page, setPage] = useState('home')

  return (
    <main className={page === 'login' ? 'app login-layout' : 'app'}>
      {page === 'home' && (
        <aside className="sidebar">
          <div className="brand" onClick={() => setPage('home')}>
            <img src={logo} alt="Logo StelLoot" />
            <h1>StelLoot</h1>
          </div>

          <nav>
            <a href="#" onClick={() => setPage('home')}>Explorar</a>
            <a href="#">Ofertas</a>
            <a href="#">Wishlist</a>
            <a href="#">Alertas</a>
            <a href="#">Dashboard</a>
          </nav>
        </aside>
      )}

      <section className="content">
        {page === 'home' ? (
          <>
            <header className="topbar">
              <div className="search">
                <span>🔎</span>
                <input placeholder="Buscar jogo ou promoção..." />
              </div>

              <button onClick={() => setPage('login')}>Entrar</button>
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
                  <button>Ver promoções</button>
                  <button className="secondary">Criar alerta</button>
                </div>
              </div>

              <div className="hero-card">
                <span>🔥 Maior desconto</span>
                <strong>-80%</strong>
                <p>The Witcher 3</p>
              </div>
            </section>

            <section className="section-title">
              <div>
                <h3>Melhores ofertas</h3>
                <p>Jogos com os maiores descontos encontrados hoje.</p>
              </div>

              <a href="#">Ver todos</a>
            </section>

            <section className="games-grid">
              {games.map((game) => (
                <article className="game-card" key={game.title}>
                  <div className="game-cover">
                    <span>{game.discount}</span>
                  </div>

                  <div className="game-info">
                    <small>{game.store}</small>
                    <h4>{game.title}</h4>

                    <div className="prices">
                      <strong>{game.price}</strong>
                      <span>{game.oldPrice}</span>
                    </div>

                    <button>Adicionar à wishlist</button>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : (
          <LoginCard onBack={() => setPage('home')} />
        )}
      </section>
    </main>
  )
}

export default App