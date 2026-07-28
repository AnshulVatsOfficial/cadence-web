"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

function VerifyMagicLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyMagicLink, user, isLoading: authLoading } = useAuth();

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    // Wait until AuthContext finishes initial session check
    if (authLoading) return;

    // Rule 1: If user is ALREADY logged in, redirect directly to /projects
    if (user) {
      setStatus("success");
      router.push("/projects");
      return;
    }

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("No magic link token provided in URL.");
      return;
    }

    // Prevent double execution on mount
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    async function executeVerification() {
      try {
        await verifyMagicLink(token!);
        setStatus("success");
        setTimeout(() => {
          router.push("/projects");
        }, 1000);
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Magic link is invalid, expired, or has already been used.";
        setStatus("error");
        setErrorMessage(msg);
      }
    }

    executeVerification();
  }, [searchParams, verifyMagicLink, router, user, authLoading]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-ds-bg-neutral-subtle px-4 sm:px-6 select-none">
      <div className="w-full max-w-md bg-white border border-[#DFE1E6] rounded-lg shadow-sm p-8 text-center space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-center space-x-2 text-[#0052CC] font-bold text-2xl tracking-tight">
          <svg className="w-8 h-8 text-[#0052CC]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.553 2.052a.84.84 0 00-.77.012L2.355 7.1c-.43.25-.693.71-.693 1.21v10.38c0 .5.263.96.693 1.21l8.428 5.035c.24.143.524.155.773.033l8.093-3.953a.846.846 0 00.493-.762V9.897a.844.844 0 00-.472-.756L11.553 2.052zM12 4.12l6.837 4.103-6.837 3.34-6.837-3.34L12 4.12z" />
          </svg>
          <span className="font-extrabold text-[#172B4D]">CADENCE</span>
        </div>

        {/* Verifying State */}
        {status === "verifying" && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 animate-spin text-[#0052CC]" />
            </div>
            <h2 className="text-lg font-bold text-[#172B4D]">Verifying Magic Link</h2>
            <p className="text-xs text-[#5E6C84] leading-relaxed">
              Please wait while we confirm your magic link and log you into Cadence...
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-[#172B4D]">Authentication Confirmed!</h2>
            <p className="text-xs text-green-700 font-medium leading-relaxed">
              Redirecting to your projects...
            </p>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-[#172B4D]">Verification Failed</h2>
            <p className="text-xs text-red-600 font-medium leading-relaxed bg-red-50 p-3 rounded border border-red-200">
              {errorMessage}
            </p>
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                href="/signup"
                className="w-full h-10 flex items-center justify-center space-x-2 bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold rounded-[3px] text-sm transition-colors"
              >
                <span>Request New Magic Link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full h-9 flex items-center justify-center text-xs text-[#5E6C84] hover:text-[#172B4D] font-semibold transition-colors"
              >
                Back to Log in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyMagicLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ds-bg-neutral-subtle">
          <Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" />
        </div>
      }
    >
      <VerifyMagicLinkContent />
    </Suspense>
  );
}
