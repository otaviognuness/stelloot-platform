import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import TargetPriceModal from './components/TargetPriceModal'
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
import {
  getWishlist,
  removeWishlistItem,
  saveWishlistItem,
  updateWishlistTargetPrice,
} from './services/wishlistService'
import { dollarToBRL, getGameKey, selectBestDeals } from './utils/deals'

const MIN_EXPECTED_HOME_DEALS = 4

function App() {
  const [page, setPage] = useState('home')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [targetPriceGame, setTargetPriceGame] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [deals, setDeals] = useState([])
  const [loadingDeals, setLoadingDeals] = useState(true)
  const [loadingMoreDeals, setLoadingMoreDeals] = useState(false)
  const [dealsPage, setDealsPage] = useState(0)
  const [hasMoreDeals, setHasMoreDeals] = useState(true)
  const [dealsError, setDealsError] = useState('')
  const [dealsWarning, setDealsWarning] = useState('')
  const [sessionExpired, setSessionExpired] = useState(false)
  const [theme, setTheme] = useLocalStorage('stelloot:theme', 'default')
  const [currentUser, setCurrentUser] = useLocalStorage('stelloot:user', null)
  const [wishlist, setWishlist] = useLocalStorage('stelloot:wishlist', [])
  const [offersInitialSearch, setOffersInitialSearch] = useState('')
  const retriedTruncatedDeals = useRef(false)
  const activeTheme = ['default', 'black', 'light'].includes(theme) ? theme : 'default'

  const loadDeals = useCallback(async ({ forceRefresh = false } = {}) => {
    try {
      setLoadingDeals(true)
      setDealsError('')
      setDealsWarning('')

      const result = await getPcDeals({ forceRefresh, pageNumber: 0 })
      setDeals(result.deals)
      setDealsPage(0)
      setHasMoreDeals(result.hasMore)
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

  async function handleLoadMoreDeals() {
    if (loadingMoreDeals || !hasMoreDeals) return

    try {
      setLoadingMoreDeals(true)
      const result = await getPcDeals({ pageNumber: dealsPage + 1 })
      setDeals((currentDeals) => selectBestDeals([...currentDeals, ...result.deals]))
      setDealsPage(result.pageNumber)
      setHasMoreDeals(result.hasMore)
    } catch {
      setDealsWarning('Nao foi possivel carregar mais ofertas agora.')
    } finally {
      setLoadingMoreDeals(false)
    }
  }

  useEffect(() => {
    const taskId = window.setTimeout(() => loadDeals(), 0)
    return () => window.clearTimeout(taskId)
  }, [loadDeals])

  useEffect(() => {
    const hasTruncatedInitialList =
      !loadingDeals &&
      !dealsError &&
      deals.length > 0 &&
      deals.length < MIN_EXPECTED_HOME_DEALS

    if (!hasTruncatedInitialList || retriedTruncatedDeals.current) return

    retriedTruncatedDeals.current = true
    loadDeals({ forceRefresh: true })
  }, [deals.length, dealsError, loadDeals, loadingDeals])

  useEffect(() => {
    if (!currentUser?.token) return undefined

    let active = true

    getAuthenticatedUser(currentUser.token)
      .then((user) => {
        if (!active) return
        setSessionExpired(false)
        setCurrentUser((session) => ({
          ...session,
          email: user.email,
          id: user.id,
          name: user.username || user.email?.split('@')[0] || 'Usuario',
        }))
      })
      .catch(() => {
        if (!active) return
        setCurrentUser(null)
        setSessionExpired(true)
      })

    return () => {
      active = false
    }
  }, [currentUser?.token, setCurrentUser])

  useEffect(() => {
    if (!currentUser?.token) return undefined

    let active = true

    getWishlist(currentUser.token)
      .then((items) => {
        if (active) setWishlist(items)
      })
      .catch(() => {
        if (active) setDealsWarning('Nao foi possivel sincronizar sua wishlist agora.')
      })

    return () => {
      active = false
    }
  }, [currentUser?.token, setWishlist])

  function handleNavigate(nextPage, options = {}) {
    setSettingsOpen(false)
    setTargetPriceGame(null)
    setSessionExpired(false)

    if (nextPage === 'alerts') {
      setPage('wishlist')
      return
    }

    if (nextPage === 'offers') setOffersInitialSearch(options.search || '')
    if (nextPage === 'home') setSelectedGame(null)
    if (nextPage === 'login' && currentUser) {
      setPage('home')
      return
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

  function getWishlistedGame(game) {
    const key = getGameKey(game)
    return wishlist.find((item) => getGameKey(item) === key) || null
  }

  async function handleToggleWishlist(game) {
    const key = getGameKey(game)
    const savedGame = getWishlistedGame(game)

    if (savedGame) {
      setWishlist((currentWishlist) =>
        currentWishlist.filter((item) => getGameKey(item) !== key)
      )

      if (currentUser?.token && savedGame.wishlistId) {
        try {
          await removeWishlistItem(currentUser.token, savedGame.wishlistId)
        } catch {
          setDealsWarning('Nao foi possivel remover o jogo da wishlist agora.')
          setWishlist(await getWishlist(currentUser.token).catch(() => []))
        }
      }

      return
    }

    const newItem = {
      ...game,
      targetPrice: Math.max(1, Math.floor(dollarToBRL(game.salePrice) * 0.85)),
    }

    setWishlist((currentWishlist) => [newItem, ...currentWishlist])

    if (currentUser?.token) {
      try {
        const savedItem = await saveWishlistItem(currentUser.token, newItem)
        setWishlist((currentWishlist) =>
          currentWishlist.map((item) => (getGameKey(item) === key ? savedItem : item))
        )
      } catch {
        setDealsWarning('Nao foi possivel salvar o jogo na wishlist agora.')
        setWishlist((currentWishlist) =>
          currentWishlist.filter((item) => getGameKey(item) !== key)
        )
      }
    }
  }

  function handleCreateAlert(game) {
    setTargetPriceGame(game)
  }

  async function handleSaveTargetPrice(targetPrice) {
    const key = getGameKey(targetPriceGame)
    const savedGame = getWishlistedGame(targetPriceGame)
    const nextItem = {
      ...(savedGame || targetPriceGame),
      targetPrice,
    }

    setWishlist((currentWishlist) => {
      const alreadySaved = currentWishlist.some((item) => getGameKey(item) === key)
      if (alreadySaved) {
        return currentWishlist.map((item) =>
          getGameKey(item) === key ? nextItem : item
        )
      }

      return [nextItem, ...currentWishlist]
    })
    setTargetPriceGame(null)

    if (currentUser?.token) {
      try {
        const syncedItem = savedGame?.wishlistId
          ? await updateWishlistTargetPrice(currentUser.token, savedGame.wishlistId, targetPrice)
          : await saveWishlistItem(currentUser.token, nextItem, targetPrice)

        setWishlist((currentWishlist) =>
          currentWishlist.map((item) => (getGameKey(item) === key ? syncedItem : item))
        )
      } catch {
        setDealsWarning('Nao foi possivel atualizar o preco alvo agora.')
      }
    }
  }

  async function handleLoginSuccess(authResponse) {
    const user = authResponse.user || authResponse
    const anonymousWishlist = wishlist.filter((item) => !item.wishlistId)

    setSessionExpired(false)
    setCurrentUser({
      id: user.id,
      email: user.email || 'usuario@stelloot.local',
      name: user.username || user.name || user.email?.split('@')[0] || 'Usuario',
      provider: user.provider || 'local',
      token: authResponse.token,
      tokenType: authResponse.tokenType || 'Bearer',
    })

    if (authResponse.token && anonymousWishlist.length) {
      try {
        await Promise.all(
          anonymousWishlist.map((game) =>
            saveWishlistItem(authResponse.token, game, game.targetPrice)
          )
        )
        setWishlist(await getWishlist(authResponse.token))
      } catch {
        setDealsWarning('Voce entrou, mas alguns itens locais nao puderam ser sincronizados.')
      }
    }

    handleNavigate('home')
  }

  function handleLogout() {
    setCurrentUser(null)
    setSessionExpired(false)
    setWishlist([])
    setPage('home')
  }

  function renderContent() {
    const sharedProps = {
      deals,
      error: dealsError,
      getWishlistedGame,
      hasMoreDeals,
      isWishlisted,
      loading: loadingDeals,
      loadingMore: loadingMoreDeals,
      onCreateAlert: handleCreateAlert,
      onLoadMoreDeals: handleLoadMoreDeals,
      onOpenGame: handleOpenGame,
      onRefreshDeals: () => loadDeals({ forceRefresh: true }),
      onToggleWishlist: handleToggleWishlist,
      warning: dealsWarning,
    }

    if (page === 'login' && currentUser) {
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
      return <Dashboard onNavigate={handleNavigate} wishlist={wishlist} />
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
      className={page === 'login' && !currentUser ? 'app login-layout' : 'app'}
      data-theme={activeTheme}
    >
      {page !== 'login' && (
        <Sidebar
          activePage={page}
          currentUser={currentUser}
          onLogin={() => handleNavigate('login')}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      <section className="content">
        {sessionExpired && page !== 'login' && (
          <div className="session-expired-banner">
            Sua sessao expirou. Faca login novamente para acessar sua conta.
            <button type="button" onClick={() => handleNavigate('login')}>Entrar</button>
            <button type="button" className="dismiss" onClick={() => setSessionExpired(false)}>x</button>
          </div>
        )}
        {renderContent()}
      </section>

      {page !== 'login' && (
        <button
          aria-label="Abrir configuracoes"
          className={`settings-trigger${settingsOpen ? ' open' : ''}`}
          onClick={() => setSettingsOpen(true)}
          title="Configuracoes"
          type="button"
        >
          <span aria-hidden="true">&#9881;</span>
        </button>
      )}

      {settingsOpen && (
        <Settings
          currentUser={currentUser}
          onClose={() => setSettingsOpen(false)}
          onThemeChange={setTheme}
          theme={activeTheme}
        />
      )}

      {targetPriceGame && (
        <TargetPriceModal
          game={targetPriceGame}
          initialPrice={
            getWishlistedGame(targetPriceGame)?.targetPrice ||
            Math.max(1, Math.floor(dollarToBRL(targetPriceGame.salePrice) * 0.85))
          }
          onClose={() => setTargetPriceGame(null)}
          onSave={handleSaveTargetPrice}
        />
      )}
    </main>
  )
}

export default App
