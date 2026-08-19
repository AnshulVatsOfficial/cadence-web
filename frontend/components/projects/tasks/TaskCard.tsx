"use client";

import React, { useState } from "react";
import { useProject } from "../ProjectContext";
import { Trash2, Edit2, ChevronDown, ChevronRight, Plus, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CustomAlertDialog from "@/components/shared/CustomAlertDialog";
import { api } from "@/lib/api";
import { displayFormattedTime } from "@/lib/timeUtils";

interface TaskCardProps {
  task: any;
  isWritable?: boolean;
}

export default function TaskCard({ task, isWritable = true }: TaskCardProps) {
  const { setSelectedTask, openCreateTaskModal, projectDetails, fetchProjectDetails } = useProject();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const subtasks = task.subtasks || [];
  const stages = projectDetails?.stages || [];
  const doneStage = stages.find((s: any) => s.isDoneStage) || stages[stages.length - 1];
  const completedSubtasksCount = subtasks.filter((st: any) => st.stageId === doneStage?.id).length;
  const totalSubtasksCount = subtasks.length;
  const progressPercent =
    totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  const mainAssignee = task.assignees?.[0]?.user;
  const assigneeInitials = mainAssignee?.name
    ? mainAssignee.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const renderPriorityBadge = (priority: string) => {
    const prio = (priority || "MEDIUM").toUpperCase();
    switch (prio) {
      case "URGENT":
        return (
          <span className="flex items-center space-x-1 text-[#DE350B] font-bold text-[10px]">
            <span>↑</span>
            <span>URGENT</span>
          </span>
        );
      case "HIGH":
        return (
          <span className="flex items-center space-x-1 text-[#FF5630] font-bold text-[10px]">
            <span>↑</span>
            <span>HIGH</span>
          </span>
        );
      case "MEDIUM":
        return (
          <span className="flex items-center space-x-1 text-[#FFAB00] font-bold text-[10px]">
            <span>═</span>
            <span>MEDIUM</span>
          </span>
        );
      case "LOW":
        return (
          <span className="flex items-center space-x-1 text-[#36B37E] font-bold text-[10px]">
            <span>↓</span>
            <span>LOW</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete || !isWritable) return;
    try {
      setIsDeleting(true);
      await api.delete(`/projects/${projectDetails.id}/tasks/${taskToDelete.id}`);
      setTaskToDelete(null);
      await fetchProjectDetails();
    } catch (err: any) {
      console.error("Error deleting task:", err);
      alert(err?.response?.data?.error || "Failed to delete task.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setSelectedTask(task)}
        className="bg-white border border-[#DFE1E6] rounded-[4px] p-3 shadow-sm hover:border-[#0052CC] transition-all cursor-pointer group relative space-y-2 select-none"
      >
        {/* Header: Title & Quick Actions (Edit & Delete) */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col space-y-0.5 pr-12">
            {task.issueKey && (
              <span className="text-[10px] font-bold text-[#5E6C84]">
                {task.issueKey}
              </span>
            )}
            <h4
              className="text-xs font-semibold text-[#172B4D] leading-snug hover:text-[#0052CC] transition-colors"
            >
              {task.title}
            </h4>
          </div>

          <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTask(task);
              }}
              title="Edit Task"
              className="h-6 w-6 p-1 rounded-[3px] text-[#5E6C84] hover:bg-[#DEEBFF] hover:text-[#0052CC]"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>

            {isWritable && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setTaskToDelete(task);
                }}
                title="Delete Task"
                className="h-6 w-6 p-1 rounded-[3px] text-[#5E6C84] hover:bg-[#FFEBEB] hover:text-[#DE350B]"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Optional Description snippet */}
        {task.description && (
          <p
            className="text-[11px] text-[#5E6C84] line-clamp-2"
          >
            {typeof task.description === "string"
              ? task.description
              : JSON.stringify(task.description)}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {task.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-[#EAE6FF] text-[#403294] font-semibold">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Subtask Summary & Toggle */}
        {totalSubtasksCount > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-[#F4F5F7]">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSubtasks(!showSubtasks);
                }}
                className="flex items-center space-x-1 text-[10px] font-bold text-[#5E6C84] hover:text-[#172B4D] transition-colors"
              >
                {showSubtasks ? (
                  <ChevronDown className="w-3 h-3 text-[#0052CC]" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-[#5E6C84]" />
                )}
                <span>
                  Subtasks ({completedSubtasksCount}/{totalSubtasksCount})
                </span>
              </button>

              <Badge
                variant="outline"
                className="text-[9px] font-bold bg-[#F4F5F7] border-[#DFE1E6] text-[#5E6C84]"
              >
                {progressPercent}%
              </Badge>
            </div>

            <Progress value={progressPercent} className="h-1 bg-[#EBECF0]" />

            {/* Expanded Subtasks Inline List */}
            {showSubtasks && (
              <div className="space-y-1 pt-1.5">
                {subtasks.map((st: any) => {
                  const isDone = st.stageId === doneStage?.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedTask(st)}
                      className="flex items-center justify-between p-1 rounded bg-[#FAFBFC] hover:bg-[#EBECF0] border border-[#DFE1E6] text-[10px] cursor-pointer"
                    >
                      <div className="flex items-center space-x-1.5 truncate mr-1">
                        {isDone ? (
                          <CheckCircle2 className="w-3 h-3 text-[#36B37E] flex-shrink-0" />
                        ) : (
                          <Circle className="w-3 h-3 text-[#5E6C84] flex-shrink-0" />
                        )}
                        <span className={`truncate ${isDone ? "line-through text-[#5E6C84]" : "text-[#172B4D]"}`}>
                          {st.title}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[8px] px-1 py-0 bg-white">
                        {stages.find((s: any) => s.id === st.stageId)?.name || "Subtask"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Quick Add Subtask Button */}
        {isWritable && (
          <div className="pt-1 flex items-center justify-between border-t border-[#F4F5F7]">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                openCreateTaskModal({
                  stageId: task.stageId,
                  parentTaskId: task.id,
                });
              }}
              className="text-[10px] font-semibold text-[#5E6C84] hover:text-[#0052CC] hover:bg-[#DEEBFF] h-6 px-1.5 rounded-[3px] space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Subtask</span>
            </Button>

            {/* Bottom Details Bar: Time Estimate, Priority & Assignee */}
            <div className="flex items-center space-x-2">
              {task.estimatedMinutes !== undefined && task.estimatedMinutes !== null && (
                <span className="text-[9px] font-semibold text-[#5E6C84] bg-[#F4F5F7] px-1.5 py-0.5 rounded border border-[#DFE1E6]">
                  {displayFormattedTime(task.estimatedMinutes)}
                </span>
              )}

              {renderPriorityBadge(task.priority)}

              {mainAssignee && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-5 h-5 rounded-full bg-[#0052CC] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                        {assigneeInitials}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{mainAssignee.name || mainAssignee.email}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Alert */}
      <CustomAlertDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        description={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
