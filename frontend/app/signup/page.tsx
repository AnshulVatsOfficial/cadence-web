"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export default function SignupPage() {
  const router = useRouter();
  const { user, signup, loginWithGoogle, loginWithGithub, isLoading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/projects");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup(email, password, name || undefined);
      router.push("/projects");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle("mock_g_demo123456");
      router.push("/projects");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Google sign in failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
            Create your account
          </h2>
          <p className="mt-1 text-sm text-ds-text-subtle">
            Get started with Cadence project management today.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-ds-bg border border-ds-border rounded-lg shadow-sm p-8">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Social OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 border border-ds-border rounded-md hover:bg-ds-bg-neutral transition-colors text-sm font-semibold text-ds-text disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={loginWithGithub}
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 border border-ds-border rounded-md hover:bg-ds-bg-neutral transition-colors text-sm font-semibold text-ds-text disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-ds-text" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ds-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-ds-bg px-2 text-ds-text-subtle font-medium">
                Or signup with email
              </span>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-ds-text-subtle mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 border border-ds-border rounded-md bg-ds-bg text-ds-text text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-ds-text-subtle mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 border border-ds-border rounded-md bg-ds-bg text-ds-text text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-ds-text-subtle mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2 border border-ds-border rounded-md bg-ds-bg text-ds-text text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white font-semibold rounded-md text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ds-text-subtle">
            Already have an account?{" "}
            <Link href="/login" className="text-brand font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
