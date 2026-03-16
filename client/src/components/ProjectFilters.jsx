const ProjectFilters = () => {
  return (
    <div className="filters-bar">

      <input
        type="text"
        placeholder="Search projects..."
      />

      <select>
        <option>All Categories</option>
        <option>Web Development</option>
        <option>Design</option>
        <option>Mobile Apps</option>
        <option>AI / ML</option>
      </select>

      <select>
        <option>Budget Range</option>
        <option>$1,000 – $3,000</option>
        <option>$3,000 – $6,000</option>
        <option>$6,000+</option>
      </select>

      <button className="search-btn">Search</button>

    </div>
  );
};

export default ProjectFilters;
