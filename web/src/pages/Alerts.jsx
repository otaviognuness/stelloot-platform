import { dollarToBRL, formatBRLFromDollar } from '../utils/deals'

function Alerts({ alerts, onNavigate, onRemoveAlert }) {
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="tag">Preço alvo</span>
          <h2>Alertas</h2>
          <p>Defina quanto quer pagar e acompanhe quando a oferta chegar no alvo.</p>
        </div>

        <button onClick={() => onNavigate('offers')} type="button">Criar alerta</button>
      </header>

      {alerts.length === 0 ? (
        <section className="empty-state">
          <h3>Nenhum alerta criado</h3>
          <p>Use o botão Alerta em qualquer card para salvar um preço alvo.</p>
          <button onClick={() => onNavigate('offers')} type="button">Ver catálogo</button>
        </section>
      ) : (
        <section className="alerts-list">
          {alerts.map((alert) => {
            const currentPrice = dollarToBRL(alert.game.salePrice)
            const reachedTarget = currentPrice <= Number(alert.targetPrice)

            return (
              <article className="alert-card" key={alert.id}>
                <img src={alert.game.thumb} alt="" />
                <div>
                  <small>{alert.game.storeName} · PC</small>
                  <h3>{alert.game.displayTitle || alert.game.title}</h3>
                  <p>
                    Atual: <strong>{formatBRLFromDollar(alert.game.salePrice)}</strong>
                    {' '}· Alvo: <strong>R$ {Number(alert.targetPrice).toFixed(2).replace('.', ',')}</strong>
                  </p>
                </div>
                <span className={reachedTarget ? 'alert-hit' : 'alert-waiting'}>
                  {reachedTarget ? 'Preço atingido' : 'Aguardando'}
                </span>
                <button onClick={() => onRemoveAlert(alert.id)} type="button">Remover</button>
              </article>
            )
          })}
        </section>
      )}
    </>
  )
}

export default Alerts
