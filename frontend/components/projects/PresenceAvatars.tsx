"use client";

import React from "react";
import { OnlineUser } from "@/hooks/useProjectSocket";

interface PresenceAvatarsProps {
  onlineUsers: OnlineUser[];
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

export default function PresenceAvatars({ onlineUsers }: PresenceAvatarsProps) {
  if (!onlineUsers || onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center space-x-1" title={`${onlineUsers.length} online collaborator(s)`}>
      <div className="flex -space-x-2 overflow-hidden items-center">
        {onlineUsers.map((user, idx) => {
          const initials = getInitials(user.name, user.email);
          const bgColor = BG_COLORS[idx % BG_COLORS.length];
          const displayName = user.name || user.email || "Collaborator";

          return (
            <div
              key={user.userId + idx}
              className="relative group cursor-pointer"
            >
              <div
                className={`inline-flex items-center justify-center w-7 h-7 text-[11px] font-bold text-white ${bgColor} rounded-full ring-2 ring-white select-none transition-transform group-hover:scale-110`}
              >
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 whitespace-nowrap bg-gray-900 text-white text-[11px] font-medium px-2 py-1 rounded shadow-md pointer-events-none">
                {displayName} {user.role ? `(${user.role})` : ""}
              </div>
            </div>
          );
        })}
      </div>
      <span className="text-[11px] text-green-600 font-semibold pl-1">
        • {onlineUsers.length} live
      </span>
    </div>
  );
}
