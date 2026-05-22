import { useCallback, useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import useLocalStorage from './hooks/useLocalStorage'
import LoginCard from './components/LoginCard'
import Dashboard from './pages/Dashboard'
import GameDetails from './pages/GameDetails'
import Home from './pages/Home'
import Offers from './pages/Offers'
import Settings from './pages/Settings'
import Wishlist from './pages/Wishlist'
import { getAuthenticatedUser } from './services/authService'
import { getPcDeals } from './services/cheapSharkService'
import { dollarToBRL, getGameKey } from './utils/deals'

function App() {
  const [page, setPage] = useState('home')
  const [selectedGame, setSelectedGame] = useState(null)
  const [deals, setDeals] = useState([])
  const [loadingDeals, setLoadingDeals] = useState(true)
  const [dealsError, setDealsError] = useState('')
  const [dealsWarning, setDealsWarning] = useState('')
  const [theme, setTheme] = useLocalStorage('stelloot:theme', 'default')
  const [currentUser, setCurrentUser] = useLocalStorage('stelloot:user', null)
  const [wishlist, setWishlist] = useLocalStorage('stelloot:wishlist', [])
  const [offersInitialSearch, setOffersInitialSearch] = useState('')
  const activeTheme = ['default', 'black', 'light'].includes(theme) ? theme : 'default'

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
          : 'Nao foi possivel carregar o backend agora. Confirme se o Spring Boot esta rodando na porta 8080.'
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

  useEffect(() => {
    if (!currentUser?.token) return undefined

    let active = true

    getAuthenticatedUser(currentUser.token)
      .then((user) => {
        if (!active) return

        setCurrentUser((session) => ({
          ...session,
          email: user.email,
          id: user.id,
          name: user.username || user.email?.split('@')[0] || 'Usuario',
        }))
      })
      .catch(() => {
        if (active) setCurrentUser(null)
      })

    return () => {
      active = false
    }
  }, [currentUser?.token, setCurrentUser])

  function handleNavigate(nextPage, options = {}) {
    if (nextPage === 'alerts') {
      setPage('wishlist')
      return
    }

    if (nextPage === 'offers') {
      setOffersInitialSearch(options.search || '')
    }

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

      return [
        {
          ...game,
          savedAt: Date.now(),
          targetPrice: Math.max(1, Math.floor(dollarToBRL(game.salePrice) * 0.85)),
        },
        ...currentWishlist,
      ]
    })
  }

  function handleCreateAlert(game) {
    const currentPrice = dollarToBRL(game.salePrice)
    const answer = window.prompt(
      `Qual preco alvo em R$ para ${game.displayTitle || game.title}?`,
      Math.max(1, Math.floor(currentPrice * 0.85)).toString()
    )
    const targetPrice = Number(String(answer || '').replace(',', '.'))

    if (!targetPrice || targetPrice <= 0) return

    const key = getGameKey(game)

    setWishlist((currentWishlist) => {
      const alreadySaved = currentWishlist.some((item) => getGameKey(item) === key)

      if (alreadySaved) {
        return currentWishlist.map((item) =>
          getGameKey(item) === key ? { ...item, targetPrice } : item
        )
      }

      return [{ ...game, savedAt: Date.now(), targetPrice }, ...currentWishlist]
    })
  }

  function getWishlistedGame(game) {
    const key = getGameKey(game)
    return wishlist.find((item) => getGameKey(item) === key) || null
  }

  function handleLoginSuccess(authResponse) {
    const user = authResponse.user || authResponse

    setCurrentUser({
      id: user.id,
      email: user.email || 'usuario@stelloot.local',
      name: user.username || user.name || user.email?.split('@')[0] || 'Usuario',
      provider: user.provider || 'local',
      token: authResponse.token,
      tokenType: authResponse.tokenType || 'Bearer',
    })
    handleNavigate('home')
  }

  function handleLogout() {
    setCurrentUser(null)
  }

  function renderContent() {
    const sharedProps = {
      deals,
      error: dealsError,
      getWishlistedGame,
      isWishlisted,
      loading: loadingDeals,
      onCreateAlert: handleCreateAlert,
      onOpenGame: handleOpenGame,
      onRefreshDeals: () => loadDeals({ forceRefresh: true }),
      onToggleWishlist: handleToggleWishlist,
      warning: dealsWarning,
    }

    if (page === 'login') {
      return (
        <LoginCard
          onBack={() => handleNavigate('home')}
          onSuccess={handleLoginSuccess}
        />
      )
    }

    if (page === 'details' && selectedGame) {
      return (
        <GameDetails
          game={selectedGame}
          isWishlisted={isWishlisted(selectedGame)}
          onBack={() => handleNavigate('home')}
          onCreateAlert={handleCreateAlert}
          savedGame={getWishlistedGame(selectedGame)}
          onToggleWishlist={handleToggleWishlist}
        />
      )
    }

    if (page === 'offers') {
      return (
        <Offers
          {...sharedProps}
          initialSearch={offersInitialSearch}
          key={`offers-${offersInitialSearch}`}
        />
      )
    }

    if (page === 'wishlist') {
      return (
        <Wishlist
          games={wishlist}
          getWishlistedGame={getWishlistedGame}
          isWishlisted={isWishlisted}
          onCreateAlert={handleCreateAlert}
          onNavigate={handleNavigate}
          onOpenGame={handleOpenGame}
          onToggleWishlist={handleToggleWishlist}
        />
      )
    }

    if (page === 'dashboard') {
      return (
        <Dashboard
          deals={deals}
          onNavigate={handleNavigate}
          wishlist={wishlist}
        />
      )
    }

    if (page === 'settings') {
      return (
        <Settings
          onThemeChange={setTheme}
          theme={activeTheme}
        />
      )
    }

    return (
      <Home
        {...sharedProps}
        currentUser={currentUser}
        onLogin={() => handleNavigate('login')}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    )
  }

  return (
    <main
      className={page === 'login' ? 'app login-layout' : 'app'}
      data-theme={activeTheme}
    >
      {page !== 'login' && <Sidebar activePage={page} onNavigate={handleNavigate} />}

      <section className="content">
        {renderContent()}
      </section>
    </main>
  )
}

export default App
