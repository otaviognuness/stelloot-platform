import { useEffect, useState } from 'react'
import { formatBRLFromDollar } from '../utils/deals'

function formatTargetValue(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function parseTargetValue(value) {
  const rawValue = value.trim().replace(/^R\$\s?/, '')
  const normalizedValue = rawValue.includes(',')
    ? rawValue.replace(/\./g, '').replace(',', '.')
    : rawValue

  return Number(normalizedValue)
}

function TargetPriceModal({ game, initialPrice, onClose, onSave }) {
  const [price, setPrice] = useState(() => formatTargetValue(initialPrice))
  const [error, setError] = useState('')
  const title = game.displayTitle || game.title

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  function handleSubmit(event) {
    event.preventDefault()
    const targetPrice = parseTargetValue(price)

    if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
      setError('Informe um valor maior que zero.')
      return
    }

    onSave(targetPrice)
  }

  return (
    <div
      className="target-price-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form
        aria-labelledby="target-price-title"
        aria-modal="true"
        className="target-price-modal"
        onSubmit={handleSubmit}
        role="dialog"
      >
        <header>
          <div>
            <small>Wishlist</small>
            <h2 id="target-price-title">Definir preço alvo</h2>
          </div>
          <button aria-label="Fechar" className="modal-close" onClick={onClose} type="button">
            &times;
          </button>
        </header>

        <p className="target-game-title">{title}</p>

        <div className="target-current">
          <span>Preço atual estimado</span>
          <strong>{formatBRLFromDollar(game.salePrice)}</strong>
        </div>

        <label className="target-field">
          Quero ser alertado quando chegar a
          <div>
            <span>R$</span>
            <input
              autoFocus
              inputMode="decimal"
              onChange={(event) => {
                setPrice(event.target.value)
                setError('')
              }}
              value={price}
            />
          </div>
        </label>

        {error && <p className="target-error">{error}</p>}

        <footer>
          <button className="target-cancel" onClick={onClose} type="button">Cancelar</button>
          <button className="target-save" type="submit">Salvar alvo</button>
        </footer>
      </form>
    </div>
  )
}

export default TargetPriceModal
