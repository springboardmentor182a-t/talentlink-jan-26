import { useNavigate } from "react-router-dom";

const ChooseRole = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>Connect, Collaborate, Create</h1>

      <button onClick={() => navigate("/client/login")}>
        Continue as Client
      </button>

      <br /><br />

      <button onClick={() => navigate("/freelancer/login")}>
        Continue as Freelancer
      </button>
    </div>
  );
};

export default ChooseRole;
