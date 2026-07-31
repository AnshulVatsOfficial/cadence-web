"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

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
  className,
}: CustomDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`bg-white max-w-md border border-[#DFE1E6] rounded-[4px] p-6 focus:outline-none ${className || ''}`}>
        <DialogHeader className="space-y-1 pb-3 border-b border-[#DFE1E6]">
          <DialogTitle className="text-base font-bold text-[#172B4D]">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-[#5E6C84]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="pt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
