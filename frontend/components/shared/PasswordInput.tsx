"use client";

import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface PasswordInputProps
  extends React.ComponentProps<typeof Input> {}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative w-full">
        <Input
          type={showPassword ? "text" : "password"}
          autoComplete={props.autoComplete || "current-password"}
          className={cn(
            "pr-10 h-10 border-[#DFE1E6] rounded-[3px] bg-white text-[#172B4D] text-sm focus-visible:ring-1 focus-visible:ring-[#0052CC]",
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-7 w-7 text-[#5E6C84] hover:text-[#172B4D] hover:bg-black/5 rounded focus:outline-none transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 shrink-0" />
          ) : (
            <Eye className="w-4 h-4 shrink-0" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
