import { apiClient } from "../api/authClient";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  user: User;
  token: string;
};

type SignupData = {
  name: string;
  email: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

const signup = async (data: SignupData) => {
  return apiClient<User>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const login = async (data: LoginData) => {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const getCurrentUser = async () => {
  return apiClient<User>("/auth/me");
};

const logout = async () => {
  return apiClient<Record<string, never>>("/auth/logout", {
    method: "POST",
  });
};

export { signup, login, getCurrentUser, logout };
