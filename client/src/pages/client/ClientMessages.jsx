import React, { useState } from "react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../layout/Navbar";
import ChatWorkspace from "../../components/messages/ChatWorkspace";

const ClientMessages = () => {
  const [profile, setProfile] = useState({
    full_name: "Account User",
    role: "Client",
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar profile={profile} />
        <main className="flex-1 overflow-y-auto p-8">
          <ChatWorkspace emptyTitle="Client Messages" onProfileLoaded={setProfile} />
        </main>
      </div>
    </div>
  );
};

export default ClientMessages;
