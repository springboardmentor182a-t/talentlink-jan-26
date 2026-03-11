import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("client");
  const [token, setToken] = useState("mock-token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/users/me`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser({ name: "Intern User (Fallback)", email: "intern@example.com" });
      }
    };
    fetchUser();
  }, []);

  const login = (data) => {
    setUser(data.user);
    setRole(data.role);
    setToken(data.token);
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    //setUser(null);
    //setRole(null);
    //setToken(null);
    //localStorage.clear();
    console.log("Logout bypassed");
  };

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
