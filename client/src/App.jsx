import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FreelancerProfile from "./pages/FreelancerProfile"; // The Edit Page
import ClientProfile from "./pages/ClientProfile";         // The Edit Page
import FreelancerView from "./pages/FreelancerView";       // The NEW View Page
import ClientView from "./pages/ClientView";               // The NEW View Page
import SubmitProposal from "./pages/SubmitProposal";       // The NEW Proposal Page
import "./assets/theme.css"; 
import FreelancerContracts from "./pages/FreelancerContracts";

function App() {
  return (
    <Routes>
      {/* The Layout component wraps all these routes. 
        This means the Sidebar will appear on EVERY page listed below.
      */}
      <Route element={<Layout />}>
        
        {/* DASHBOARD */}
        <Route path="/" element={<div className="p-10 text-2xl font-bold text-gray-400">Dashboard</div>} />
        
        {/* FREELANCER ROUTES */}
        <Route path="/profile/freelancer" element={<FreelancerView />} />         {/* VIEW */}
        <Route path="/profile/freelancer/edit" element={<FreelancerProfile />} /> {/* EDIT */}

        {/* CLIENT ROUTES */}
        <Route path="/profile/client" element={<ClientView />} />                 {/* VIEW */}
        <Route path="/profile/client/edit" element={<ClientProfile />} />         {/* EDIT */}

        {/* PROJECT / PROPOSAL ROUTES (NEW) */}
        {/* This :projectId part allows the URL to change (e.g., /projects/1/apply) */}
        <Route path="/projects/:projectId/apply" element={<SubmitProposal />} />

        {/* 2. Add this route with your other FREELANCER ROUTES */}
        <Route path="/contracts" element={<FreelancerContracts />} />

      </Route>
    </Routes>
  );
}

export default App;