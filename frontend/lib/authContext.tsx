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

export interface MagicLinkResponse {
  message: string;
  magicLink?: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<MagicLinkResponse>;
  sendMagicLink: (email: string) => Promise<MagicLinkResponse>;
  verifyMagicLink: (token: string) => Promise<User>;
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
    if (typeof document !== "undefined") {
      if (newUser) {
        document.cookie =
          "cadence_logged_in=true; path=/; max-age=2592000; SameSite=Lax";
      } else {
        document.cookie =
          "cadence_logged_in=; path=/; max-age=0; SameSite=Lax";
      }
    }
  };

  // Silently refresh token on app mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const refreshRes = await api.post("/auth/refresh");
        const token = refreshRes.data.accessToken;
        let activeUser = refreshRes.data.user;

        if (token) {
          if (!activeUser) {
            try {
              const meRes = await api.get("/auth/me");
              activeUser = meRes.data.user;
            } catch (err) {
              // Ignore
            }
          }
          if (isMounted) {
            updateTokensAndUser(activeUser || null, token);
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

  const signup = async (email: string, password: string, name: string): Promise<MagicLinkResponse> => {
    const res = await api.post("/auth/signup", { email, password, name });
    return res.data;
  };

  const sendMagicLink = async (email: string): Promise<MagicLinkResponse> => {
    const res = await api.post("/auth/magic-link", { email });
    return res.data;
  };

  const verifyMagicLink = async (token: string) => {
    const res = await api.post("/auth/verify-magic-link", { token });
    updateTokensAndUser(res.data.user, res.data.accessToken);
    return res.data.user;
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
        sendMagicLink,
        verifyMagicLink,
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
