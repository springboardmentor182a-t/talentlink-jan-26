import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import ClientDashboard from './pages/ClientDashboard';
import './App.css';

// Layout wrapper to include Sidebar and main content area
const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '250px',
        minHeight: '100vh',
        backgroundColor: 'var(--background)'
      }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ClientDashboard />} />
          <Route path="*" element={<div style={{ padding: '24px' }}>Page not found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
