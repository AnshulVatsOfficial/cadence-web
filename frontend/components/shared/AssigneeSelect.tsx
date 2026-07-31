"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProjectMember {
  userId: string;
  name: string;
  email?: string;
  role?: string;
}

interface AssigneeSelectProps {
  members: ProjectMember[];
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
  disabled?: boolean;
}

export function AssigneeSelect({
  members,
  selectedUserIds = [],
  onChange,
  disabled = false,
}: AssigneeSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedMembers = members.filter((m) => selectedUserIds.includes(m.userId));

  const toggleMember = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  const getTriggerLabel = () => {
    if (selectedMembers.length === 0) return null;
    const names = selectedMembers.map((m) => m.name || m.email || "Member");
    if (names.length === 1) {
      return names[0];
    }
    if (names.length === 2) {
      return `${names[0]}, ${names[1]}`;
    }
    const extraCount = names.length - 2;
    return `${names[0]}, ${names[1]} and ${extraCount} more`;
  };

  const triggerLabel = getTriggerLabel();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full h-9 justify-between text-left font-medium text-xs border-[#DFE1E6] bg-white hover:bg-[#F4F5F7] px-2.5",
            selectedUserIds.length === 0 && "text-[#5E6C84]",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <div className="flex items-center space-x-1.5 min-w-0 flex-1 pr-2 truncate text-[#172B4D]">
            <User className="w-3.5 h-3.5 shrink-0 text-[#5E6C84]" />
            <span className="truncate">
              {triggerLabel ? triggerLabel : "Select assignees..."}
            </span>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50 text-[#5E6C84]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-1 bg-white border-[#DFE1E6] shadow-lg rounded-[4px]" align="start">
        <div className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider px-2 py-1.5 border-b border-[#DFE1E6] flex justify-between items-center">
          <span>Project Members</span>
          <span className="text-[10px] text-[#0052CC] font-semibold">
            {selectedUserIds.length} / {members.length} Selected
          </span>
        </div>
        <div className="max-h-52 overflow-y-auto py-1 space-y-0.5">
          {members.length === 0 ? (
            <div className="text-xs text-[#5E6C84] p-2 text-center">No members found</div>
          ) : (
            members.map((member) => {
              const isSelected = selectedUserIds.includes(member.userId);
              return (
                <div
                  key={member.userId}
                  onClick={() => toggleMember(member.userId)}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-[3px] text-xs cursor-pointer transition-colors select-none",
                    isSelected ? "bg-[#DEEBFF] text-[#0747A6] font-semibold" : "hover:bg-[#F4F5F7] text-[#172B4D]",
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="truncate">{member.name || member.email}</span>
                    {member.email && member.name && (
                      <span className="text-[10px] text-[#5E6C84] truncate">{member.email}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    {member.role && (
                      <span className="text-[9px] font-bold uppercase px-1 py-0.5 bg-[#EBECF0] text-[#5E6C84] rounded-[2px]">
                        {member.role}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0747A6]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
