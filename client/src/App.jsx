// client/src/App.jsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FreelancerProfile from "./pages/FreelancerProfile"; // The Edit Page
import ClientProfile from "./pages/ClientProfile";         // The Edit Page
import FreelancerView from "./pages/FreelancerView";       // The NEW View Page
import ClientView from "./pages/ClientView";               // The NEW View Page
import "./assets/theme.css"; 

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<div className="p-10 text-2xl font-bold text-gray-400">Dashboard</div>} />
        
        {/* FREELANCER ROUTES */}
        <Route path="/profile/freelancer" element={<FreelancerView />} />         {/* VIEW */}
        <Route path="/profile/freelancer/edit" element={<FreelancerProfile />} /> {/* EDIT */}

        {/* CLIENT ROUTES */}
        <Route path="/profile/client" element={<ClientView />} />                 {/* VIEW */}
        <Route path="/profile/client/edit" element={<ClientProfile />} />         {/* EDIT */}
      </Route>
    </Routes>
  );
}

export default App;