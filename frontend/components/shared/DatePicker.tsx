"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date | null;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Pick a date",
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full h-9 justify-start text-left font-normal text-xs border-[#DFE1E6] bg-white hover:bg-[#F4F5F7] px-2.5",
            !date && "text-[#5E6C84]",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-[#5E6C84]" />
          <span className="flex-1 truncate">
            {date ? format(date, "PP") : placeholder}
          </span>
          {date && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setDate(undefined);
              }}
              className="p-0.5 hover:bg-[#EBECF0] rounded text-[#5E6C84] hover:text-[#DE350B]"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border-[#DFE1E6] shadow-lg rounded-[4px]" align="start">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(selectedDate) => {
            setDate(selectedDate);
            setOpen(false);
          }}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          className="rounded-[4px] border-none text-xs"
        />
      </PopoverContent>
    </Popover>
  );
}
