import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("devtrack_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("devtrack_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getProfile()
      .then(({ user: profile }) => {
        setUser(profile);
        localStorage.setItem("devtrack_user", JSON.stringify(profile));
      })
      .catch(() => {
        localStorage.removeItem("devtrack_token");
        localStorage.removeItem("devtrack_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = useCallback((data) => {
    localStorage.setItem("devtrack_token", data.token);
    localStorage.setItem("devtrack_user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login({ email, password });
      persistSession(data);
      return data.user;
    },
    [persistSession]
  );

  const register = useCallback(
    async (name, email, password) => {
      const data = await authApi.register({ name, email, password });
      persistSession(data);
      return data.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("devtrack_token");
    localStorage.removeItem("devtrack_user");
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const { user: profile } = await authApi.getProfile();
    setUser(profile);
    localStorage.setItem("devtrack_user", JSON.stringify(profile));
    return profile;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
