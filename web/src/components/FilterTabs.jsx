function FilterTabs({ label, options, value, onChange }) {
  return (
    <div className="filter-tabs" aria-label={label}>
      {options.map((option) => (
        <button
          className={option.id === value ? 'active' : ''}
          key={option.id}
          onClick={() => onChange(option.id)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default FilterTabs
