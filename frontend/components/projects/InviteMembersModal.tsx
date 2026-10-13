import React, { useState, useEffect } from "react";
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
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { api } from "@/lib/api";
import { useProject } from "./ProjectContext";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
  initialProjectId?: string;
  isProjectFixed?: boolean;
  onInviteSuccess?: () => void;
}

export default function InviteMembersModal({
  isOpen,
  onClose,
  projects,
  initialProjectId,
  isProjectFixed,
  onInviteSuccess,
}: InviteMembersModalProps) {
  const [projectId, setProjectId] = useState<string>(initialProjectId || projects[0]?.id || "");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { triggerSubscriptionUpgrade } = useProject();

  // Reset state and set default project selection when opened
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      setLoading(false);
      setEmail("");
      if (initialProjectId) {
        setProjectId(initialProjectId);
      } else if (projects.length > 0 && !projectId) {
        setProjectId(projects[0].id);
      }
    }
  }, [isOpen, projects, projectId, initialProjectId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || success) return;

    setError(null);
    setSuccess(false);

    if (!projectId || !email.trim()) {
      setError("Please select a project and enter an email address.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/invitations", {
        projectId,
        email: email.trim(),
        role,
      });

      setSuccess(true);
      toast.success(`Invitation sent successfully to ${email.trim()}`);
      setEmail("");

      if (onInviteSuccess) {
        onInviteSuccess();
      }

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.data?.error === "LIMIT_REACHED") {
        onClose();
        triggerSubscriptionUpgrade("You've reached the maximum number of team members allowed on your current plan. Please upgrade to invite more members.");
        return;
      }
      const errMsg = err?.response?.data?.error || err.response?.data?.message || "Failed to send invitation.";
      setError(errMsg);
      toast.error(errMsg);
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
          <div className="space-y-1.5">
            <Label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider">
              Select Project
            </Label>
            <Select
              value={projectId}
              onValueChange={setProjectId}
              disabled={isProjectFixed}
            >
              <SelectTrigger
                className={`w-full text-sm h-10 border-[#DFE1E6] rounded-[3px] focus-visible:ring-1 focus-visible:ring-[#0052CC] ${
                  isProjectFixed
                    ? "bg-[#F4F5F7] text-[#5E6C84] cursor-not-allowed"
                    : "bg-white"
                }`}
              >
                <SelectValue placeholder="-- Select a project --" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFE1E6]">
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-sm">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider">
              Email Address
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              disabled={loading || success}
              className="w-full text-sm h-10 border-[#DFE1E6] rounded-[3px] focus-visible:ring-1 focus-visible:ring-[#0052CC] disabled:opacity-60"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider">
              Role
            </Label>
            <Select value={role} onValueChange={setRole} disabled={loading || success}>
              <SelectTrigger className="w-full text-sm h-10 bg-white border-[#DFE1E6] rounded-[3px] focus-visible:ring-1 focus-visible:ring-[#0052CC] disabled:opacity-60">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFE1E6]">
                <SelectItem value="MEMBER" className="text-sm">
                  Member (can edit issues)
                </SelectItem>
                <SelectItem value="VIEWER" className="text-sm">
                  Viewer (read-only)
                </SelectItem>
                <SelectItem value="ADMIN" className="text-sm">
                  Admin (can manage settings)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-6 flex items-center justify-end space-x-2">
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
              disabled={loading || success || projects.length === 0}
              className={`rounded-[3px] h-8 text-xs font-semibold px-4 transition-all duration-150 flex items-center justify-center space-x-1.5 ${
                success
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-[#0052CC] hover:bg-[#0747A6] text-white"
              }`}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              {success && <Check className="w-3.5 h-3.5 mr-1" />}
              <span>
                {loading ? "Sending..." : success ? "Sent!" : "Send Invite"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
