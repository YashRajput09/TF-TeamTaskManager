import axios from "axios";
// import { json } from "react-router-dom";

const BackendUrl = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: BackendUrl,
  headers: {
    "Content-Type": "application/json",
  },
});
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
