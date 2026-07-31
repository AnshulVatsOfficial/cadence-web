"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Briefcase, CheckCircle2 } from "lucide-react";

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const { user, isLoading: authLoading } = useAuth();
  
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInvitation();
    } else {
      setLoading(false);
      setError("No invitation token provided.");
    }
  }, [token]);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/invitations/${token}`);
      setInvitation(res.data);
      if (res.data.status !== "PENDING") {
        setError(`This invitation is already ${res.data.status.toLowerCase()}.`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setAccepting(true);
      setError(null);
      const res = await api.post(`/invitations/${token}/accept`);
      router.push(`/projects/${res.data.projectId}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to accept invitation.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0052CC]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-[#DFE1E6]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-600 text-center">
              Invitation Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-[#172B4D]">
            {error}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-[#0052CC] hover:bg-[#0747A6] text-white"
            >
              Go Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-[#0052CC] rounded-[3px] flex items-center justify-center font-bold text-white text-2xl shadow-md">
            C
          </div>
        </div>
        
        <Card className="shadow-lg border-[#DFE1E6] rounded-[4px] bg-white">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-[#172B4D]">
              Project Invitation
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="bg-[#E6EFFC] p-3 rounded-full text-[#0052CC]">
                <Briefcase className="w-8 h-8" />
              </div>
              <p className="text-center text-[#5E6C84] text-sm leading-relaxed">
                You have been invited to join the project{" "}
                <strong className="text-[#172B4D]">{invitation?.projectName}</strong>{" "}
                as a <strong className="text-[#172B4D]">{invitation?.role}</strong>.
              </p>
            </div>

            <div className="bg-[#F4F5F7] p-4 rounded-[3px] border border-[#DFE1E6] mb-6">
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-[#5E6C84] mr-2" />
                <span className="text-[#172B4D] font-medium truncate">
                  {invitation?.email}
                </span>
              </div>
            </div>

            {!user ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-[#5E6C84]">
                  Please sign in or create an account with this email address to accept the invitation.
                </p>
                <div className="flex space-x-3 justify-center">
                  <Button
                    onClick={() => router.push(`/login?returnTo=/invite/accept?token=${token}`)}
                    variant="outline"
                    className="border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7]"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => router.push(`/signup?returnTo=/invite/accept?token=${token}`)}
                    className="bg-[#0052CC] hover:bg-[#0747A6] text-white"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold h-10"
                >
                  {accepting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  {accepting ? "Accepting..." : "Accept Invitation"}
                </Button>
                
                <p className="text-center text-xs text-[#5E6C84]">
                  Signed in as <strong>{user.email}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0052CC]"></div>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}
