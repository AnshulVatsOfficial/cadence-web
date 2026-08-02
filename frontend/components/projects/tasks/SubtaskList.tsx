"use client";

import React, { useState } from "react";
import { useProject } from "../ProjectContext";
import { api } from "@/lib/api";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomAlertDialog from "@/components/shared/CustomAlertDialog";

interface SubtaskListProps {
  parentTask: any;
  isWritable?: boolean;
}

export default function SubtaskList({ parentTask, isWritable = true }: SubtaskListProps) {
  const { projectDetails, fetchProjectDetails, setSelectedTask } = useProject();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [subtaskToDelete, setSubtaskToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingSubtaskId, setUpdatingSubtaskId] = useState<string | null>(null);

  const subtasks = parentTask.subtasks || [];
  const stages = projectDetails?.stages || [];
  const doneStage = stages.find((s: any) => s.isDoneStage) || stages[stages.length - 1];
  const todoStage = stages[0];

  const completedCount = subtasks.filter((st: any) => st.stageId === doneStage?.id).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !isWritable || isAdding) return;

    try {
      setIsAdding(true);
      await api.post(`/projects/${projectDetails.id}/tasks`, {
        title: newSubtaskTitle.trim(),
        stageId: parentTask.stageId || todoStage?.id,
        parentTaskId: parentTask.id,
      });
      setNewSubtaskTitle("");
      await fetchProjectDetails();
    } catch (err: any) {
      console.error("Failed to add subtask:", err);
      alert(err?.response?.data?.error || "Failed to create subtask.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubtaskStageChange = async (subtask: any, newStageId: string) => {
    if (!isWritable || subtask.stageId === newStageId) return;

    try {
      setUpdatingSubtaskId(subtask.id);
      await api.patch(`/projects/${projectDetails.id}/tasks/${subtask.id}`, {
        stageId: newStageId,
      });
      await fetchProjectDetails();
    } catch (err: any) {
      console.error("Failed to update subtask stage:", err);
      alert(err?.response?.data?.error || "Failed to update subtask status.");
    } finally {
      setUpdatingSubtaskId(null);
    }
  };

  const handleDeleteSubtask = async () => {
    if (!subtaskToDelete || !isWritable) return;
    try {
      setIsDeleting(true);
      await api.delete(`/projects/${projectDetails.id}/tasks/${subtaskToDelete.id}`);
      setSubtaskToDelete(null);
      await fetchProjectDetails();
    } catch (err: any) {
      console.error("Failed to delete subtask:", err);
      alert(err?.response?.data?.error || "Failed to delete subtask.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3 select-none">
      {/* Header & Progress Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5E6C84]">
            Sub-tasks
          </h4>
          <span className="text-[11px] font-bold text-[#5E6C84] bg-[#EBECF0] px-1.5 py-0.5 rounded-full">
            {completedCount} / {totalCount}
          </span>
        </div>
      </div>

      {totalCount > 0 && (
        <div className="space-y-1">
          <Progress value={progressPercent} className="h-1.5 bg-[#EBECF0]" />
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-1.5">
        {subtasks.map((st: any) => {
          const isDone = st.stageId === doneStage?.id;
          const isUpdating = updatingSubtaskId === st.id;

          return (
            <div
              key={st.id}
              className="flex items-center justify-between p-2 rounded-[3px] bg-[#FAFBFC] hover:bg-[#F4F5F7] border border-[#DFE1E6] group transition-colors"
            >
              <div className="flex items-center space-x-2 min-w-0 flex-1 mr-2">
                <span
                  onClick={() => setSelectedTask(st)}
                  className={`text-xs text-[#172B4D] truncate cursor-pointer hover:underline ${
                    isDone ? "line-through text-[#5E6C84]" : "font-medium"
                  }`}
                  title="Click to view/edit subtask"
                >
                  {st.title}
                </span>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Stage Dropdown Select for Subtask */}
                <Select
                  value={st.stageId}
                  onValueChange={(val) => handleSubtaskStageChange(st, val)}
                  disabled={!isWritable || isUpdating}
                >
                  <SelectTrigger className="h-6 text-[10px] uppercase font-bold px-2 bg-white border-[#DFE1E6] text-[#5E6C84] min-w-[90px]">
                    {isUpdating ? (
                      <Spinner className="w-3 h-3 text-[#0052CC]" />
                    ) : (
                      <SelectValue placeholder="Status" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage: any) => (
                      <SelectItem key={stage.id} value={stage.id} className="text-xs">
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setSelectedTask(st)}
                  title="Edit Subtask"
                  className="h-6 w-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#5E6C84] hover:bg-[#DEEBFF] hover:text-[#0052CC]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>

                {isWritable && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setSubtaskToDelete(st)}
                    title="Delete Subtask"
                    className="h-6 w-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#5E6C84] hover:bg-[#FFEBEB] hover:text-[#DE350B]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline Subtask Creation Container (Div with keydown Enter, preventing form collision) */}
      {isWritable && (
        <div className="flex items-center space-x-2 pt-1">
          <Input
            type="text"
            placeholder="+ Add a subtask..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSubtask();
              }
            }}
            className="h-8 text-xs bg-white border-[#DFE1E6] focus-visible:ring-1 focus-visible:ring-[#0052CC]"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddSubtask}
            disabled={!newSubtaskTitle.trim() || isAdding}
            className="h-8 text-xs bg-[#0052CC] hover:bg-[#0747A6] text-white px-3 rounded-[3px] disabled:opacity-50 flex-shrink-0"
          >
            {isAdding ? <Spinner className="w-3 h-3 text-white" /> : <Plus className="w-3.5 h-3.5" />}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <CustomAlertDialog
        isOpen={!!subtaskToDelete}
        onClose={() => setSubtaskToDelete(null)}
        onConfirm={handleDeleteSubtask}
        title="Delete Subtask"
        description={`Are you sure you want to delete subtask "${subtaskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
