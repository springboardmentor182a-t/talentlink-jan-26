const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div style={{ width: "360px", margin: "auto", padding: "24px", background: "#fff", borderRadius: "12px" }}>
      <h2>{title}</h2>
      <p style={{ color: "#666" }}>{subtitle}</p>
      {children}
    </div>
  );
};

export default AuthCard;
