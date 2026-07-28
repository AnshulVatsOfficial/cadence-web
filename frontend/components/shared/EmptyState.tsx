import React from "react";
import { Button } from "../ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  iconBgClass?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon,
  iconBgClass,
  action,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center h-full w-full">
      <div className="max-w-md w-full bg-white border border-[#DFE1E6] rounded-[4px] p-8 shadow-sm">
        {icon && (
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5 ${
              iconBgClass || "bg-[#DEEBFF] text-[#0052CC]"
            }`}
          >
            {icon}
          </div>
        )}
        <h3 className="text-sm font-bold text-[#172B4D] tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-xs text-[#5E6C84] leading-relaxed mb-6">
          {description}
        </p>
        {(action || (actionLabel && onAction)) && (
          <div className="w-full flex justify-center">
            {action || (
              <Button
                onClick={onAction}
                className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-[3px] h-8 px-4"
              >
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
