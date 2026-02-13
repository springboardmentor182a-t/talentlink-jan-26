import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FreelancerRoutes from './pages/freelancer/FreelancerRoutes';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/freelancer/dashboard" replace />} />
        <Route path="/freelancer/*" element={<FreelancerRoutes />} />
      </Routes>
    </Router>
  );
}

export default App;
