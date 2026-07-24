"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProject } from "./ProjectContext";
import { api } from "@/lib/api";
import { Trash2, Plus, X, Edit2, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Spinner } from "../ui/spinner";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

// Zod schemas for validation
const renameColumnSchema = z.object({
  name: z
    .string()
    .min(2, "Column name must be at least 2 characters")
    .max(50, "Column name cannot exceed 50 characters")
    .trim(),
});

const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Task title must be at least 3 characters")
    .max(150, "Task title cannot exceed 150 characters")
    .trim(),
});

interface BoardColumnProps {
  stage: any;
  tasks: any[];
  dragHandleProps: any;
  index: number;
}

export default function BoardColumn({
  stage,
  tasks,
  dragHandleProps,
  index,
}: BoardColumnProps) {
  const { projectDetails, fetchProjectDetails } = useProject();

  const userRole = projectDetails?.role;
  const isWritable = projectDetails?.status !== "INACTIVE";
  const isAdminOrOwner = userRole === "OWNER" || userRole === "ADMIN";

  const [isEditingName, setIsEditingName] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  
  // Deletion States
  const [showDeleteColumnConfirm, setShowDeleteColumnConfirm] = useState(false);
  const [isDeletingColumn, setIsDeletingColumn] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // Column renaming form
  const {
    register: registerRename,
    handleSubmit: handleRenameSubmit,
    formState: { errors: renameErrors, isValid: isRenameValid },
    reset: resetRename,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(renameColumnSchema),
    defaultValues: { name: stage.name },
  });

  // Task creation form
  const {
    register: registerTask,
    handleSubmit: handleTaskSubmit,
    formState: { errors: taskErrors, isValid: isTaskValid, isSubmitting: isTaskSubmitting },
    reset: resetTask,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(createTaskSchema),
    defaultValues: { title: "" },
  });

  // Handle column rename
  const onRename = async (data: { name: string }) => {
    if (!isAdminOrOwner || !isWritable) return;
    try {
      setIsRenaming(true);
      await api.patch(`/projects/${projectDetails.id}/stages/${stage.id}`, {
        name: data.name,
      });
      setIsEditingName(false);
      await fetchProjectDetails();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || "Error occurred renaming column.");
    } finally {
      setIsRenaming(false);
    }
  };

  // Handle column delete
  const onDeleteColumn = async () => {
    if (!isAdminOrOwner || !isWritable) return;
    try {
      setIsDeletingColumn(true);
      await api.delete(`/projects/${projectDetails.id}/stages/${stage.id}`);
      setShowDeleteColumnConfirm(false);
      await fetchProjectDetails();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || "Error deleting column.");
    } finally {
      setIsDeletingColumn(false);
    }
  };

  // Handle task delete
  const onDeleteTask = async () => {
    if (!taskToDelete || !isWritable) return;
    try {
      setIsDeletingTask(true);
      await api.delete(`/projects/${projectDetails.id}/tasks/${taskToDelete.id}`);
      setTaskToDelete(null);
      await fetchProjectDetails();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || "Error deleting task.");
    } finally {
      setIsDeletingTask(false);
    }
  };

  // Handle task create
  const onAddTask = async (data: { title: string }) => {
    if (!isWritable) return;
    try {
      await api.post(`/projects/${projectDetails.id}/tasks`, {
        title: data.title,
        stageId: stage.id,
      });
      resetTask();
      setShowAddTask(false);
      await fetchProjectDetails();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || "Error creating task.");
    }
  };

  // Render priority icon helper
  const renderPriorityIcon = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "URGENT":
        return <span className="text-[#DE350B] font-bold text-xs">↑</span>;
      case "HIGH":
        return <span className="text-[#FF5630] font-bold text-xs">↑</span>;
      case "MEDIUM":
        return <span className="text-[#FFAB00] font-bold text-xs">═</span>;
      case "LOW":
        return <span className="text-[#36B37E] font-bold text-xs">↓</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-72 rounded-[4px] border transition-all select-none max-h-full flex-shrink-0 bg-[#F4F5F7] border-[#DFE1E6]">
      {/* Column Header */}
      <div
        {...dragHandleProps}
        className={`flex items-center justify-between px-3 py-2.5 cursor-grab active:cursor-grabbing border-b border-transparent ${
          isAdminOrOwner && isWritable ? "hover:bg-[#EBECF0]" : ""
        }`}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-grow mr-2">
          {isEditingName ? (
            <form
              onSubmit={handleRenameSubmit(onRename)}
              className="flex items-center space-x-1.5 w-full"
            >
              <Input
                {...registerRename("name")}
                autoFocus
                className="h-7 py-0.5 px-2 text-xs bg-white border-[#DFE1E6] rounded-[3px] focus-visible:ring-1 focus-visible:ring-[#0052CC]"
              />
              <button
                type="submit"
                disabled={!isRenameValid || isRenaming}
                className="p-1 hover:bg-[#DEEBFF] hover:text-[#0747A6] rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRenaming ? <Spinner className="h-3 w-3" /> : <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingName(false);
                  resetRename();
                }}
                className="p-1 hover:bg-[#FFEBEB] hover:text-[#DE350B] rounded text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <>
              <span
                onDoubleClick={() => {
                  if (isAdminOrOwner && isWritable) {
                    setIsEditingName(true);
                  }
                }}
                className="text-[11px] font-bold tracking-wider text-[#5E6C84] uppercase truncate cursor-pointer hover:underline"
                title="Double click to rename"
              >
                {stage.name}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E3E6EA] text-[#5E6C84]">
                {tasks.length}
              </span>
              {isAdminOrOwner && isWritable && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-0.5 opacity-0 hover:opacity-100 transition-opacity text-[#5E6C84] hover:text-[#172B4D]"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Delete Column (Admin / Owner only) */}
        {isAdminOrOwner && isWritable && !isEditingName && (
          <button
            onClick={() => setShowDeleteColumnConfirm(true)}
            className="p-1 rounded-[3px] text-[#5E6C84] hover:bg-[#FFEBEB] hover:text-[#DE350B] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Task List container */}
      <Droppable droppableId={stage.id} type="TASK">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-2 py-3 space-y-2 max-h-[calc(100vh-250px)] transition-colors ${
              snapshot.isDraggingOver ? "bg-[#DEEBFF]/35" : ""
            }`}
          >
            {tasks.map((task, idx) => {
              const mainAssignee = task.assignees?.[0]?.user;
              const assigneeInitials = mainAssignee?.name
                ? mainAssignee.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                : "U";

              return (
                <Draggable key={task.id} draggableId={task.id} index={idx} isDragDisabled={!isWritable}>
                  {(draggableProvided) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                      className="bg-white border border-[#DFE1E6] rounded-[3px] p-3 shadow-sm hover:border-[#4c86e0] transition-all cursor-grab active:cursor-grabbing group relative"
                    >
                      {/* Trash Button for Tasks */}
                      {isWritable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskToDelete(task);
                          }}
                          className="absolute top-2 right-2 p-1 rounded-[3px] opacity-0 group-hover:opacity-100 transition-opacity text-[#5E6C84] hover:bg-[#FFEBEB] hover:text-[#DE350B]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}

                      <h4 className="text-xs font-semibold text-[#172B4D] leading-relaxed mb-1 pr-5 group-hover:text-[#0052CC] transition-colors">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-[#5E6C84] line-clamp-2 mb-3">
                          {typeof task.description === "string"
                            ? task.description
                            : JSON.stringify(task.description)}
                        </p>
                      )}

                      {/* Task Footer details */}
                      <div className="flex items-center justify-between border-t border-[#F4F5F7] pt-2 mt-2">
                        <span className="text-[9px] font-bold text-[#5E6C84] tracking-tight uppercase">
                          {task.id.slice(-6).toUpperCase()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{renderPriorityIcon(task.priority)}</span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-foreground text-background">
                                {task.priority.charAt(0).toUpperCase() +
                                  task.priority.slice(1).toLowerCase()}{" "}
                                Priority
                              </TooltipContent>
                            </Tooltip>

                            {mainAssignee && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="h-5 w-5 rounded-full bg-[#0052CC] text-white text-[9px] font-bold flex items-center justify-center cursor-help">
                                    {assigneeInitials}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-foreground text-background">
                                  Assignee: {mainAssignee.name}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}

            {tasks.length === 0 && (
              <div className="text-center py-6 text-xs text-[#5E6C84] italic select-none">
                No issues found
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Add Task Form (bottom of the column) */}
      <div className="p-2 border-t border-[#DFE1E6] bg-[#FAFBFC] rounded-b-[4px]">
        {showAddTask ? (
          <form onSubmit={handleTaskSubmit(onAddTask)} className="space-y-2">
            <Textarea
              {...registerTask("title")}
              placeholder="What needs to be done?"
              autoFocus
              className="text-xs p-2 bg-white border-[#DFE1E6] rounded-[3px] resize-none h-16 focus-visible:ring-1 focus-visible:ring-[#0052CC]"
            />
            {taskErrors.title && (
              <span className="text-[10px] text-[#DE350B] font-semibold block">
                {taskErrors.title.message}
              </span>
            )}
            <div className="flex items-center space-x-1.5">
              <Button
                type="submit"
                disabled={!isTaskValid || isTaskSubmitting}
                className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-[10px] h-7 px-2.5 rounded-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTaskSubmitting ? "Adding..." : "Add"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddTask(false);
                  resetTask();
                }}
                className="text-[#5E6C84] hover:bg-[#EBECF0] text-[10px] h-7 px-2 rounded-[3px]"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          isWritable && (
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full flex items-center space-x-1.5 text-xs text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#EBECF0] py-1 px-2 rounded transition-colors text-left"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create issue</span>
            </button>
          )
        )}
      </div>

      {/* Custom Alert Dialog for Deleting Column */}
      <AlertDialog open={showDeleteColumnConfirm} onOpenChange={setShowDeleteColumnConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the column "{stage.name}"? This action cannot be undone and will permanently delete all tasks inside this column.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={onDeleteColumn}
              disabled={isDeletingColumn}
            >
              {isDeletingColumn ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Custom Alert Dialog for Deleting Task */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the task "{taskToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={onDeleteTask}
              disabled={isDeletingTask}
            >
              {isDeletingTask ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
