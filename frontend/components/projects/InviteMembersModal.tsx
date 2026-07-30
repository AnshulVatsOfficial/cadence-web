import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { api } from "@/lib/api";

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
  initialProjectId?: string;
  isProjectFixed?: boolean;
}

export default function InviteMembersModal({
  isOpen,
  onClose,
  projects,
  initialProjectId,
  isProjectFixed,
}: InviteMembersModalProps) {
  const [projectId, setProjectId] = useState<string>(initialProjectId || projects[0]?.id || "");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Default project selection when opened
  React.useEffect(() => {
    if (isOpen) {
      if (initialProjectId) {
        setProjectId(initialProjectId);
      } else if (projects.length > 0 && !projectId) {
        setProjectId(projects[0].id);
      }
    }
  }, [isOpen, projects, projectId, initialProjectId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!projectId || !email) {
      setError("Please select a project and enter an email address.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/invitations", {
        projectId,
        email,
        role,
      });
      setSuccess(true);
      setEmail("");
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.data?.error === "LIMIT_REACHED") {
        onClose();
        router.push("/pricing");
        return;
      }
      setError(err?.response?.data?.error || err.response?.data?.message || "Failed to send invitation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-[4px] p-6 shadow-lg border border-[#DFE1E6]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-[#172B4D]">
            Invite Team Member
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5E6C84] mt-1 leading-relaxed">
            Send an email invitation to collaborate on a project.
          </DialogDescription>
        </DialogHeader>

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm font-medium rounded border border-green-200">
            Invitation sent successfully!
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
              Select Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={isProjectFixed}
              className={`w-full text-sm py-2 px-3 border rounded-[3px] focus:outline-none focus:ring-1 transition-all ${
                isProjectFixed
                  ? "bg-[#F4F5F7] text-[#5E6C84] border-[#DFE1E6] cursor-not-allowed"
                  : "bg-white border-[#DFE1E6] focus:border-[#0052CC] focus:ring-[#0052CC]"
              }`}
              required
            >
              <option value="" disabled>
                -- Select a project --
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full text-sm border-[#DFE1E6] rounded-[3px] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-sm py-2 px-3 bg-white border border-[#DFE1E6] rounded-[3px] focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all"
            >
              <option value="MEMBER">Member (can edit issues)</option>
              <option value="VIEWER">Viewer (read-only)</option>
              <option value="ADMIN">Admin (can manage settings)</option>
            </select>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-[#DFE1E6] text-[#5E6C84] hover:bg-[#F4F5F7] rounded-[3px] h-8 text-xs font-semibold px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || projects.length === 0}
              className="bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-[3px] h-8 text-xs font-semibold px-4"
            >
              {loading ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
