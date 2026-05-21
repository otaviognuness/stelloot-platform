import GameCard from '../components/GameCard'

function Wishlist({
  games,
  isWishlisted,
  onCreateAlert,
  onNavigate,
  onOpenGame,
  onToggleWishlist,
}) {
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="tag">Biblioteca desejada</span>
          <h2>Wishlist</h2>
          <p>Jogos salvos no navegador para acompanhar depois.</p>
        </div>

        <button onClick={() => onNavigate('offers')} type="button">Ver ofertas</button>
      </header>

      {games.length === 0 ? (
        <section className="empty-state">
          <h3>Nenhum jogo salvo ainda</h3>
          <p>Adicione jogos pela página Explorar ou Ofertas para montar sua lista.</p>
          <button onClick={() => onNavigate('offers')} type="button">Explorar ofertas</button>
        </section>
      ) : (
        <section className="games-grid">
          {games.map((game) => (
            <GameCard
              game={game}
              isWishlisted={isWishlisted(game)}
              key={game.dealID}
              onCreateAlert={onCreateAlert}
              onSelect={onOpenGame}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </section>
      )}
    </>
  )
}

export default Wishlist
