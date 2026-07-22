"use client";

import React, { useState, useEffect } from "react";
import { useProject, ProjectProvider } from "../../../components/projects/ProjectContext";
import ProjectLayoutShell from "../../../components/projects/ProjectLayoutShell";
import BoardColumn from "../../../components/projects/BoardColumn";
import { useAuth } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton } from "../../../components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Schema for adding a new column
const addColumnSchema = z.object({
  name: z
    .string()
    .min(2, "Column name must be at least 2 characters")
    .max(50, "Column name cannot exceed 50 characters")
    .trim(),
});

function getStatusBadgeStyles(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-50 text-green-700 border-green-200";
    case "ON_HOLD":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "COMPLETED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "ARCHIVED":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "INACTIVE":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-100";
  }
}

function ProjectBoardContent() {
  const { getToken } = useAuth();
  const { projectDetails, loadingProjects, fetchProjectDetails } = useProject();

  const [searchQuery, setSearchQuery] = useState("");
  const [localStages, setLocalStages] = useState<any[]>([]);
  const [localTasks, setLocalTasks] = useState<any[]>([]);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userRole = projectDetails?.role;
  const isWritable = projectDetails?.status !== "INACTIVE";
  const isAdminOrOwner = userRole === "OWNER" || userRole === "ADMIN";

  // Form for adding a new column
  const {
    register: registerCol,
    handleSubmit: handleColSubmit,
    formState: { errors: colErrors, isSubmitting: isColSubmitting },
    reset: resetCol,
  } = useForm({
    resolver: zodResolver(addColumnSchema),
    defaultValues: { name: "" },
  });

  // Client hydration check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep local stages and tasks synchronized with project details
  useEffect(() => {
    if (projectDetails) {
      setLocalStages(projectDetails.stages || []);
      setLocalTasks(projectDetails.tasks || []);
    }
  }, [projectDetails]);

  // Handle Drag-and-Drop End via library
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // 1. Column Drag-and-Drop Reordering
    if (type === "COLUMN") {
      const newStages = Array.from(localStages);
      const [removed] = newStages.splice(source.index, 1);
      newStages.splice(destination.index, 0, removed);

      setLocalStages(newStages);

      try {
        const token = await getToken();
        if (!token) return;

        const reorderPayload = newStages.map((stage, idx) => ({
          id: stage.id,
          order: idx,
        }));

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${projectDetails.id}/stages/reorder`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ stages: reorderPayload }),
          }
        );

        if (res.ok) {
          await fetchProjectDetails();
        } else {
          const err = await res.json();
          alert(err.error || "Failed to save columns order.");
          setLocalStages(projectDetails.stages || []);
        }
      } catch (err) {
        console.error(err);
        setLocalStages(projectDetails.stages || []);
      }
      return;
    }

    // 2. Task Drag-and-Drop Reordering/Transitioning
    if (type === "TASK") {
      const sourceColumnId = source.droppableId;
      const destColumnId = destination.droppableId;

      const draggedTask = localTasks.find((t) => t.id === draggableId);
      if (!draggedTask) return;

      // Optimistic update
      const updatedTasks = Array.from(localTasks);
      const modifiedTask = { ...draggedTask, stageId: destColumnId };

      // Remove from old index
      const oldIndex = updatedTasks.findIndex((t) => t.id === draggableId);
      if (oldIndex !== -1) {
        updatedTasks.splice(oldIndex, 1);
      }

      // Insert at new index relative to other tasks in the destination column
      const destTasks = updatedTasks.filter((t) => t.stageId === destColumnId);
      
      let globalInsertIndex = updatedTasks.length;
      if (destination.index < destTasks.length) {
        const targetTaskAtDest = destTasks[destination.index];
        globalInsertIndex = updatedTasks.findIndex((t) => t.id === targetTaskAtDest.id);
      } else {
        if (destTasks.length > 0) {
          const lastTaskAtDest = destTasks[destTasks.length - 1];
          globalInsertIndex = updatedTasks.findIndex((t) => t.id === lastTaskAtDest.id) + 1;
        } else {
          globalInsertIndex = updatedTasks.length;
        }
      }

      updatedTasks.splice(globalInsertIndex, 0, modifiedTask);
      setLocalTasks(updatedTasks);

      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${projectDetails.id}/tasks/${draggableId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ stageId: destColumnId }),
          }
        );

        if (res.ok) {
          await fetchProjectDetails();
        } else {
          const err = await res.json();
          alert(err.error || "Failed to update task column.");
          setLocalTasks(projectDetails.tasks || []);
        }
      } catch (err) {
        console.error(err);
        setLocalTasks(projectDetails.tasks || []);
      }
    }
  };

  // Add new column
  const onAddColumn = async (data: { name: string }) => {
    if (!isWritable || !isAdminOrOwner) return;
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${projectDetails.id}/stages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: data.name }),
        }
      );

      if (res.ok) {
        resetCol();
        setShowAddColumn(false);
        await fetchProjectDetails();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create column.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred creating column.");
    }
  };

  // Static Fallback & Server-side render safety
  if (loadingProjects || !mounted) {
    return (
      <ProjectLayoutShell searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
        <div className="flex-grow flex flex-col overflow-hidden bg-white h-full">
          {/* Board Toolbar Loader */}
          <section className="px-6 py-3 flex items-center justify-between border-b border-[#DFE1E6] bg-[#FAFBFC] min-h-[50px] select-none flex-shrink-0">
            <div className="flex items-center space-x-4">
              <span className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider">
                Filters:
              </span>
              <Skeleton className="h-6 w-24 bg-gray-200 rounded-[3px]" />
            </div>
          </section>

          {/* Kanban Grid Loader */}
          <div className="flex-1 overflow-x-auto p-6 bg-white">
            <div className="flex space-x-4 h-full min-w-[900px]">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="flex flex-col w-72 bg-[#F4F5F7] rounded-[4px] border border-[#DFE1E6] p-2 space-y-3 h-full"
                >
                  <div className="flex items-center justify-between px-2 py-1 select-none">
                    <Skeleton className="h-4 w-20 bg-gray-200" />
                    <Skeleton className="h-4 w-6 bg-gray-200 rounded-full" />
                  </div>

                  <div className="space-y-2 flex-1 overflow-hidden">
                    {[1, 2, 3].map((card) => (
                      <div
                        key={card}
                        className="bg-white border border-[#DFE1E6] rounded-[3px] p-3 space-y-2.5 shadow-sm"
                      >
                        <Skeleton className="h-4 w-5/6 bg-gray-100" />
                        <Skeleton className="h-3 w-full bg-gray-100" />
                        <Skeleton className="h-3 w-2/3 bg-gray-100" />
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                          <Skeleton className="h-3 w-12 bg-gray-100" />
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-3.5 w-3.5 bg-gray-100" />
                            <Skeleton className="h-5 w-5 rounded-full bg-gray-200" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProjectLayoutShell>
    );
  }

  return (
    <ProjectLayoutShell searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Filters and Subheader actions */}
        <section className="px-6 py-3 flex items-center justify-between border-b border-[#DFE1E6] bg-[#FAFBFC] min-h-[50px] select-none flex-shrink-0">
          <div className="flex items-center space-x-4">
            <span className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider">
              Filters:
            </span>
            <button className="text-[11px] px-2.5 py-1 bg-[#EBECF0] hover:bg-[#DFE1E6] font-semibold rounded-[3px] text-[#172B4D] transition-colors">
              Only My Issues
            </button>
          </div>
          {projectDetails?.status && (
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider">Status:</span>
              <Badge variant="outline" className={`text-[10px] font-bold rounded-sm border select-none px-2 py-0.5 ${getStatusBadgeStyles(projectDetails.status)}`}>
                {projectDetails.status}
              </Badge>
            </div>
          )}
        </section>

        {/* DragDropContext wrapping the columns grid */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-grow overflow-x-auto p-6 bg-white h-full">
            <Droppable droppableId="board" type="COLUMN" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex space-x-4 h-full items-start min-w-[900px] pb-6"
                >
                  {localStages.map((stage: any, idx: number) => {
                    const stageTasks = localTasks.filter((t: any) => t.stageId === stage.id);
                    const filteredTasks = stageTasks.filter(
                      (task: any) =>
                        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        task.id.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    return (
                      <Draggable
                        key={stage.id}
                        draggableId={stage.id}
                        index={idx}
                        isDragDisabled={!isAdminOrOwner || !isWritable}
                      >
                        {(draggableProvided) => (
                          <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                          >
                            <BoardColumn
                              stage={stage}
                              tasks={filteredTasks}
                              dragHandleProps={draggableProvided.dragHandleProps}
                              index={idx}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}

                  {/* Add Column Card Button */}
                  {isWritable && isAdminOrOwner && (
                    <div className="w-72 flex-shrink-0 bg-[#F4F5F7]/65 border border-dashed border-[#DFE1E6] rounded-[4px] p-3 transition-all hover:bg-[#F4F5F7] select-none">
                      {showAddColumn ? (
                        <form onSubmit={handleColSubmit(onAddColumn)} className="space-y-2">
                          <Input
                            {...registerCol("name")}
                            placeholder="Column name (e.g. In Review)"
                            autoFocus
                            className="text-xs bg-white border-[#DFE1E6] rounded-[3px] focus-visible:ring-1 focus-visible:ring-[#0052CC]"
                          />
                          {colErrors.name && (
                            <span className="text-[10px] text-[#DE350B] font-semibold block">
                              {colErrors.name.message}
                            </span>
                          )}
                          <div className="flex items-center space-x-1.5">
                            <Button
                              type="submit"
                              disabled={isColSubmitting}
                              className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-[10px] h-7 px-3 rounded-[3px]"
                            >
                              {isColSubmitting ? "Adding..." : "Add Column"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setShowAddColumn(false);
                                resetCol();
                              }}
                              className="text-[#5E6C84] hover:bg-[#EBECF0] text-[10px] h-7 px-2 rounded-[3px]"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setShowAddColumn(true)}
                          className="w-full flex items-center space-x-1.5 text-xs text-[#5E6C84] hover:text-[#172B4D] py-1.5 px-2 rounded transition-colors text-left"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Column</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </ProjectLayoutShell>
  );
}

export default function ProjectDashboardPage() {
  return (
    <ProjectProvider>
      <ProjectBoardContent />
    </ProjectProvider>
  );
}
