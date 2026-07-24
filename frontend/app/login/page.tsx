"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/authContext";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import PasswordInput from "@/components/shared/PasswordInput";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loginWithGoogle, loginWithGithub, isLoading: authLoading } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user && !authLoading) {
      router.replace("/projects");
    }
  }, [user, authLoading, router]);

  // Block rendering login form completely if logged in or checking session
  if (authLoading || user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ds-bg-neutral-subtle">
        <Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" />
        <p className="mt-3 text-xs text-[#5E6C84] font-medium">Checking session...</p>
      </div>
    );
  }

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);

    try {
      await login(data.email, data.password);
      router.push("/projects");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Login failed. Please check your credentials.";
      setError(msg);
    }
  };

  const isFormDisabled = !isValid || isSubmitting || googleLoading;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-ds-bg-neutral-subtle px-4 sm:px-6 lg:px-8 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center space-x-2 text-brand font-bold text-3xl tracking-tight">
            <svg className="w-9 h-9 text-brand" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.553 2.052a.84.84 0 00-.77.012L2.355 7.1c-.43.25-.693.71-.693 1.21v10.38c0 .5.263.96.693 1.21l8.428 5.035c.24.143.524.155.773.033l8.093-3.953a.846.846 0 00.493-.762V9.897a.844.844 0 00-.472-.756L11.553 2.052zM12 4.12l6.837 4.103-6.837 3.34-6.837-3.34L12 4.12z" />
            </svg>
            <span className="font-extrabold text-ds-text">CADENCE</span>
          </div>
          <h2 className="mt-3 text-xl font-bold text-ds-text tracking-tight">
            Log in to your account
          </h2>
          <p className="mt-1 text-sm text-ds-text-subtle">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Card */}
        <div className="bg-ds-bg border border-ds-border rounded-lg shadow-sm p-8">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Social OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <GoogleSignInButton
              onSuccess={async (idToken) => {
                setError(null);
                setGoogleLoading(true);
                try {
                  await loginWithGoogle(idToken);
                  router.push("/projects");
                } catch (err: any) {
                  const msg =
                    err?.response?.data?.error ||
                    err?.message ||
                    "Google login failed.";
                  setError(msg);
                } finally {
                  setGoogleLoading(false);
                }
              }}
              onError={(msg) => setError(msg)}
              disabled={isSubmitting || googleLoading}
            />

            <button
              type="button"
              onClick={loginWithGithub}
              disabled={isSubmitting || googleLoading}
              className="w-full h-10 flex items-center justify-center space-x-2.5 px-4 bg-white border border-[#DFE1E6] hover:border-[#C1C7D0] hover:bg-[#FAFBFC] active:bg-[#EBECF0] text-[#172B4D] font-bold text-sm rounded-[3px] shadow-[0_1px_1px_rgba(9,30,66,0.08)] transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 flex-shrink-0 text-[#172B4D]" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ds-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-ds-bg px-2 text-ds-text-subtle font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-ds-text-subtle mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="name@company.com"
                className="w-full px-3 py-2 border border-ds-border rounded-md bg-ds-bg text-ds-text text-sm focus:outline-none focus:border-brand transition-colors"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-ds-text-subtle mb-1">
                Password
              </label>
              <PasswordInput
                {...register("password")}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isFormDisabled}
              className="w-full h-10 flex items-center justify-center space-x-2 bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-bold rounded-md text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log in</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ds-text-subtle">
            Don't have an account?{" "}
            <Link href="/signup" className="text-brand font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
