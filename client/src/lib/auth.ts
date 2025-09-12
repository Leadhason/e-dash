import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", { username, password });
    return response.json();
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  }
};

export const getAuthToken = () => localStorage.getItem("auth_token");

export const setAuthToken = (token: string) => localStorage.setItem("auth_token", token);

export const isAuthenticated = () => !!getAuthToken();

// Add auth token to API requests
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
