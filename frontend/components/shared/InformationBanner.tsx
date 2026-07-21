"use client";

import React from "react";
import {
  Info,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type BannerVariant = "success" | "error" | "warning" | "info";

interface InformationBannerProps {
  message: string;
  title?: string;
  variant?: BannerVariant;
  onClose?: () => void;
  className?: string;
}

export default function InformationBanner({
  message,
  title,
  variant = "info",
  onClose,
  className,
}: InformationBannerProps) {
  const config = {
    info: {
      bgClass: "bg-[#DEEBFF] border-[#B3D4FF] text-[#0747A6]",
      icon: <Info className="w-4 h-4 text-[#0747A6] flex-shrink-0" />,
    },
    success: {
      bgClass: "bg-[#E2F0D9] border-[#B8DBA3] text-[#2A5913]",
      icon: <CheckCircle className="w-4 h-4 text-[#2A5913] flex-shrink-0" />,
    },
    warning: {
      bgClass: "bg-[#FFFAE6] border-[#FFE380] text-[#172B4D]",
      icon: <AlertTriangle className="w-4 h-4 text-[#FFAB00] flex-shrink-0" />,
    },
    error: {
      bgClass: "bg-[#FFEBE6] border-[#FFBDAD] text-[#BF2600]",
      icon: <AlertOctagon className="w-4 h-4 text-[#BF2600] flex-shrink-0" />,
    },
  }[variant];

  return (
    <div
      className={cn(
        "flex items-start justify-between border p-3 rounded-[3px] text-xs leading-relaxed select-none shadow-sm transition-all duration-300",
        config.bgClass,
        className
      )}
    >
      <div className="flex items-start space-x-2.5">
        <div className="mt-0.5">{config.icon}</div>
        <div>
          {title && <h5 className="font-bold mb-0.5">{title}</h5>}
          <p className="font-medium">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 hover:opacity-75 transition-opacity"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
