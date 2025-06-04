import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", data);
    const result = await response.json();
    
    // Store token in localStorage
    localStorage.setItem("auth_token", result.token);
    
    return result;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/register", data);
    const result = await response.json();
    
    // Store token in localStorage
    localStorage.setItem("auth_token", result.token);
    
    return result;
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("current_user");
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("current_user");
    return userStr ? JSON.parse(userStr) : null;
  },

  setCurrentUser: (user: User) => {
    localStorage.setItem("current_user", JSON.stringify(user));
  },

  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("auth_token");
  },

  isAdmin: (): boolean => {
    const user = authAPI.getCurrentUser();
    return user?.role === "admin";
  }
};

// Add authorization header to requests
export const getAuthHeaders = () => {
  const token = authAPI.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
