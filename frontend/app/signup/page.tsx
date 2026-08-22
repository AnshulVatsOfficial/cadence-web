"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/authContext";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import PasswordInput from "@/components/shared/PasswordInput";
import { Loader2, Check, X, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(20, "Password cannot exceed 20 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Password must contain at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character (!@#$%^&*)");

const signupSchema = z.object({
  name: z.string().min(2, "Full name is required (at least 2 characters)"),
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
});

type SignupFormValues = z.infer<typeof signupSchema>;

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/projects";
  const { user, signup, sendMagicLink, loginWithGoogle, loginWithGithub, isLoading: authLoading } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Magic Link Success State
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignupFormValues>({
    mode: "onChange",
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const passwordValue = watch("password") || "";

  // Password Validation Checkers for real-time requirement indicator
  const passwordRequirements = [
    { label: "8 to 20 characters", valid: passwordValue.length >= 8 && passwordValue.length <= 20 },
    { label: "1 uppercase letter (A-Z)", valid: /[A-Z]/.test(passwordValue) },
    { label: "1 lowercase letter (a-z)", valid: /[a-z]/.test(passwordValue) },
    { label: "1 number (0-9)", valid: /[0-9]/.test(passwordValue) },
    { label: "1 special character (!@#$%^&*)", valid: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

  useEffect(() => {
    if (user && !authLoading) {
      router.replace(returnTo);
    }
  }, [user, authLoading, router, returnTo]);

  // Block rendering signup form completely if logged in or checking session
  if (authLoading || user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ds-bg-neutral-subtle">
        <Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" />
        <p className="mt-3 text-xs text-[#5E6C84] font-medium">Checking session...</p>
      </div>
    );
  }

  const onSubmit = async (data: SignupFormValues) => {
    setError(null);
    setResendMessage(null);

    try {
      await signup(data.email, data.password, data.name);
      setSubmittedEmail(data.email);
      setMagicLinkSent(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Signup failed. Please try again.";
      setError(msg);
    }
  };

  const handleResendMagicLink = async () => {
    if (!submittedEmail || resending) return;
    setResending(true);
    setResendMessage(null);
    try {
      const res = await sendMagicLink(submittedEmail);
      setResendMessage(res.message || "Magic link resent successfully! Check your inbox.");
    } catch (err: any) {
      setResendMessage(err?.response?.data?.error || "Failed to resend magic link.");
    } finally {
      setResending(false);
    }
  };

  const isFormDisabled = !isValid || isSubmitting || googleLoading;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-ds-bg-neutral-subtle px-4 sm:px-6 lg:px-8 select-none py-12">
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
            {magicLinkSent ? "Check your email" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-ds-text-subtle">
            {magicLinkSent
              ? `We sent a magic link to ${submittedEmail}`
              : "Get started with Cadence project management today."}
          </p>
        </div>

        {/* Magic Link Confirmation Card */}
        {magicLinkSent ? (
          <div className="bg-white border border-[#DFE1E6] rounded-lg shadow-sm p-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#DEEBFF] text-[#0052CC] flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-[#0052CC]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#172B4D]">
                Magic Link Sent!
              </h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                We sent a magic link to <strong className="text-[#172B4D]">{submittedEmail}</strong>. Click the link in your email to confirm your account and log straight into your workspace.
              </p>
            </div>

            {resendMessage && (
              <div className="p-3 text-xs bg-blue-50 border border-blue-200 text-[#0052CC] rounded font-medium">
                {resendMessage}
              </div>
            )}

            <div className="pt-2 space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleResendMagicLink}
                disabled={resending}
                className="w-full h-10 flex items-center justify-center space-x-2 bg-white border border-[#DFE1E6] hover:bg-[#FAFBFC] text-[#172B4D] font-bold rounded-[3px] text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resending Link...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Resend Magic Link</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMagicLinkSent(false);
                  setError(null);
                }}
                className="w-full h-9 flex items-center justify-center space-x-1.5 text-xs text-[#5E6C84] hover:text-[#172B4D] font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Use a different email address</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Form Card */
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
                      "Google sign up failed.";
                    setError(msg);
                  } finally {
                    setGoogleLoading(false);
                  }
                }}
                onError={(msg) => setError(msg)}
                disabled={isSubmitting || googleLoading}
              />

              <Button
                type="button"
                variant="outline"
                onClick={loginWithGithub}
                disabled={isSubmitting || googleLoading}
                className="w-full h-10 flex items-center justify-center space-x-2.5 px-4 bg-white border border-[#DFE1E6] hover:border-[#C1C7D0] hover:bg-[#FAFBFC] active:bg-[#EBECF0] text-[#172B4D] font-bold text-sm rounded-[3px] shadow-[0_1px_1px_rgba(9,30,66,0.08)] transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 flex-shrink-0 text-[#172B4D]" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>Continue with GitHub</span>
              </Button>
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
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <Label className="block text-xs font-semibold uppercase text-ds-text-subtle mb-1">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  {...register("name")}
                  placeholder="Jane Doe"
                  className="w-full h-10 px-3 py-2 border-ds-border rounded-md bg-ds-bg text-ds-text text-sm focus-visible:ring-1 focus-visible:ring-brand transition-colors"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="block text-xs font-semibold uppercase text-ds-text-subtle mb-1">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="name@company.com"
                  className="w-full h-10 px-3 py-2 border-ds-border rounded-md bg-ds-bg text-ds-text text-sm focus-visible:ring-1 focus-visible:ring-brand transition-colors"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="block text-xs font-semibold uppercase text-ds-text-subtle mb-1">
                  Password <span className="text-red-500">*</span>
                </Label>
                <PasswordInput
                  {...register("password")}
                  placeholder="Enter password..."
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.password.message}
                  </p>
                )}

                {/* Password Requirements Checklist */}
                {passwordValue.length > 0 && (
                  <div className="mt-3 p-3 bg-[#F4F5F7] border border-[#DFE1E6] rounded-[3px] space-y-1.5">
                    <p className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider mb-1">
                      Password Requirements:
                    </p>
                    {passwordRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs">
                        {req.valid ? (
                          <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        )}
                        <span
                          className={
                            req.valid
                              ? "text-green-700 font-medium"
                              : "text-[#5E6C84]"
                          }
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isFormDisabled}
                className="w-full h-10 flex items-center justify-center space-x-2 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white font-bold rounded-[3px] text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Magic Link...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Sign up & Get Magic Link</span>
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ds-text-subtle">
              Already have an account?{" "}
              <Link href="/login" className="text-brand font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-ds-bg-neutral-subtle">
        <Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" />
        <p className="mt-3 text-xs text-[#5E6C84] font-medium">Loading...</p>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
}
