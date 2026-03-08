import React from "react";
import ClientProfile from "./components/profile/ClientProfile";
import FreelancerProfile from "./components/profile/FreelancerProfile";

function App() {
  return (
    <div>
      <h1>TalentLink Dashboard 🚀</h1>

      <FreelancerProfile />

      {/* optional */}
      <ClientProfile />
    </div>
  );
}

export default App;