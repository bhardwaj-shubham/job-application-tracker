import { useEffect, useState, type ReactNode } from "react";

import { AuthContext } from "./AuthContext";
import type { AuthContextValue, LoginData, User } from "./AuthContext";
import {
  getCurrentUser,
  login as loginUser,
  logout as logoutUser,
} from "../services/auth/authService";

type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await getCurrentUser();

        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData) => {
    const response = await loginUser(data);

    setUser(response.data.user);
  };

  const logout = async () => {
    await logoutUser();

    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
