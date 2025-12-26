import { createContext, useEffect, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
