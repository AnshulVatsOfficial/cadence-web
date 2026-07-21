"use client";

import React from "react";
import { Label } from "../ui/label";

interface FormFieldWrapperProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormFieldWrapper({
  label,
  error,
  required,
  children,
}: FormFieldWrapperProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <Label className="block text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">
          {label} {required && <span className="text-[#DE350B]">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-[10px] text-[#DE350B] font-semibold mt-1">{error}</p>
      )}
    </div>
  );
}
