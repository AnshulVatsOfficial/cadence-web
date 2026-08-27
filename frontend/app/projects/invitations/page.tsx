"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Check, X, Trash2, Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

export default function InvitationsPage() {
  const [loading, setLoading] = useState(true);
  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);
  const router = useRouter();

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/invitations");
      setReceived(res.data.received || []);
      setSent(res.data.sent || []);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      toast.error("Failed to load invitations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (token: string) => {
    try {
      setActionId(token);
      await api.post(`/invitations/${token}/accept`);
      toast.success("Invitation accepted! You are now a project member.");
      fetchInvitations();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to accept invitation.");
    } finally {
      setActionId(null);
    }
  };

  const handleDecline = async (token: string) => {
    try {
      setActionId(token);
      await api.post(`/invitations/${token}/decline`);
      toast.success("Invitation declined.");
      fetchInvitations();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to decline invitation.");
    } finally {
      setActionId(null);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    try {
      setActionId(invitationId);
      await api.delete(`/invitations/${invitationId}`);
      toast.success("Invitation revoked successfully.");
      fetchInvitations();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to revoke invitation.");
    } finally {
      setActionId(null);
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-50 text-green-700 border-green-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "DECLINED":
        return "bg-red-50 text-red-700 border-red-200";
      case "EXPIRED":
        return "bg-gray-50 text-gray-600 border-gray-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="flex-1 w-full px-4 md:px-8 py-8 flex flex-col bg-[#FAFBFC]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#172B4D]">
          Invitations
        </h1>
        <p className="text-xs text-[#5E6C84] mt-1 leading-relaxed">
          Manage invitations you have received to join projects, as well as pending invitations you've sent to team members.
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0052CC]" />
                <span>Received Invitations</span>
                {received.filter((i) => i.status === "PENDING").length > 0 && (
                  <Badge className="bg-[#0052CC] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {received.filter((i) => i.status === "PENDING").length} pending
                  </Badge>
                )}
              </h2>
            </div>

            {received.length === 0 ? (
              <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-8 text-center shadow-2xs">
                <p className="text-xs text-[#5E6C84]">You have no received project invitations.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-2xs overflow-hidden">
                <Table className="w-full text-left text-xs">
                  <TableHeader className="bg-[#F4F5F7] text-[#5E6C84] text-[11px] font-semibold tracking-wider uppercase border-b border-[#DFE1E6]">
                    <TableRow className="border-[#DFE1E6] hover:bg-transparent">
                      <TableHead className="px-4 py-2.5 font-bold text-[#5E6C84] h-auto">Project</TableHead>
                      <TableHead className="px-4 py-2.5 font-bold text-[#5E6C84] h-auto">Invited By</TableHead>
                      <TableHead className="px-4 py-2.5 font-bold text-[#5E6C84] h-auto">Role</TableHead>
                      <TableHead className="px-4 py-2.5 font-bold text-[#5E6C84] h-auto">Date Sent</TableHead>
                      <TableHead className="px-4 py-2.5 font-bold text-[#5E6C84] h-auto">Status</TableHead>
                      <TableHead className="px-4 py-2.5 font-bold text-[#5E6C84] text-right h-auto">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-[#DFE1E6]">
                    {received.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-[#FAFBFC] transition-colors border-[#DFE1E6]">
                        <TableCell className="px-4 py-3 font-bold text-[#172B4D]">
                          {inv.project?.name || "Unknown Project"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-[#172B4D]">
                          {inv.invitedBy?.name || "A team member"}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-semibold text-[#5E6C84]">{inv.role}</TableCell>
                        <TableCell className="px-4 py-3 text-[#5E6C84] text-[11px]">
                          {inv.createdAt
                            ? formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })
                            : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-bold rounded-[3px] px-2 py-0.5 ${getStatusBadgeStyles(
                              inv.status,
                            )}`}
                          >
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          {inv.status === "PENDING" && (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                type="button"
                                onClick={() => handleAccept(inv.token)}
                                disabled={actionId === inv.token}
                                size="sm"
                                className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs h-7 px-3 rounded-[3px] flex items-center gap-1"
                              >
                                {actionId === inv.token ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Accept</span>
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleDecline(inv.token)}
                                disabled={actionId === inv.token}
                                size="sm"
                                className="border-[#DFE1E6] text-[#DE350B] hover:bg-red-50 text-xs h-7 px-2.5 rounded-[3px] flex items-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                <span>Decline</span>
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Sent Invitations */}
          <div>
            <h2 className="text-base font-bold text-[#172B4D] mb-3">Sent Invitations</h2>
            {sent.length === 0 ? (
              <div className="bg-white border border-[#DFE1E6] rounded-[4px] p-8 text-center shadow-2xs">
                <p className="text-xs text-[#5E6C84]">You haven't sent any invitations yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-2xs overflow-hidden">
                <Table className="w-full text-left text-xs">
                  <TableHeader className="bg-[#F4F5F7] text-[#5E6C84] text-[11px] font-semibold tracking-wider uppercase border-b border-[#DFE1E6]">
                    <TableRow className="border-[#DFE1E6] hover:bg-transparent">
                      <TableHead className="px-4 py-2.5 font-bold text-[#5E6C84] h-auto">Email</TableHead>
                      <TableHead className="px-4 py-2.5 font-bold text-[#5E6C84] h-auto">Project</TableHead>
                      <TableHead className="px-4 py-2.5 font-bold text-[#5E6C84] h-auto">Role</TableHead>
                      <TableHead className="px-4 py-2.5 font-bold text-[#5E6C84] h-auto">Date Sent</TableHead>
                      <TableHead className="px-4 py-2.5 font-bold text-[#5E6C84] h-auto">Status</TableHead>
                      <TableHead className="px-4 py-2.5 font-bold text-[#5E6C84] text-right h-auto">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-[#DFE1E6]">
                    {sent.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-[#FAFBFC] transition-colors border-[#DFE1E6]">
                        <TableCell className="px-4 py-3 font-bold text-[#172B4D]">{inv.email}</TableCell>
                        <TableCell className="px-4 py-3 text-[#172B4D]">
                          {inv.project?.name || "Unknown Project"}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-semibold text-[#5E6C84]">{inv.role}</TableCell>
                        <TableCell className="px-4 py-3 text-[#5E6C84] text-[11px]">
                          {inv.createdAt
                            ? formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })
                            : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-bold rounded-[3px] px-2 py-0.5 ${getStatusBadgeStyles(
                              inv.status,
                            )}`}
                          >
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          {inv.status === "PENDING" && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleRevoke(inv.id)}
                              disabled={actionId === inv.id}
                              size="sm"
                              className="text-[#DE350B] hover:bg-red-50 text-xs h-7 px-2 rounded-[3px] flex items-center gap-1"
                              title="Revoke invitation"
                            >
                              {actionId === inv.id ? (
                                <Loader2 className="w-3 h-3 animate-spin text-[#DE350B]" />
                              ) : (
                                <>
                                  <Trash2 className="w-3 h-3" />
                                  <span>Revoke</span>
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
