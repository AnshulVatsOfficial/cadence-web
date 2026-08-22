"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuthData } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("No authorization code provided in OAuth callback.");
      return;
    }

    async function exchangeCode() {
      try {
        const res = await api.post("/auth/github/exchange", { code });
        const { user, accessToken } = res.data;
        setAuthData(user, accessToken);
        router.push("/projects");
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Failed to complete GitHub authentication.";
        setError(msg);
      }
    }

    exchangeCode();
  }, [searchParams, router, setAuthData]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ds-bg-neutral-subtle p-4">
        <div className="bg-ds-bg border border-ds-border rounded-lg p-6 max-w-md text-center">
          <h2 className="text-lg font-bold text-red-600 mb-2">
            Authentication Error
          </h2>
          <p className="text-sm text-ds-text-subtle mb-4">{error}</p>
          <Button
            type="button"
            onClick={() => router.push("/login")}
            className="py-2 px-4 bg-brand text-white font-semibold rounded-[3px] text-sm hover:bg-brand-hover"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ds-bg-neutral-subtle">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-ds-text">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ds-bg-neutral-subtle">
          <p className="text-sm text-ds-text-subtle">Loading OAuth session...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
