// client/src/services/dashboardService.js

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

// --- 1. Fetch Dashboard Stats (GET) ---
export const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/client/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const data = await response.json();

    // ✅ DEBUG (VERY IMPORTANT)
    console.log("✅ Dashboard API Response:", data);

    // ✅ Always return data safely
    return data || {};
    
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);

    // ✅ Prevent frontend crash
    return {};
  }
};

// --- 2. Create New Project (POST) ---
export const createProject = async (projectData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/projects/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create project");
    }

    const data = await response.json();

    console.log("✅ Project Created:", data);

    return data;
  } catch (error) {
    console.error("❌ Error creating project:", error);
    throw error;
  }
};