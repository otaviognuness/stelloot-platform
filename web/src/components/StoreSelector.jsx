import { useEffect, useRef, useState } from 'react'

function StoreSelector({ className = '', label = 'Loja', options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectorRef = useRef(null)
  const selectedOption = options.find((option) => option.id === value) || options[0]

  useEffect(() => {
    if (!isOpen) return undefined

    function handlePointerDown(event) {
      if (!selectorRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function handleSelect(optionId) {
    onChange(optionId)
    setIsOpen(false)
  }

  return (
    <div className={`store-select ${className}`.trim()} ref={selectorRef}>
      <span className="store-select-label">{label}</span>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`store-select-trigger${isOpen ? ' open' : ''}`}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {selectedOption.label}
      </button>

      {isOpen && (
        <div aria-label={label} className="store-select-menu" role="listbox">
          {options.map((option) => (
            <button
              aria-selected={option.id === value}
              className={option.id === value ? 'selected' : ''}
              key={option.id}
              onClick={() => handleSelect(option.id)}
              role="option"
              type="button"
            >
              {option.label}
              {option.id === value && <span aria-hidden="true">&#10003;</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default StoreSelector
