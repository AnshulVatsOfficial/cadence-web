"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { cn } from "@/lib/utils";

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function CustomDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "max-w-md",
}: CustomDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "bg-white w-full max-w-lg sm:max-w-xl max-h-[88vh] flex flex-col border border-[#DFE1E6] rounded-[6px] p-6 shadow-2xl focus:outline-none overflow-hidden",
          className,
        )}
      >
        <DialogHeader className="space-y-1 pb-3 border-b border-[#DFE1E6] flex-shrink-0">
          <DialogTitle className="text-base font-bold text-[#172B4D]">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-[#5E6C84]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pt-4 pr-1 custom-scrollbar">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
