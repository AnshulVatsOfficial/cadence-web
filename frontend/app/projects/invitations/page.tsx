"use client";

import React, { useState, useEffect } from "react";
import { ProjectProvider } from "../../../components/projects/ProjectContext";
import ProjectLayoutShell from "../../../components/projects/ProjectLayoutShell";
import { api } from "@/lib/api";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Button } from "../../../components/ui/button";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

function InvitationsContent() {
  const [loading, setLoading] = useState(true);
  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const router = useRouter();

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/invitations");
      setReceived(res.data.received || []);
      setSent(res.data.sent || []);
    } catch (err) {
      console.error("Error fetching invitations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (token: string) => {
    try {
      await api.post(`/invitations/${token}/accept`);
      fetchInvitations();
      // Wait for success, then we could optionally push to the project, but reloading list is fine.
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to accept invitation.");
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-50 text-green-700 border-green-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "EXPIRED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <ProjectLayoutShell>
      <div className="flex-grow w-full px-4 md:px-8 py-10 flex flex-col bg-[#FAFBFC]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#172B4D]">
            Invitations
          </h1>
          <p className="text-xs text-[#5E6C84] mt-1 leading-relaxed">
            Manage invitations you've received to join projects, and invitations you've sent to others.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full bg-gray-200" />
            <Skeleton className="h-24 w-full bg-gray-200" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Received Invitations */}
            <div>
              <h2 className="text-lg font-bold text-[#172B4D] mb-4">Received Invitations</h2>
              {received.length === 0 ? (
                <div className="bg-white border border-[#DFE1E6] rounded-[3px] p-8 text-center">
                  <p className="text-sm text-[#5E6C84]">You have no received invitations.</p>
                </div>
              ) : (
                <div className="bg-white border border-[#DFE1E6] rounded-[3px] overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F4F5F7] text-[#5E6C84] text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Project</th>
                        <th className="px-4 py-3 font-semibold">Invited By</th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFE1E6]">
                      {received.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#FAFBFC] transition-colors">
                          <td className="px-4 py-3 font-medium text-[#172B4D]">
                            {inv.project?.name || "Unknown Project"}
                          </td>
                          <td className="px-4 py-3 text-[#172B4D]">
                            {inv.invitedBy?.name || "A team member"}
                          </td>
                          <td className="px-4 py-3 text-[#5E6C84]">{inv.role}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-[10px] uppercase font-bold ${getStatusBadgeStyles(inv.status)}`}>
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {inv.status === "PENDING" && (
                              <Button
                                onClick={() => handleAccept(inv.token)}
                                className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs h-7 px-3 rounded-[3px]"
                              >
                                Accept
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sent Invitations */}
            <div>
              <h2 className="text-lg font-bold text-[#172B4D] mb-4">Sent Invitations</h2>
              {sent.length === 0 ? (
                <div className="bg-white border border-[#DFE1E6] rounded-[3px] p-8 text-center">
                  <p className="text-sm text-[#5E6C84]">You haven't sent any invitations.</p>
                </div>
              ) : (
                <div className="bg-white border border-[#DFE1E6] rounded-[3px] overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F4F5F7] text-[#5E6C84] text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Project</th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFE1E6]">
                      {sent.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#FAFBFC] transition-colors">
                          <td className="px-4 py-3 font-medium text-[#172B4D]">{inv.email}</td>
                          <td className="px-4 py-3 text-[#172B4D]">
                            {inv.project?.name || "Unknown Project"}
                          </td>
                          <td className="px-4 py-3 text-[#5E6C84]">{inv.role}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-[10px] uppercase font-bold ${getStatusBadgeStyles(inv.status)}`}>
                              {inv.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProjectLayoutShell>
  );
}

export default function InvitationsPage() {
  return (
    <ProjectProvider>
      <InvitationsContent />
    </ProjectProvider>
  );
}
