"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

interface CustomAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
  isLoading?: boolean;
}

export default function CustomAlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: CustomAlertDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-white max-w-md border border-[#DFE1E6] rounded-[4px] p-6">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-base font-bold text-[#172B4D] flex items-center space-x-2">
            <span>{variant === "danger" ? "⚠️" : "🔔"}</span>
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-[#5E6C84] leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-2">
          <AlertDialogCancel asChild>
            <Button
              variant="ghost"
              disabled={isLoading}
              onClick={onClose}
              className="text-xs font-semibold rounded-[3px] hover:bg-[#EBECF0] focus:outline-none"
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={variant === "danger" ? "destructive" : "default"}
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              className={`text-xs font-semibold rounded-[3px] focus:outline-none flex items-center justify-center ${
                variant === "danger"
                  ? "bg-[#DE350B] hover:bg-[#BF2600] text-white"
                  : "bg-[#0052CC] hover:bg-[#0747A6] text-white"
              }`}
            >
              {isLoading && <Spinner className="mr-2 h-3 w-3 text-white" />}
              {isLoading ? "Processing..." : confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
