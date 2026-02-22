// client/src/services/dashboardService.js

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

// --- 1. Fetch Dashboard Stats (GET) ---
export const fetchDashboardData = async () => {
  try {
    const response = await fetch(`${API_URL}/client/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

// --- 2. Create New Project (POST) ---
export const createProject = async (projectData) => {
  try {
    const response = await fetch(`${API_URL}/projects/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create project");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};
