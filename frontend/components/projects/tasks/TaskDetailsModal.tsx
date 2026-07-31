"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProject } from "../ProjectContext";
import { api } from "@/lib/api";
import CustomDialog from "@/components/shared/CustomDialog";
import CustomAlertDialog from "@/components/shared/CustomAlertDialog";
import SubtaskList from "./SubtaskList";
import { DatePicker } from "@/components/shared/DatePicker";
import { AssigneeSelect } from "@/components/shared/AssigneeSelect";
import {
  TimeUnit,
  convertToMinutes,
  formatMinutesToEstimate,
  displayFormattedTime,
} from "@/lib/timeUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Calendar, Clock, User, ArrowUpRight } from "lucide-react";

const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Task title must be at least 3 characters")
    .max(150, "Task title cannot exceed 150 characters")
    .trim(),
  stageId: z.string().min(1, "Please select a stage"),
  issueTypeId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  description: z.string().optional(),
  parentTaskId: z.string().nullable().optional(),
  assigneeIds: z.array(z.string()).optional(),
  dueDate: z.date().nullable().optional(),
  estimateValue: z.union([z.number(), z.string()]).optional().nullable(),
  estimateUnit: z.enum(["m", "h", "d", "w"]),
});

export default function TaskDetailsModal() {
  const {
    projectDetails,
    projectMembers,
    fetchProjectDetails,
    selectedTask,
    setSelectedTask,
  } = useProject();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  const stages = projectDetails?.stages || [];
  const issueTypes = projectDetails?.issueTypes || [];
  const allTasks = projectDetails?.tasks || [];

  const isWritable = projectDetails?.status !== "INACTIVE";

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<any>({
    mode: "onChange",
    resolver: zodResolver(updateTaskSchema),
  });

  const watchEstimateValue = watch("estimateValue");

  useEffect(() => {
    if (selectedTask) {
      const currentAssigneeIds = selectedTask.assignees?.map((a: any) => a.userId || a.user?.id) || [];
      const dueDateParsed = selectedTask.dueDate ? new Date(selectedTask.dueDate) : null;
      const formattedEstimate = formatMinutesToEstimate(selectedTask.estimatedMinutes);

      reset({
        title: selectedTask.title || "",
        stageId: selectedTask.stageId || stages[0]?.id || "",
        issueTypeId: selectedTask.issueTypeId || issueTypes[0]?.id || "",
        priority: selectedTask.priority || "MEDIUM",
        description:
          typeof selectedTask.description === "string"
            ? selectedTask.description
            : selectedTask.description
            ? JSON.stringify(selectedTask.description)
            : "",
        parentTaskId: selectedTask.parentTaskId || null,
        assigneeIds: currentAssigneeIds,
        dueDate: dueDateParsed,
        estimateValue: formattedEstimate.value,
        estimateUnit: formattedEstimate.unit,
      });
      setTimeError(null);
    }
  }, [selectedTask, reset, stages, issueTypes]);

  // Validate non-negative estimate value
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

  if (!selectedTask) return null;

  const handleClose = () => {
    setSelectedTask(null);
    setTimeError(null);
  };

  const handleSave = async (data: any) => {
    if (!isWritable || timeError) return;
    try {
      setIsSaving(true);
      const calculatedMinutes = convertToMinutes(data.estimateValue, data.estimateUnit as TimeUnit);

      const payload: any = {
        title: data.title,
        stageId: data.stageId,
        issueTypeId: data.issueTypeId || undefined,
        priority: data.priority,
        description: data.description || undefined,
        parentTaskId: data.parentTaskId || null,
        assigneeIds: data.assigneeIds || [],
        dueDate: data.dueDate ? data.dueDate.toISOString() : null,
        estimatedMinutes: calculatedMinutes,
      };

      await api.patch(`/projects/${projectDetails.id}/tasks/${selectedTask.id}`, payload);
      await fetchProjectDetails();
    } catch (err: any) {
      console.error("Failed to update task:", err);
      alert(err?.response?.data?.error || "Error saving task changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isWritable) return;
    try {
      setIsDeleting(true);
      await api.delete(`/projects/${projectDetails.id}/tasks/${selectedTask.id}`);
      setShowDeleteConfirm(false);
      setSelectedTask(null);
      await fetchProjectDetails();
    } catch (err: any) {
      console.error("Failed to delete task:", err);
      alert(err?.response?.data?.error || "Error deleting task.");
    } finally {
      setIsDeleting(false);
    }
  };

  const parentTask = allTasks.find((t: any) => t.id === selectedTask.parentTaskId);

  return (
    <>
      <CustomDialog
        isOpen={!!selectedTask}
        onClose={handleClose}
        title={selectedTask.parentTaskId ? "Subtask Details" : "Task Details"}
        description={parentTask ? `Subtask of: ${parentTask.title}` : undefined}
      >
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4 no-validate" noValidate>
          {/* Top Bar Actions & Parent Breadcrumb */}
          <div className="flex items-center justify-between pb-2 border-b border-[#DFE1E6]">
            {parentTask ? (
              <button
                type="button"
                onClick={() => setSelectedTask(parentTask)}
                className="text-xs font-semibold text-[#0052CC] hover:underline flex items-center space-x-1"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Parent: {parentTask.title}</span>
              </button>
            ) : (
              <span className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">
                Main Issue
              </span>
            )}

            {isWritable && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-7 px-2 text-xs text-[#DE350B] hover:bg-[#FFEBEB] rounded-[3px] space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-[#172B4D]">Title</Label>
            <Input
              {...register("title")}
              disabled={!isWritable}
              className="text-xs font-bold h-9 border-[#DFE1E6] text-[#172B4D] focus-visible:ring-1 focus-visible:ring-[#0052CC]"
            />
            {errors.title?.message && (
              <p className="text-[10px] text-[#DE350B] font-medium">{String(errors.title.message)}</p>
            )}
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Stage / Status */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#172B4D]">Status / Stage</Label>
              <Controller
                name="stageId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!isWritable}>
                    <SelectTrigger className="w-full h-8 text-xs border-[#DFE1E6]">
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
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#172B4D]">Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!isWritable}>
                    <SelectTrigger className="w-full h-8 text-xs border-[#DFE1E6]">
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

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-[#172B4D]">Description</Label>
            <Textarea
              {...register("description")}
              disabled={!isWritable}
              rows={3}
              placeholder="Add description..."
              className="text-xs border-[#DFE1E6] resize-none focus-visible:ring-1 focus-visible:ring-[#0052CC]"
            />
          </div>

          {/* Subtasks Section */}
          <div className="pt-2 border-t border-[#DFE1E6]">
            <SubtaskList parentTask={selectedTask} isWritable={isWritable} />
          </div>

          {/* Assignees Dropdown */}
          {projectMembers.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-[#DFE1E6]">
              <Label className="text-xs font-semibold text-[#172B4D] flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-[#5E6C84]" />
                <span>Assignees</span>
              </Label>
              <Controller
                name="assigneeIds"
                control={control}
                render={({ field }) => (
                  <AssigneeSelect
                    members={projectMembers}
                    selectedUserIds={field.value || []}
                    onChange={field.onChange}
                    disabled={!isWritable || isSaving}
                  />
                )}
              />
            </div>
          )}

          {/* Dates & Estimates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#DFE1E6]">
            {/* Shadcn DatePicker */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#172B4D] flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#5E6C84]" />
                <span>Due Date</span>
              </Label>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    disabled={!isWritable}
                    placeholder="Select due date"
                  />
                )}
              />
            </div>

            {/* Time Estimate (Duration + Units) */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#172B4D] flex items-center space-x-1 justify-between">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#5E6C84]" />
                  <span>Time Estimate</span>
                </div>
                {selectedTask.estimatedMinutes !== undefined && selectedTask.estimatedMinutes !== null && (
                  <span className="text-[10px] text-[#0052CC] font-normal">
                    ({displayFormattedTime(selectedTask.estimatedMinutes)})
                  </span>
                )}
              </Label>
              <div className="flex items-center space-x-1.5 w-full">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  {...register("estimateValue")}
                  disabled={!isWritable}
                  className="text-xs h-8 border-[#DFE1E6] flex-1 min-w-[70px] focus-visible:ring-1 focus-visible:ring-[#0052CC]"
                />
                <Controller
                  name="estimateUnit"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={!isWritable}>
                      <SelectTrigger className="h-8 w-24 shrink-0 text-xs border-[#DFE1E6]">
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
          {isWritable && (
            <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-[#DFE1E6] flex items-center justify-end space-x-2 z-10 mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="text-xs h-8 px-3 text-[#5E6C84] hover:bg-[#EBECF0]"
              >
                Close
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || isSaving || !!timeError}
                className="text-xs h-8 px-4 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-[3px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[90px]"
              >
                {isSaving ? <Spinner className="w-3.5 h-3.5 text-white" /> : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </CustomDialog>

      {/* Delete Task Confirmation */}
      <CustomAlertDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        description={`Are you sure you want to delete "${selectedTask?.title}"? Any subtasks under this task will also be affected.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
