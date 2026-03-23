import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const role  = params.get("role");
    const id    = params.get("id");
    const name  = params.get("name");
    const email = params.get("email");

    if (token && role) {
      login({ token, role, user: { id, name, email, role } });
      if (role === "client") navigate("/dashboard");
      else navigate("/freelancer/dashboard");   // ✅ fixed
    } else {
      navigate("/");
    }
  }, []);

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⏳</div>
        <p style={{ color:"#6b7280", fontSize:16 }}>Logging you in...</p>
      </div>
    </div>
  );
}