// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FreelancerProfile from "./pages/FreelancerProfile";
import ClientProfile from "./pages/ClientProfile";
import FindProjects from "./pages/FindProjects"; // ← Import your new page
import './themes.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<h1>Welcome to TalentLink</h1>} />
          
          {/* Freelancer Route */}
          <Route path="/profile/freelancer" element={<FreelancerProfile />} />
          
          {/* Client Route */}
          <Route path="/profile/client" element={<ClientProfile />} />

          {/* Find Projects Route */}
          <Route path="/find-projects" element={<FindProjects />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
