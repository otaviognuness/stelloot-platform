const THEMES = [
  {
    id: 'default',
    name: 'StelLoot padrao',
    description: 'Visual gamer original, com neon azul, roxo e verde.',
  },
  {
    id: 'black',
    name: 'Preto',
    description: 'Tema preto e branco para apresentacao mais limpa.',
  },
  {
    id: 'light',
    name: 'Branco',
    description: 'Tema claro para ambientes com muita luz.',
  },
]

function Settings({ theme, onThemeChange }) {
  return (
    <section className="settings-page">
      <header className="page-heading">
        <div>
          <span className="tag">Preferencias</span>
          <h2>Configuracoes</h2>
          <p>
            Ajuste o visual do StelLoot sem perder o layout principal da
            plataforma.
          </p>
        </div>
      </header>

      <section className="settings-panel">
        <div>
          <h3>Tema do site</h3>
          <p>
            O padrao mantem a identidade original. Os temas preto e branco ficam
            salvos neste navegador.
          </p>
        </div>

        <div className="theme-options">
          {THEMES.map((option) => (
            <button
              className={`theme-option ${theme === option.id ? 'active' : ''}`}
              key={option.id}
              onClick={() => onThemeChange(option.id)}
              type="button"
            >
              <span className={`theme-preview ${option.id}`} aria-hidden="true" />
              <strong>{option.name}</strong>
              <small>{option.description}</small>
            </button>
          ))}
        </div>
      </section>
    </section>
  )
}

export default Settings
