"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import CustomDialog from "../shared/CustomDialog";
import { Field, FieldLabel, FieldError } from "../ui/field";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Spinner } from "../ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Define the client-side validation schema using Zod
const workspaceSchema = z.object({
  name: z
    .string()
    .min(3, "Workspace name must be at least 3 characters")
    .max(50, "Workspace name cannot exceed 50 characters")
    .trim(),
  workspaceType: z.string().min(1, "Workspace type is required"),
  description: z
    .string()
    .max(200, "Description cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof workspaceSchema>;

// Custom resolver that integrates React Hook Form directly with Zod
const zodResolver = (values: FormValues) => {
  const result = workspaceSchema.safeParse(values);
  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const errors = result.error.issues.reduce((acc: any, current) => {
    const fieldName = current.path[0];
    if (fieldName) {
      acc[fieldName] = {
        type: current.code,
        message: current.message,
      };
    }
    return acc;
  }, {});

  return { values: {}, errors };
};

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (newWorkspace: any) => void;
}

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  onCreateSuccess,
}: CreateWorkspaceModalProps) {
  const { getToken } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver,
    defaultValues: {
      name: "",
      workspaceType: "Software Development",
      description: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setApiError(null);

    try {
      const token = await getToken();
      if (!token) {
        setApiError("User authentication token not found.");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (res.ok) {
        const newWs = await res.json();
        reset();
        onCreateSuccess(newWs);
        onClose();
      } else {
        const err = await res.json();
        setApiError(err.error || "Failed to create workspace.");
      }
    } catch (err: any) {
      setApiError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Create Workspace"
      description="Workspaces are where your team compiles sprints, active boards, and tasks."
    >
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs mb-4">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Field controls invalid state automatically */}
        <Field data-invalid={errors.name ? "true" : undefined}>
          <FieldLabel className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">
            Workspace Name <span className="text-[#DE350B]">*</span>
          </FieldLabel>
          <Input
            type="text"
            placeholder="e.g. Acme Marketing"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && <FieldError className="text-[10px] text-[#DE350B] font-semibold mt-1">{errors.name.message}</FieldError>}
        </Field>

        <Field data-invalid={errors.workspaceType ? "true" : undefined}>
          <FieldLabel className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">
            Workspace Type
          </FieldLabel>
          <Controller
            name="workspaceType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#DFE1E6]">
                  <SelectItem className="text-xs hover:bg-[#F4F5F7]" value="Software Development">Software Development</SelectItem>
                  <SelectItem className="text-xs hover:bg-[#F4F5F7]" value="Marketing">Marketing</SelectItem>
                  <SelectItem className="text-xs hover:bg-[#F4F5F7]" value="Business Operations">Business Operations</SelectItem>
                  <SelectItem className="text-xs hover:bg-[#F4F5F7]" value="Design">Design</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.workspaceType && (
            <FieldError className="text-[10px] text-[#DE350B] font-semibold mt-1">
              {errors.workspaceType.message}
            </FieldError>
          )}
        </Field>

        <Field data-invalid={errors.description ? "true" : undefined}>
          <FieldLabel className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">
            Description
          </FieldLabel>
          <Textarea
            placeholder="Describe your workspace assets..."
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description && <FieldError className="text-[10px] text-[#DE350B] font-semibold mt-1">{errors.description.message}</FieldError>}
        </Field>

        <div className="flex justify-end space-x-2 pt-3 border-t border-[#DFE1E6] mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset();
              onClose();
            }}
            className="text-xs font-semibold rounded-[3px] text-[#5E6C84] hover:bg-[#EBECF0]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded-[3px] flex items-center justify-center"
          >
            {isSubmitting && <Spinner className="mr-2 h-3 w-3 text-white" />}
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </CustomDialog>
  );
}
