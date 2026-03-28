import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

// Axios Interceptor for Refresh Token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === "TOKEN_EXPIRED" && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post("/api/auth/refresh");
        return axios(originalRequest);
      } catch (refreshError) {
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

interface User {
  id: string;
  name: string;
  role: "SuperAdmin" | "Admin" | "Manager" | "Sales" | "Marketing" | "Operations" | "Finance" | "HR" | "CustomerService";
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  login: async (email, password) => {
    const { data } = await axios.post("/api/auth/login", { email, password });
    set({ user: data.user });
  },
  logout: async () => {
    await axios.post("/api/auth/logout");
    set({ user: null });
  },
  checkAuth: async () => {
    try {
      const { data } = await axios.get("/api/auth/me");
      set({ user: data.user, loading: false });
    } catch (err) {
      set({ user: null, loading: false });
    }
  },
}));
