import GameCard from '../components/GameCard'

function Wishlist({
  games,
  getWishlistedGame,
  isWishlisted,
  onCreateAlert,
  onNavigate,
  onOpenGame,
  onToggleWishlist,
}) {
  return (
    <div className="wishlist-page">
      <header className="page-heading">
        <div>
          <span className="tag">Biblioteca desejada</span>
          <h2>Wishlist</h2>
          <p>
            Jogos salvos com preço alvo. Quando o preço atual ficar abaixo do
            alvo, o dashboard destaca a oportunidade.
          </p>
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
              savedGame={getWishlistedGame?.(game) || game}
            />
          ))}
        </section>
      )}
    </div>
  )
}

export default Wishlist
