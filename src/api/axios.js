import axios from "axios";

/*
  Lấy baseURL tại runtime:
  - Nếu đang chạy trong trình duyệt: dùng window.location.origin + '/api' => gọi cùng host (yêu cầu proxy trên dev)
  - Nếu không (ví dụ build/SSR) fallback về import.meta.env.VITE_API_BASE hoặc mặc định http://localhost:4000/api
*/
const runtimeBase =
  typeof window !== "undefined" && window?.location?.origin
    ? `${window.location.origin.replace(/\/$/, "")}/api`
    : import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const api = axios.create({
  baseURL: runtimeBase,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // giữ cookie httpOnly nếu backend set
});

export default api;
