import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/authentication/context/AuthContext';
import { useAuth } from './features/authentication/hooks/useAuth';

import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import SignupFreelancer from './pages/SignupFreelancer';
import SignupClient from './pages/SignupClient';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import './styles/global.css';
import './styles/theme.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/role-selection" />} />
      
      <Route 
        path="/role-selection" 
        element={
          <PublicRoute>
            <RoleSelection />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/signup/freelancer" 
        element={
          <PublicRoute>
            <SignupFreelancer />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/signup/client" 
        element={
          <PublicRoute>
            <SignupClient />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <ForgotPassword />
        } 
      />
      <Route 
        path="/reset-password/:token"  
        element={
          <ResetPassword />  
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
