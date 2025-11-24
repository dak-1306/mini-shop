import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:4000/api", // Gọi relay server
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // để gửi/nhận httpOnly cookie từ relay
});

export default api;
