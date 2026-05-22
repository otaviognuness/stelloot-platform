import logo from '../assets/logo1.png'

const NAV_ITEMS = [
  { id: 'home', label: 'Explorar' },
  { id: 'offers', label: 'Ofertas' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'settings', label: 'Configuracoes' },
]

function Sidebar({ activePage = 'home', onNavigate }) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => onNavigate('home')} type="button">
        <img src={logo} alt="Logo StelLoot" />
        <h1>StelLoot</h1>
      </button>

      <nav>
        {NAV_ITEMS.map((item) => (
          <button
            className={activePage === item.id ? 'active' : ''}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
