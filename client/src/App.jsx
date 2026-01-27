// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FreelancerProfile from "./pages/FreelancerProfile";
import ClientProfile from "./pages/ClientProfile"; // <--- Import New Page
import './themes.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<h1>Welcome to TalentLink</h1>} />
          
          {/* Freelancer Route */}
          <Route path="/profile/freelancer" element={<FreelancerProfile />} />
          
          {/* Client Route (NEW) */}
          <Route path="/profile/client" element={<ClientProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;