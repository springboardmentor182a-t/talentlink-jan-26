import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ClientDashboard from "./pages/ClientDashboard";
import ReceivedProposals from "./pages/client/ReceivedProposals";
import ClientProjects from "./pages/client/ClientProjects";
import ClientProfile from "./pages/client/ClientProfile";
import { FreelancerRoutes } from "./pages/freelancer/FreelancerRoutes";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import authService from "./services/auth";

const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

const DashboardRouter = () => {
  const role = authService.getUserRole();
  if (role === "Freelancer") {
    return <Navigate to="/freelancer/dashboard" replace />;
  }
  return <Navigate to="/client" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardRouter />
              </PrivateRoute>
            }
          />
          <Route
            path="/client"
            element={
              <PrivateRoute>
                <ClientDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/client/received-proposals"
            element={
              <PrivateRoute>
                <ReceivedProposals />
              </PrivateRoute>
            }
          />
          <Route
            path="/client/projects"
            element={
              <PrivateRoute>
                <ClientProjects />
              </PrivateRoute>
            }
          />
          <Route
            path="/client/profile"
            element={
              <PrivateRoute>
                <ClientProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/freelancer/*"
            element={
              <PrivateRoute>
                <FreelancerRoutes />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
