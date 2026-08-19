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
import { Spinner } from "../ui/spinner";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "./tasks/TaskCard";
import CustomAlertDialog from "../shared/CustomAlertDialog";

const renameColumnSchema = z.object({
  name: z
    .string()
    .min(2, "Column name must be at least 2 characters")
    .max(50, "Column name cannot exceed 50 characters")
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
}: BoardColumnProps) {
  const { projectDetails, fetchProjectDetails, openCreateTaskModal } = useProject();

  const userRole = projectDetails?.role;
  const isWritable = projectDetails?.status !== "INACTIVE";
  const isAdminOrOwner = userRole === "OWNER" || userRole === "ADMIN";

  const [isEditingName, setIsEditingName] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [showDeleteColumnConfirm, setShowDeleteColumnConfirm] = useState(false);
  const [isDeletingColumn, setIsDeletingColumn] = useState(false);

  // Column renaming form
  const {
    register: registerRename,
    handleSubmit: handleRenameSubmit,
    formState: { isValid: isRenameValid },
    reset: resetRename,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(renameColumnSchema),
    defaultValues: { name: stage.name },
  });

  // Filter tasks to show all tasks in the column, including subtasks
  const tasksInColumn = tasks;

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

  return (
    <div className="flex flex-col w-72 rounded-[4px] border transition-all select-none max-h-full flex-shrink-0 bg-[#F4F5F7] border-[#DFE1E6]">
      {/* Column Header */}
      <div
        {...dragHandleProps}
        className={`flex items-center justify-between px-3 py-2.5 cursor-grab active:cursor-grabbing border-b border-[#DFE1E6]/60 ${
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
              <Button
                type="submit"
                size="icon-xs"
                variant="ghost"
                disabled={!isRenameValid || isRenaming}
                className="h-7 w-7 p-1 hover:bg-[#DEEBFF] hover:text-[#0747A6] rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRenaming ? <Spinner className="h-3 w-3" /> : <Check className="w-3.5 h-3.5" />}
              </Button>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={() => {
                  setIsEditingName(false);
                  resetRename();
                }}
                className="h-7 w-7 p-1 hover:bg-[#FFEBEB] hover:text-[#DE350B] rounded text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
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
                {tasksInColumn.length}
              </span>
              {isAdminOrOwner && isWritable && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setIsEditingName(true)}
                  className="h-5 w-5 p-0.5 opacity-0 hover:opacity-100 transition-opacity text-[#5E6C84] hover:text-[#172B4D]"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Delete Column (Admin / Owner only) */}
        {isAdminOrOwner && isWritable && !isEditingName && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowDeleteColumnConfirm(true)}
            className="h-7 w-7 p-1 rounded-[3px] text-[#5E6C84] hover:bg-[#FFEBEB] hover:text-[#DE350B] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Task List container */}
      <Droppable droppableId={stage.id} type="TASK">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-2 py-3 space-y-2 max-h-[calc(100vh-250px)] transition-colors min-h-[80px] ${
              snapshot.isDraggingOver ? "bg-[#DEEBFF]/35" : ""
            }`}
          >
            {tasksInColumn.map((task, idx) => (
              <Draggable key={task.id} draggableId={task.id} index={idx} isDragDisabled={!isWritable}>
                {(draggableProvided) => (
                  <div
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    {...draggableProvided.dragHandleProps}
                  >
                    <TaskCard task={task} isWritable={isWritable} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Footer Add Task Area */}
      {isWritable && (
        <div className="p-2 border-t border-[#DFE1E6]/50">
          <Button
            variant="ghost"
            onClick={() => openCreateTaskModal({ stageId: stage.id })}
            className="w-full flex items-center justify-start space-x-1.5 text-xs text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#EBECF0] h-8 py-1 px-2 rounded-[3px] transition-colors text-left font-normal"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create issue</span>
          </Button>
        </div>
      )}

      {/* Custom Alert Dialog for Deleting Column */}
      <CustomAlertDialog
        isOpen={showDeleteColumnConfirm}
        onClose={() => setShowDeleteColumnConfirm(false)}
        onConfirm={onDeleteColumn}
        title="Delete Column"
        description={`Are you sure you want to delete column "${stage.name}"? This will permanently delete the column and any tasks within it.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeletingColumn}
      />
    </div>
  );
}
