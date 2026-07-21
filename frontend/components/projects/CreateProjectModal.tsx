"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
const projectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(50, "Project name cannot exceed 50 characters")
    .trim(),
  projectType: z.string().min(1, "Project type is required"),
  description: z
    .string()
    .max(200, "Description cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (newProject: any) => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreateSuccess,
}: CreateProjectModalProps) {
  const { getToken } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      projectType: "Software Development",
      description: "",
    },
    mode:"onChange"
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects`,
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
        const newProj = await res.json();
        reset();
        onCreateSuccess(newProj);
        onClose();
      } else {
        const err = await res.json();
        setApiError(err.error || "Failed to create project.");
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
      title="Create Project"
      description="Projects are where your team compiles sprints, active boards, and tasks."
    >
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs mb-4">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field data-invalid={errors.name ? "true" : undefined}>
          <FieldLabel className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">
            Project Name <span className="text-[#DE350B]">*</span>
          </FieldLabel>
          <Input
            type="text"
            placeholder="e.g. Acme Marketing"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && <FieldError className="text-[10px] text-[#DE350B] font-semibold mt-1">{errors.name.message}</FieldError>}
        </Field>

        <Field data-invalid={errors.projectType ? "true" : undefined}>
          <FieldLabel className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">
            Project Type
          </FieldLabel>
          <Controller
            name="projectType"
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
          {errors.projectType && (
            <FieldError className="text-[10px] text-[#DE350B] font-semibold mt-1">
              {errors.projectType.message}
            </FieldError>
          )}
        </Field>

        <Field data-invalid={errors.description ? "true" : undefined}>
          <FieldLabel className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">
            Description
          </FieldLabel>
          <Textarea
            placeholder="Describe your project assets..."
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
