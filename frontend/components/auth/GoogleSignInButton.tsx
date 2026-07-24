"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => Promise<void>;
  onError: (errorMsg: string) => void;
  disabled?: boolean;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  disabled,
}: GoogleSignInButtonProps) {
  const hiddenGisRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCredentialResponse = useCallback(
    async (response: { credential?: string }) => {
      if (response.credential) {
        try {
          setIsProcessing(true);
          await onSuccess(response.credential);
        } catch (err: any) {
          const msg =
            err?.response?.data?.error ||
            err?.message ||
            "Google authentication failed.";
          onError(msg);
        } finally {
          setIsProcessing(false);
        }
      } else {
        onError("Google sign-in did not return a credential.");
      }
    },
    [onSuccess, onError],
  );

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      onError("Google Client ID is missing in configuration.");
      return;
    }

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => onError("Failed to load Google Sign-In SDK.");
    document.head.appendChild(script);
  }, [onError]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!scriptLoaded || !window.google?.accounts?.id || !clientId) return;
    if (isInitializedRef.current) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
      });
      isInitializedRef.current = true;

      if (hiddenGisRef.current) {
        hiddenGisRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(hiddenGisRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: "continue_with",
          width: 320,
        });
      }
    } catch (err: any) {
      console.error("Error initializing Google GIS:", err);
    }
  }, [scriptLoaded, handleCredentialResponse]);

  const handleCustomButtonClick = () => {
    if (disabled || isProcessing) return;

    // 1. Try clicking the hidden Google rendered element if present
    const gisBtn = hiddenGisRef.current?.querySelector(
      "div[role=button], iframe",
    ) as HTMLElement | null;

    if (gisBtn) {
      gisBtn.click();
      return;
    }

    // 2. Fallback to google.accounts.id.prompt()
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      onError("Google Sign-In SDK is loading. Please try again in a moment.");
    }
  };

  return (
    <>
      {/* Hidden container for Google GIS SDK iframe trigger */}
      <div
        ref={hiddenGisRef}
        className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none -z-50"
        aria-hidden="true"
      />

      {/* Jira Design System Custom Styled Button */}
      <button
        type="button"
        onClick={handleCustomButtonClick}
        disabled={disabled || isProcessing}
        className="w-full h-10 flex items-center justify-center space-x-2.5 px-4 bg-white border border-[#DFE1E6] hover:border-[#C1C7D0] hover:bg-[#FAFBFC] active:bg-[#EBECF0] text-[#172B4D] font-bold text-sm rounded-[3px] shadow-[0_1px_1px_rgba(9,30,66,0.08)] transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{isProcessing ? "Signing in..." : "Continue with Google"}</span>
      </button>
    </>
  );
}
