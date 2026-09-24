import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";

interface ProjectMembersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: any[];
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "??";
}

const BG_COLORS = [
  "bg-blue-600",
  "bg-purple-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-indigo-600",
];

export default function ProjectMembersListModal({
  isOpen,
  onClose,
  members,
}: ProjectMembersListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-[4px] p-6 shadow-lg border border-[#DFE1E6]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-[#172B4D]">
            Project Members ({members?.length || 0})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {members && members.length > 0 ? (
            members.map((member, idx) => {
              const name = member.name || "Unknown User";
              const email = member.email || "No email";
              const initials = getInitials(name, email);
              const bgColor = BG_COLORS[idx % BG_COLORS.length];
              
              return (
                <div key={member.userId || idx} className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-[4px] border border-[#DFE1E6]">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-white ${bgColor} rounded-full`}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#172B4D]">
                        {name}
                      </p>
                      <p className="text-xs text-[#5E6C84]">
                        {email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-white">
                    {member.role}
                  </Badge>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-[#5E6C84] text-center py-4">No members found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
