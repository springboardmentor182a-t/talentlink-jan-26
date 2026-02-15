const AuthButton = ({ text }) => {
  return (
    <button
      style={{
        width: "100%",
        padding: "10px",
        background: "#000",
        color: "#fff",
        borderRadius: "6px",
        border: "none",
      }}
    >
      {text}
    </button>
  );
};

export default AuthButton;
