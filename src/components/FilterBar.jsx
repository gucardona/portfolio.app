import './FilterBar.css'

export default function FilterBar({ genres, active, counts, onChange }) {
  const allChips = [{ key: 'all', label: 'All' }, ...genres.map(g => ({ key: g, label: g }))]

  return (
    <div className="filter-bar">
      {allChips.map(({ key, label }) => (
        <button
          key={key}
          className={`filter-chip${active === key ? ' filter-chip--active' : ''}`}
          onClick={() => onChange(key)}
        >
          {label}
          {counts[key] != null && (
            <span className="filter-chip__count">{counts[key]}</span>
          )}
        </button>
      ))}
    </div>
  )
}
