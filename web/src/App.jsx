import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import LoginCard from './components/LoginCard'
import Home from './pages/Home'

function App() {
  const [page, setPage] = useState('home')

  return (
    <main className={page === 'login' ? 'app login-layout' : 'app'}>
      {page === 'home' && <Sidebar onNavigate={setPage} />}

      <section className="content">
        {page === 'home' ? (
          <Home onLogin={() => setPage('login')} />
        ) : (
          <LoginCard onBack={() => setPage('home')} />
        )}
      </section>
    </main>
  )
}

export default App