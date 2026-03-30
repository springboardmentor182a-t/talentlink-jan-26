import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL;

if (!baseURL) {
  throw new Error(
    "REACT_APP_API_BASE_URL environment variable is not set. " +
    "Please configure your API URL in the .env file. " +
    "See .env.example for examples."
  );
}

const api = axios.create({
  baseURL: baseURL,
});

export default api;
