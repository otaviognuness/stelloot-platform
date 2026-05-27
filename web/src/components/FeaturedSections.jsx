import { useRef, useState, useEffect, useCallback } from 'react'
import { formatBRLFromDollar, getDealUrl, getGameArtwork } from '../utils/deals'
import { STORE_FILTERS } from '../config/stores'

// ─── Seções disponíveis ───────────────────────────────────────────────────────

const SECTION_DEFS = [
  {
    id: 'top-discounts',
    icon: '🔥',
    title: 'Maiores descontos',
    subtitle: 'Cortes de preço mais agressivos agora',
    badgeVariant: 'discount',
    badgeFn: (g) => `-${Math.round(Number(g.savings || 0))}%`,
    filter: (d) => Number(d.savings || 0) >= 30,
    sort:   (a, b) => Number(b.savings || 0) - Number(a.savings || 0),
  },
  {
    id: 'top-rated',
    icon: '⭐',
    title: 'Mais bem avaliados',
    subtitle: 'Notas altas e em promoção',
    badgeVariant: 'rating',
    badgeFn: (g) => `★ ${Number(g.dealRating).toFixed(1)}`,
    filter: (d) => Number(d.dealRating || 0) >= 8,
    sort:   (a, b) => Number(b.dealRating || 0) - Number(a.dealRating || 0),
  },
  {
    id: 'community',
    icon: '👾',
    title: 'Amados pela comunidade',
    subtitle: 'Overwhelmingly ou Very Positive no Steam',
    badgeVariant: 'community',
    badgeFn: (g) =>
      g.steamRatingText === 'Overwhelmingly Positive' ? '🏆 Overwhelmingly' : '👍 Very Positive',
    filter: (d) =>
      ['Overwhelmingly Positive', 'Very Positive'].includes(d.steamRatingText) &&
      Number(d.savings || 0) >= 10,
    sort: (a, b) => Number(b.dealRating || 0) - Number(a.dealRating || 0),
  },
  {
    id: 'best-value',
    icon: '🎯',
    title: 'Melhor custo-benefício',
    subtitle: 'Alto desconto combinado com boa avaliação',
    badgeVariant: 'value',
    badgeFn: (g) => {
      const score = (Number(g.savings || 0) / 100) * Number(g.dealRating || 0)
      return `⚡ ${score.toFixed(1)}`
    },
    filter: (d) => Number(d.savings || 0) >= 20 && Number(d.dealRating || 0) >= 5,
    sort: (a, b) => {
      const scoreA = (Number(a.savings || 0) / 100) * Number(a.dealRating || 0)
      const scoreB = (Number(b.savings || 0) / 100) * Number(b.dealRating || 0)
      return scoreB - scoreA
    },
  },
]

const ALL_SECTIONS_IDS = SECTION_DEFS.map((s) => s.id)
const STORAGE_KEY = 'stelloot:featured-v2'

// ─── Aplica filtro de loja + monta itens da seção ─────────────────────────────

function buildSection(def, deals, storeFilter) {
  const filtered = storeFilter === 'all'
    ? deals
    : deals.filter((d) => {
        const sf = STORE_FILTERS.find((f) => f.id === storeFilter)
        return sf?.storeIDs.includes(String(d.storeID))
      })

  return {
    ...def,
    items: filtered.filter(def.filter).sort(def.sort).slice(0, 24),
  }
}

// ─── Dropdown de lojas ────────────────────────────────────────────────────────

function StoreDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = STORE_FILTERS.find((f) => f.id === value) || STORE_FILTERS[0]

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="fs-store-dropdown" ref={ref}>
      <span className="fs-store-label">Loja</span>
      <button
        className={`fs-store-trigger${open ? ' open' : ''}`}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>🏪</span>
        <span>{selected.label}</span>
        <span className="fs-store-caret">▾</span>
      </button>

      {open && (
        <div className="fs-store-menu" role="listbox" aria-label="Filtrar por loja">
          {STORE_FILTERS.map((f) => (
            <button
              key={f.id}
              className={`fs-store-option${f.id === value ? ' selected' : ''}`}
              role="option"
              aria-selected={f.id === value}
              type="button"
              onClick={() => { onChange(f.id); setOpen(false) }}
            >
              {f.label}
              {f.id === value && <span className="fs-store-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Mini card ────────────────────────────────────────────────────────────────

function RowCard({ game, isWishlisted, onSelect, onToggleWishlist, badge, badgeVariant }) {
  const discount = Math.round(Number(game.savings || 0))
  const title = game.displayTitle || game.title
  const artwork = getGameArtwork(game)
  const dealUrl = game.dealUrl || getDealUrl(game.dealID)
  const hasPrice = Number(game.salePrice || 0) > 0

  return (
    <article
      className="row-card"
      onClick={() => onSelect?.(game)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.(game)}
      role="button"
      tabIndex={0}
    >
      <div className="row-card-cover">
        <img
          alt=""
          decoding="async"
          loading="lazy"
          src={artwork}
          onError={(e) => {
            if (game.thumb && e.currentTarget.src !== game.thumb)
              e.currentTarget.src = game.thumb
          }}
        />
        {badge
          ? <span className={`row-card-badge row-card-badge--${badgeVariant || 'default'}`}>{badge}</span>
          : discount > 0 && <span className="row-card-badge row-card-badge--discount">-{discount}%</span>
        }
      </div>

      <div className="row-card-body">
        <p className="row-card-store">{game.storeName} · PC</p>
        <h4 className="row-card-title">{title}</h4>
        <div className="row-card-prices">
          <strong>{hasPrice ? formatBRLFromDollar(game.salePrice) : '—'}</strong>
          {Number(game.normalPrice || 0) > Number(game.salePrice || 0) && (
            <s>{formatBRLFromDollar(game.normalPrice)}</s>
          )}
        </div>
      </div>

      <div className="row-card-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className={`row-wishlist-btn${isWishlisted ? ' active' : ''}`}
          type="button"
          aria-label={isWishlisted ? 'Remover da wishlist' : 'Adicionar à wishlist'}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(game) }}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>
        <a
          className="row-deal-btn"
          href={dealUrl}
          rel="noreferrer"
          target="_blank"
          onClick={(e) => e.stopPropagation()}
        >
          Ver oferta
        </a>
      </div>
    </article>
  )
}

// ─── Linha com scroll ─────────────────────────────────────────────────────────

function ScrollRow({ section, isWishlisted, onSelect, onToggleWishlist }) {
  const trackRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [section.items, updateArrows])

  function scroll(dir) {
    trackRef.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  }

  if (!section.items.length) return null

  return (
    <section className="scroll-row">
      <div className="scroll-row-header">
        <div className="scroll-row-meta">
          <span className="scroll-row-icon">{section.icon}</span>
          <div>
            <h3 className="scroll-row-title">{section.title}</h3>
            <p className="scroll-row-subtitle">{section.subtitle}</p>
          </div>
        </div>
        <div className="scroll-row-arrows">
          <button className={`scroll-arrow${canLeft ? '' : ' off'}`} onClick={() => scroll(-1)} type="button" aria-label="Anterior">&#8249;</button>
          <button className={`scroll-arrow${canRight ? '' : ' off'}`} onClick={() => scroll(1)} type="button" aria-label="Próximo">&#8250;</button>
        </div>
      </div>

      <div className="scroll-row-track" ref={trackRef}>
        {section.items.map((game, i) => (
          <RowCard
            key={game.dealID || `${game.title}-${i}`}
            game={game}
            isWishlisted={isWishlisted(game)}
            onSelect={onSelect}
            onToggleWishlist={onToggleWishlist}
            badge={section.badgeFn ? section.badgeFn(game) : null}
            badgeVariant={section.badgeVariant}
          />
        ))}
      </div>
    </section>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

function FeaturedSections({ deals, isWishlisted, onOpenGame, onToggleWishlist }) {
  const [activeSections, setActiveSections] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (saved?.sections?.length) return saved.sections
    } catch {}
    return [] // padrão: nada selecionado
  })

  const [storeFilter, setStoreFilter] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (saved?.store) return saved.store
    } catch {}
    return 'all' // padrão: todas as lojas
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sections: activeSections, store: storeFilter }))
  }, [activeSections, storeFilter])

  function toggleSection(id) {
    // seleção única: troca ou deseleciona ao clicar na mesma
    setActiveSections((prev) =>
      prev.includes(id) ? [] : [id]
    )
  }

  // Jogos filtrados pela loja selecionada
  const filteredDeals = storeFilter === 'all'
    ? deals
    : deals.filter((d) => {
        const sf = STORE_FILTERS.find((f) => f.id === storeFilter)
        return sf?.storeIDs.includes(String(d.storeID))
      })

  const nothingSelected = activeSections.length === 0

  const sections = SECTION_DEFS
    .filter((def) => activeSections.includes(def.id))
    .map((def) => buildSection(def, filteredDeals, storeFilter))

  if (!deals.length) return null

  return (
    <div className="featured-sections">

      {/* ── Controles: pills + dropdown de loja ── */}
      <div className="fs-controls">
        <div className="section-toggle-bar">
          <span className="section-toggle-label">Explorar por</span>
          <div className="section-toggle-pills">
            {SECTION_DEFS.map((s) => {
              const isActive = activeSections.includes(s.id)
              return (
                <button
                  key={s.id}
                  className={`section-pill${isActive ? ' active' : ''}`}
                  type="button"
                  onClick={() => toggleSection(s.id)}
                >
                  <span className="section-pill-icon">{s.icon}</span>
                  <span>{s.title}</span>
                  {isActive && <span className="section-pill-check">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        <StoreDropdown value={storeFilter} onChange={setStoreFilter} />
      </div>

      {/* ── Nada selecionado: grid simples com todos os jogos ── */}
      {nothingSelected && (
        <div className="fs-all-grid">
          {filteredDeals.map((game, i) => (
            <RowCard
              key={game.dealID || `${game.title}-${i}`}
              game={game}
              isWishlisted={isWishlisted(game)}
              onSelect={onOpenGame}
              onToggleWishlist={onToggleWishlist}
              badge={null}
              badgeVariant="discount"
            />
          ))}
        </div>
      )}

      {/* ── Seção específica selecionada ── */}
      {!nothingSelected && sections.map((section) => (
        <ScrollRow
          key={`${section.id}-${storeFilter}`}
          section={section}
          isWishlisted={isWishlisted}
          onSelect={onOpenGame}
          onToggleWishlist={onToggleWishlist}
        />
      ))}

      {/* ── Sem resultados para a seleção ── */}
      {!nothingSelected && sections.every((s) => !s.items.length) && (
        <p className="status-message">
          Nenhum jogo encontrado para essa combinação no momento. Tente outra categoria ou loja.
        </p>
      )}
    </div>
  )
}

export default FeaturedSections