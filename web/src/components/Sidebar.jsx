import logo from '../assets/logo1.png'

function Sidebar({ onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand" onClick={() => onNavigate('home')}>
        <img src={logo} alt="Logo StelLoot" />
        <h1>StelLoot</h1>
      </div>

      <nav>
        <a href="#" onClick={() => onNavigate('home')}>Explorar</a>
        <a href="#">Ofertas</a>
        <a href="#">Wishlist</a>
        <a href="#">Alertas</a>
        <a href="#">Dashboard</a>
      </nav>
    </aside>
  )
}

export default Sidebar