import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Sidebar from "./layout/Sidebar";
import ClientDashboard from "./pages/ClientDashboard";
import Contracts from "./pages/Contracts";

import "./App.css";

// Dashboard layout (NO router, NO provider here)
const DashboardLayout = ({ children }) => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          marginLeft: "250px",
          minHeight: "100vh",
          backgroundColor: "var(--background)",
        }}
      >
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default to Dashboard */}
          <Route
            path="/"
            element={
              <DashboardLayout>
                <ClientDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <ClientDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/contracts"
            element={
              <DashboardLayout>
                <Contracts />
              </DashboardLayout>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<div style={{ padding: "24px" }}>Page not found</div>}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
