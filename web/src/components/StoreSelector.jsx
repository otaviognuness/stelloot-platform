import { useRef } from 'react'

function StoreSelector({ label = 'Lojas', options, value, onChange }) {
  const railRef = useRef(null)

  function scrollRail(direction) {
    railRef.current?.scrollBy({
      left: direction * 220,
      behavior: 'smooth',
    })
  }

  return (
    <section className="store-selector" aria-label={label}>
      <div className="store-selector-head">
        <small>{label}</small>
        <div className="store-selector-controls" aria-hidden="true">
          <button onClick={() => scrollRail(-1)} type="button">&lt;</button>
          <button onClick={() => scrollRail(1)} type="button">&gt;</button>
        </div>
      </div>

      <div className="store-rail" ref={railRef}>
        {options.map((option) => (
          <button
            className={`store-chip${option.id === value ? ' active' : ''}`}
            key={option.id}
            onClick={() => onChange(option.id)}
            type="button"
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default StoreSelector
