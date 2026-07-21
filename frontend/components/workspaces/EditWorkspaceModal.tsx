"use client";

import React, { useState, useEffect } from "react";
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

interface EditWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: any;
  onUpdateSuccess: (updatedWorkspace: any) => void;
}

export default function EditWorkspaceModal({
  isOpen,
  onClose,
  workspace,
  onUpdateSuccess,
}: EditWorkspaceModalProps) {
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

  // Sync state with selected workspace details when it changes
  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name || "",
        workspaceType: workspace.workspaceType || "Software Development",
        description: workspace.description || "",
      });
      setApiError(null);
    }
  }, [workspace, reset]);

  if (!workspace) return null;

  const onSubmit = async (data: FormValues) => {
    setApiError(null);

    try {
      const token = await getToken();
      if (!token) {
        setApiError("User authentication token not found.");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces/${workspace.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        onUpdateSuccess(updated);
        onClose();
      } else {
        const err = await res.json();
        setApiError(err.error || "Failed to update workspace.");
      }
    } catch (err: any) {
      setApiError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Workspace Settings"
      description="Update your workspace type, metadata, and descriptive details."
    >
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs mb-4">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field data-invalid={errors.name ? "true" : undefined}>
          <FieldLabel className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">
            Workspace Name <span className="text-[#DE350B]">*</span>
          </FieldLabel>
          <Input
            type="text"
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
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description && <FieldError className="text-[10px] text-[#DE350B] font-semibold mt-1">{errors.description.message}</FieldError>}
        </Field>

        <div className="flex justify-end space-x-2 pt-3 border-t border-[#DFE1E6] mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </CustomDialog>
  );
}
