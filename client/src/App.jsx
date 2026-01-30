// client/src/App.jsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FreelancerProfile from "./pages/FreelancerProfile";
import ClientProfile from "./pages/ClientProfile";
import "./assets/theme.css"; // Ensure this matches your file location

function App() {
  return (
    <Routes>
      {/* All pages inside this Route will have the Sidebar */}
      <Route element={<Layout />}>
        <Route path="/" element={<div className="p-10 text-2xl font-bold text-gray-400">Dashboard Coming Soon...</div>} />
        <Route path="/profile/freelancer" element={<FreelancerProfile />} />
        <Route path="/profile/client" element={<ClientProfile />} />
      </Route>
    </Routes>
  );
}

export default App;