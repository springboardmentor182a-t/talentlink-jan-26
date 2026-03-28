const ProjectFilters = ({
  searchInput,
  onSearchChange,
  onKeyDown,
  categories,
  category,
  onCategoryChange,
  budgetIdx,
  onBudgetChange,
  budgetLabels,
  onSearch,
}) => {
  return (
    <div className="filters-bar">

      <input
        type="text"
        placeholder="Search projects..."
        value={searchInput}
        onChange={e => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
      />

      <select value={category} onChange={e => onCategoryChange(e.target.value)}>
        {categories.map(c => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <select value={budgetIdx} onChange={e => onBudgetChange(Number(e.target.value))}>
        {budgetLabels.map((label, i) => (
          <option key={i} value={i}>{label}</option>
        ))}
      </select>

      <button className="search-btn" onClick={onSearch}>Search</button>

    </div>
  );
};

export default ProjectFilters;