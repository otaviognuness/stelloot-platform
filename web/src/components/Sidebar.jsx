import { useState } from 'react'
import logo from '../assets/logo1.png'

const NAV_ITEMS = [
  { id: 'home', label: 'Explorar' },
  { id: 'offers', label: 'Ofertas' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'dashboard', label: 'Dashboard' },
]

function Sidebar({
  activePage = 'home',
  currentUser,
  onLogin,
  onLogout,
  onNavigate,
  onOpenSettings,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  function navigate(page) {
    setMobileOpen(false)
    onNavigate(page)
  }

  return (
    <>
      <header className="mobile-header">
        <button
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          className="mobile-menu-button"
          onClick={() => setMobileOpen((isOpen) => !isOpen)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
        <button className="mobile-brand" onClick={() => navigate('home')} type="button">
          <img src={logo} alt="" />
          <strong>StelLoot</strong>
        </button>
        <button
          aria-label="Buscar jogos"
          className="mobile-search-button"
          onClick={() => navigate('offers')}
          type="button"
        >
          <span aria-hidden="true" />
        </button>
        {currentUser ? (
          <button className="mobile-user" onClick={() => navigate('wishlist')} type="button">
            {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
          </button>
        ) : (
          <button className="mobile-login" onClick={onLogin} type="button">
            Entrar
          </button>
        )}
      </header>

      {mobileOpen && (
        <button
          aria-label="Fechar menu"
          className="mobile-drawer-backdrop"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      )}

      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-header">
          <button className="brand" onClick={() => navigate('home')} type="button">
            <img src={logo} alt="Logo StelLoot" />
            <h1>StelLoot</h1>
          </button>
          <button
            aria-label="Fechar menu"
            className="mobile-drawer-close"
            onClick={() => setMobileOpen(false)}
            type="button"
          >
            &times;
          </button>
        </div>

        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              className={activePage === item.id ? 'active' : ''}
              key={item.id}
              onClick={() => navigate(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mobile-drawer-actions">
          {currentUser ? (
            <>
              <p>Olá, <strong>{currentUser.name}</strong></p>
              <button
                onClick={() => {
                  setMobileOpen(false)
                  onLogout()
                }}
                type="button"
              >
                Sair
              </button>
            </>
          ) : (
            <button
              className="drawer-login"
              onClick={() => {
                setMobileOpen(false)
                onLogin()
              }}
              type="button"
            >
              Entrar
            </button>
          )}
          <button
            onClick={() => {
              setMobileOpen(false)
              onOpenSettings()
            }}
            type="button"
          >
            Configurações
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
