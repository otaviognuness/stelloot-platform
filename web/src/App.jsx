import { useCallback, useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import useLocalStorage from './hooks/useLocalStorage'
import LoginCard from './components/LoginCard'
import Alerts from './pages/Alerts'
import Dashboard from './pages/Dashboard'
import GameDetails from './pages/GameDetails'
import Home from './pages/Home'
import Offers from './pages/Offers'
import Wishlist from './pages/Wishlist'
import { getPcDeals } from './services/cheapSharkService'
import { dollarToBRL, getGameKey } from './utils/deals'

function App() {
  const [page, setPage] = useState('home')
  const [selectedGame, setSelectedGame] = useState(null)
  const [deals, setDeals] = useState([])
  const [loadingDeals, setLoadingDeals] = useState(true)
  const [dealsError, setDealsError] = useState('')
  const [dealsWarning, setDealsWarning] = useState('')
  const [wishlist, setWishlist] = useLocalStorage('stelloot:wishlist', [])
  const [alerts, setAlerts] = useLocalStorage('stelloot:alerts', [])

  const loadDeals = useCallback(async ({ forceRefresh = false } = {}) => {
    try {
      setLoadingDeals(true)
      setDealsError('')
      setDealsWarning('')

      const result = await getPcDeals({ forceRefresh })
      setDeals(result.deals)
      setDealsWarning(result.warning || '')
    } catch (error) {
      setDealsError(
        error?.code === 'RATE_LIMIT'
          ? 'A CheapShark bloqueou chamadas temporariamente por limite de uso. Aguarde alguns minutos e atualize.'
          : 'Não foi possível carregar o backend agora. Confirme se o Spring Boot está rodando na porta 8080.'
      )
    } finally {
      setLoadingDeals(false)
    }
  }, [])

  useEffect(() => {
    const taskId = window.setTimeout(() => {
      loadDeals()
    }, 0)

    return () => window.clearTimeout(taskId)
  }, [loadDeals])

  function handleNavigate(nextPage) {
    if (nextPage === 'home') {
      setSelectedGame(null)
    }

    setPage(nextPage)
  }

  function handleOpenGame(game) {
    setSelectedGame(game)
    setPage('details')
  }

  function isWishlisted(game) {
    const key = getGameKey(game)
    return wishlist.some((item) => getGameKey(item) === key)
  }

  function handleToggleWishlist(game) {
    const key = getGameKey(game)

    setWishlist((currentWishlist) => {
      if (currentWishlist.some((item) => getGameKey(item) === key)) {
        return currentWishlist.filter((item) => getGameKey(item) !== key)
      }

      return [{ ...game, savedAt: Date.now() }, ...currentWishlist]
    })
  }

  function handleCreateAlert(game) {
    const currentPrice = dollarToBRL(game.salePrice)
    const answer = window.prompt(
      `Qual preço alvo em R$ para ${game.displayTitle || game.title}?`,
      Math.max(1, Math.floor(currentPrice * 0.85)).toString()
    )
    const targetPrice = Number(String(answer || '').replace(',', '.'))

    if (!targetPrice || targetPrice <= 0) return

    setAlerts((currentAlerts) => [
      {
        id: `${getGameKey(game)}-${Date.now()}`,
        createdAt: Date.now(),
        game,
        targetPrice,
      },
      ...currentAlerts,
    ])
  }

  function handleRemoveAlert(alertId) {
    setAlerts((currentAlerts) =>
      currentAlerts.filter((alert) => alert.id !== alertId)
    )
  }

  function renderContent() {
    const sharedProps = {
      deals,
      error: dealsError,
      isWishlisted,
      loading: loadingDeals,
      onCreateAlert: handleCreateAlert,
      onOpenGame: handleOpenGame,
      onRefreshDeals: () => loadDeals({ forceRefresh: true }),
      onToggleWishlist: handleToggleWishlist,
      warning: dealsWarning,
    }

    if (page === 'login') {
      return <LoginCard onBack={() => handleNavigate('home')} />
    }

    if (page === 'details' && selectedGame) {
      return (
        <GameDetails
          game={selectedGame}
          isWishlisted={isWishlisted(selectedGame)}
          onBack={() => handleNavigate('home')}
          onCreateAlert={handleCreateAlert}
          onToggleWishlist={handleToggleWishlist}
        />
      )
    }

    if (page === 'offers') {
      return <Offers {...sharedProps} />
    }

    if (page === 'wishlist') {
      return (
        <Wishlist
          games={wishlist}
          isWishlisted={isWishlisted}
          onCreateAlert={handleCreateAlert}
          onNavigate={handleNavigate}
          onOpenGame={handleOpenGame}
          onToggleWishlist={handleToggleWishlist}
        />
      )
    }

    if (page === 'alerts') {
      return (
        <Alerts
          alerts={alerts}
          onNavigate={handleNavigate}
          onRemoveAlert={handleRemoveAlert}
        />
      )
    }

    if (page === 'dashboard') {
      return (
        <Dashboard
          alerts={alerts}
          deals={deals}
          onNavigate={handleNavigate}
          wishlist={wishlist}
        />
      )
    }

    return (
      <Home
        {...sharedProps}
        onLogin={() => handleNavigate('login')}
        onNavigate={handleNavigate}
      />
    )
  }

  return (
    <main className={page === 'login' ? 'app login-layout' : 'app'}>
      {page !== 'login' && <Sidebar activePage={page} onNavigate={handleNavigate} />}

      <section className="content">
        {renderContent()}
      </section>
    </main>
  )
}

export default App
