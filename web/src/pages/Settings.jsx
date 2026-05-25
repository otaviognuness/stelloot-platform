import { useEffect } from 'react'

const THEMES = [
  { id: 'default', name: 'StelLoot' },
  { id: 'black', name: 'Preto' },
  { id: 'light', name: 'Branco' },
]

function Settings({ currentUser, theme, onClose, onThemeChange }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="settings-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        aria-labelledby="settings-title"
        aria-modal="true"
        className="settings-modal"
        role="dialog"
      >
        <header className="settings-header">
          <div>
            <small>Preferências</small>
            <h2 id="settings-title">Configurações</h2>
          </div>
          <button aria-label="Fechar configurações" onClick={onClose} type="button">
            &times;
          </button>
        </header>

        <div className="settings-content">
          <section className="settings-panel">
            <h3>Tema</h3>
            <div className="theme-options">
              {THEMES.map((option) => (
                <button
                  aria-pressed={theme === option.id}
                  className={`theme-option ${theme === option.id ? 'active' : ''}`}
                  key={option.id}
                  onClick={() => onThemeChange(option.id)}
                  type="button"
                >
                  <span className={`theme-preview ${option.id}`} aria-hidden="true" />
                  <strong>{option.name}</strong>
                </button>
              ))}
            </div>
          </section>

          <aside className="settings-info">
            <h3>Informações</h3>
            <dl>
              <div>
                <dt>Conta</dt>
                <dd>{currentUser?.name || 'Visitante'}</dd>
              </div>
              <div>
                <dt>Plataforma</dt>
                <dd>PC</dd>
              </div>
              <div>
                <dt>Fonte de ofertas</dt>
                <dd>CheapShark</dd>
              </div>
              <div>
                <dt>Moeda exibida</dt>
                <dd>R$ estimado</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </div>
  )
}

export default Settings
