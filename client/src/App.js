import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ChooseRole from "./pages/auth/ChooseRole";
import ClientLogin from "./pages/auth/ClientLogin";
import ClientSignup from "./pages/auth/ClientSignup";
import FreelancerLogin from "./pages/auth/FreelancerLogin";
import FreelancerSignup from "./pages/auth/FreelancerSignup";
import FreelancerDashboard from "./pages/freelancer/Dashboard";
import FreelancerProfile from "./pages/freelancer/Profile";
import BrowseProjects from "./pages/freelancer/BrowseProjects";
import SubmitProposal from "./pages/freelancer/SubmitProposal";
import MyProposals from "./pages/freelancer/MyProposals";
import MyContracts from "./pages/freelancer/MyContracts";
import Messages from "./pages/freelancer/Messages";
import Reviews from "./pages/freelancer/Reviews";
import ClientDashboard from "./pages/client/Dashboard";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import OAuthCallback from "./pages/auth/OAuthCallback";

function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ChooseRole />} />
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/client/signup" element={<ClientSignup />} />
            <Route path="/freelancer/login" element={<FreelancerLogin />} />
            <Route path="/freelancer/signup" element={<FreelancerSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            
            <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
            <Route path="/freelancer/profile" element={<FreelancerProfile />} />
            <Route path="/freelancer/browse" element={<BrowseProjects />} />
            <Route path="/freelancer/submit-proposal/:projectId" element={<SubmitProposal />} />
            <Route path="/freelancer/proposals" element={<MyProposals />} />
            <Route path="/freelancer/contracts" element={<MyContracts />} />
            <Route path="/freelancer/messages" element={<Messages />} />
            <Route path="/freelancer/reviews" element={<Reviews />} />
            
            {/* Client Routes */}
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/messages" element={<Messages />} />
          </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
