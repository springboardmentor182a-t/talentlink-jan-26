import React from "react";
import Sidebar from "./Sidebar";

function PageContainer({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export default PageContainer;
