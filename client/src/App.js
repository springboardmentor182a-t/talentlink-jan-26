import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ChooseRole from "./pages/auth/ChooseRole";
import ClientLogin from "./pages/auth/ClientLogin";
import ClientSignup from "./pages/auth/ClientSignup";
import FreelancerLogin from "./pages/auth/FreelancerLogin";
import FreelancerSignup from "./pages/auth/FreelancerSignup";
import ForgotPassword from "./pages/auth/ForgotPassword";

import SubmitProposal from "./pages/proposal/SubmitProposal";
import ViewProposals from "./pages/proposal/ViewProposals";
import ProposalTracking from "./pages/proposal/ProposalTracking";

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

  
          <Route path="/submit-proposal" element={<SubmitProposal />} />
          <Route path="/view-proposals" element={<ViewProposals />} />
          <Route path="/proposal-tracking" element={<ProposalTracking />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
