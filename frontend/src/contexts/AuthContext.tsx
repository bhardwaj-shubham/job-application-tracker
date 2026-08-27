import { createContext } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type LoginData = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export { AuthContext };

export type { User, LoginData, AuthContextValue };
