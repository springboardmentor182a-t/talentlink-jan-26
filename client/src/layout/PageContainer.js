import React from "react";
import Sidebar from "./Sidebar";

const PageContainer = ({ children }) => {
  return (
    <div style={{ display: "flex" }}>
      
      <Sidebar />

      <div style={{ flex: 1, background: "#f6f8fc", minHeight: "100vh", padding: "30px" }}>
        {children}
      </div>

    </div>
  );
};

export default PageContainer;