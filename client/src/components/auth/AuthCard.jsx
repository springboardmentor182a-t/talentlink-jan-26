const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="page-container">
      <div className="card">
        <h2>{title}</h2>
        {subtitle && <p style={{ color: "#666", textAlign: "center", marginBottom: "2rem" }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
