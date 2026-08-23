"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProject } from "../ProjectContext";
import { api } from "@/lib/api";
import CustomDialog from "@/components/shared/CustomDialog";
import { DatePicker } from "@/components/shared/DatePicker";
import { AssigneeSelect } from "@/components/shared/AssigneeSelect";
import { TimeUnit, convertToMinutes } from "@/lib/timeUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Task title must be at least 3 characters")
    .max(150, "Task title cannot exceed 150 characters")
    .trim(),
  stageId: z.string().min(1, "Please select a column"),
  issueTypeId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  description: z.string().optional(),
  parentTaskId: z.string().nullable().optional(),
  assigneeIds: z.array(z.string()).optional(),
  dueDate: z.date().nullable().optional(),
  estimateValue: z.union([z.number(), z.string()]).optional().nullable(),
  estimateUnit: z.enum(["m", "h", "d", "w"]),
});

export default function CreateTaskModal() {
  const {
    projectDetails,
    projectMembers,
    fetchProjectDetails,
    showCreateTaskModal,
    setShowCreateTaskModal,
    createTaskDefaultStageId,
    createTaskDefaultParentId,
  } = useProject();

  const stages = projectDetails?.stages || [];
  const issueTypes = projectDetails?.issueTypes || [];
  const availableParentTasks = projectDetails?.tasks?.filter((t: any) => !t.parentTaskId) || [];

  const [timeError, setTimeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<any>({
    mode: "onChange",
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      stageId: stages[0]?.id || "",
      issueTypeId: issueTypes[0]?.id || "",
      priority: "MEDIUM",
      description: "",
      parentTaskId: null,
      assigneeIds: [],
      dueDate: null,
      estimateValue: "",
      estimateUnit: "h",
    },
  });

  const watchEstimateValue = watch("estimateValue");

  useEffect(() => {
    if (showCreateTaskModal) {
      const defaultStage = createTaskDefaultStageId || stages[0]?.id || "";
      const defaultIssueType = issueTypes[0]?.id || "";
      const defaultParent = createTaskDefaultParentId || null;

      setValue("stageId", defaultStage);
      setValue("issueTypeId", defaultIssueType);
      setValue("parentTaskId", defaultParent);
      setTimeError(null);
    }
  }, [showCreateTaskModal, createTaskDefaultStageId, createTaskDefaultParentId, stages, issueTypes, setValue]);

  // Validate positive time estimates
  useEffect(() => {
    if (watchEstimateValue !== undefined && watchEstimateValue !== "") {
      const num = Number(watchEstimateValue);
      if (isNaN(num) || num < 0) {
        setTimeError("Duration cannot be negative or invalid.");
      } else {
        setTimeError(null);
      }
    } else {
      setTimeError(null);
    }
  }, [watchEstimateValue]);

  const handleClose = () => {
    reset();
    setTimeError(null);
    setShowCreateTaskModal(false);
  };

  const onSubmit = async (data: any) => {
    if (timeError) return;

    try {
      const calculatedMinutes = convertToMinutes(data.estimateValue, data.estimateUnit as TimeUnit);

      const payload: any = {
        title: data.title,
        stageId: data.stageId,
        issueTypeId: data.issueTypeId || undefined,
        priority: data.priority,
        description: data.description || undefined,
        parentTaskId: data.parentTaskId || undefined,
        assigneeIds: data.assigneeIds && data.assigneeIds.length > 0 ? data.assigneeIds : undefined,
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
        estimatedMinutes: calculatedMinutes !== null ? calculatedMinutes : undefined,
      };

      await api.post(`/projects/${projectDetails.id}/tasks`, payload);
      await fetchProjectDetails();
      handleClose();
    } catch (err: any) {
      console.error("Failed to create task:", err);
      alert(err?.response?.data?.error || "Error creating task.");
    }
  };

  return (
    <CustomDialog
      isOpen={showCreateTaskModal}
      onClose={handleClose}
      title={createTaskDefaultParentId ? "Create Subtask" : "Create Task"}
      description="Fill in the details to create a new task in this project."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 no-validate" noValidate>
        {/* Title */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[#172B4D]">
            Task Title <span className="text-[#DE350B]">*</span>
          </Label>
          <Input
            {...register("title")}
            placeholder="e.g., Implement authentication flow"
            className="text-xs h-9 border-[#DFE1E6] focus-visible:ring-1 focus-visible:ring-[#0052CC]"
            autoFocus
          />
          {errors.title?.message && (
            <p className="text-[10px] text-[#DE350B] font-medium">{String(errors.title.message)}</p>
          )}
        </div>

        {/* Column & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Column Stage */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-[#172B4D]">Column / Stage</Label>
            <Controller
              name="stageId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-9 text-xs border-[#DFE1E6]">
                    <SelectValue placeholder="Select Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage: any) => (
                      <SelectItem key={stage.id} value={stage.id} className="text-xs">
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.stageId?.message && (
              <p className="text-[10px] text-[#DE350B] font-medium">{String(errors.stageId.message)}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-[#172B4D]">Priority</Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-9 text-xs border-[#DFE1E6]">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW" className="text-xs">Low</SelectItem>
                    <SelectItem value="MEDIUM" className="text-xs">Medium</SelectItem>
                    <SelectItem value="HIGH" className="text-xs">High</SelectItem>
                    <SelectItem value="URGENT" className="text-xs">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Parent Task (Subtask option) */}
        {!createTaskDefaultParentId && availableParentTasks.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-[#172B4D]">
              Parent Task (Optional - for Subtasks)
            </Label>
            <Controller
              name="parentTaskId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || "none"}
                  onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                >
                  <SelectTrigger className="w-full h-9 text-xs border-[#DFE1E6]">
                    <SelectValue placeholder="None (Main Parent Task)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs text-[#5E6C84]">
                      None (Main Parent Task)
                    </SelectItem>
                    {availableParentTasks.map((parent: any) => (
                      <SelectItem key={parent.id} value={parent.id} className="text-xs">
                        {parent.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {/* Description */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[#172B4D]">Description</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                content={field.value || ""}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Assignees Dropdown */}
        {projectMembers.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-[#172B4D]">Assignees</Label>
            <Controller
              name="assigneeIds"
              control={control}
              render={({ field }) => (
                <AssigneeSelect
                  members={projectMembers}
                  selectedUserIds={field.value || []}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>
        )}

        {/* Due Date & Estimates Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Shadcn Popover Calendar DatePicker */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-[#172B4D]">Due Date</Label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  placeholder="Select due date"
                />
              )}
            />
          </div>

          {/* Time Duration Estimate */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-[#172B4D]">Time Estimate</Label>
            <div className="flex items-center space-x-1.5 w-full">
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 2"
                {...register("estimateValue")}
                className="text-xs h-9 border-[#DFE1E6] flex-1 min-w-[70px] focus-visible:ring-1 focus-visible:ring-[#0052CC]"
              />
              <Controller
                name="estimateUnit"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9 w-24 shrink-0 text-xs border-[#DFE1E6]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h" className="text-xs">Hours</SelectItem>
                      <SelectItem value="d" className="text-xs">Days</SelectItem>
                      <SelectItem value="w" className="text-xs">Weeks</SelectItem>
                      <SelectItem value="m" className="text-xs">Mins</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {timeError && (
              <p className="text-[10px] text-[#DE350B] font-medium">{timeError}</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-[#DFE1E6] flex items-center justify-end space-x-2 z-10 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="text-xs h-8 px-3 text-[#5E6C84] hover:bg-[#EBECF0]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting || !!timeError}
            className="text-xs h-8 px-4 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-[3px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[90px]"
          >
            {isSubmitting ? <Spinner className="w-3.5 h-3.5 text-white" /> : "Create Task"}
          </Button>
        </div>
      </form>
    </CustomDialog>
  );
}
