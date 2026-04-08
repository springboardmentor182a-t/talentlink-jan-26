import { createContext, useContext } from "react";

export const FreelancerShellContext = createContext({
  profileData: null,
  loading: true,
  error: "",
  refreshProfile: async () => {},
});

export function useFreelancerShell() {
  return useContext(FreelancerShellContext);
}
