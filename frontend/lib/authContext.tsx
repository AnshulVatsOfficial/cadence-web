"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setAccessToken, getAccessToken } from "./api";

export interface User {
  id: string;
  email: string;
  name: string | null;
  authProvider?: string;
  isEmailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithGithub: () => void;
  logout: () => Promise<void>;
  setAuthData: (user: User, accessToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const updateTokensAndUser = (
    newUser: User | null,
    newAccessToken: string | null,
  ) => {
    setUser(newUser);
    setAccessTokenState(newAccessToken);
    setAccessToken(newAccessToken);
  };

  // Silently refresh token on app mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const refreshRes = await api.post("/auth/refresh");
        const token = refreshRes.data.accessToken;

        if (token) {
          setAccessToken(token);
          if (isMounted) setAccessTokenState(token);

          const meRes = await api.get("/auth/me");
          if (isMounted && meRes.data.user) {
            setUser(meRes.data.user);
          }
        }
      } catch (err) {
        // No active session or refresh expired
        if (isMounted) {
          updateTokensAndUser(null, null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    updateTokensAndUser(res.data.user, res.data.accessToken);
  };

  const signup = async (email: string, password: string, name?: string) => {
    const res = await api.post("/auth/signup", { email, password, name });
    updateTokensAndUser(res.data.user, res.data.accessToken);
  };

  const loginWithGoogle = async (idToken: string) => {
    const res = await api.post("/auth/google", { idToken });
    updateTokensAndUser(res.data.user, res.data.accessToken);
  };

  const loginWithGithub = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "mock_github_client_id";
    const redirectUri =
      process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI ||
      "http://localhost:4000/api/auth/github/callback";
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&scope=user:email`;
    window.location.href = url;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Ignore errors on logout
    } finally {
      updateTokensAndUser(null, null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const setAuthData = (newUser: User, newAccessToken: string) => {
    updateTokensAndUser(newUser, newAccessToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        loginWithGithub,
        logout,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
