"use client";

import React, { useState, useEffect } from "react";
import { useProject, ProjectProvider } from "../../../components/projects/ProjectContext";
import ProjectLayoutShell from "../../../components/projects/ProjectLayoutShell";
import BoardColumn from "../../../components/projects/BoardColumn";
import { api } from "@/lib/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton } from "../../../components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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
  const { projectDetails, loadingProjects, fetchProjectDetails } = useProject();

  const [searchQuery, setSearchQuery] = useState("");
  const [localStages, setLocalStages] = useState<any[]>([]);
  const [localTasks, setLocalTasks] = useState<any[]>([]);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userRole = projectDetails?.role;
  const isWritable = projectDetails?.status !== "INACTIVE";
  const isAdminOrOwner = userRole === "OWNER" || userRole === "ADMIN";

  const {
    register: registerCol,
    handleSubmit: handleColSubmit,
    formState: { errors: colErrors, isSubmitting: isColSubmitting },
    reset: resetCol,
  } = useForm({
    resolver: zodResolver(addColumnSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (projectDetails) {
      setLocalStages(projectDetails.stages || []);
      setLocalTasks(projectDetails.tasks || []);
    }
  }, [projectDetails]);

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "COLUMN") {
      const newStages = Array.from(localStages);
      const [removed] = newStages.splice(source.index, 1);
      newStages.splice(destination.index, 0, removed);

      setLocalStages(newStages);

      try {
        const reorderPayload = newStages.map((stage, idx) => ({
          id: stage.id,
          order: idx,
        }));

        await api.put(`/projects/${projectDetails.id}/stages/reorder`, {
          stages: reorderPayload,
        });

        await fetchProjectDetails();
      } catch (err: any) {
        console.error(err);
        alert(err?.response?.data?.error || "Failed to save columns order.");
        setLocalStages(projectDetails.stages || []);
      }
      return;
    }

    if (type === "TASK") {
      const sourceColumnId = source.droppableId;
      const destColumnId = destination.droppableId;

      const draggedTask = localTasks.find((t) => t.id === draggableId);
      if (!draggedTask) return;

      const updatedTasks = Array.from(localTasks);
      const modifiedTask = { ...draggedTask, stageId: destColumnId };

      const oldIndex = updatedTasks.findIndex((t) => t.id === draggableId);
      if (oldIndex !== -1) {
        updatedTasks.splice(oldIndex, 1);
      }

      const destTasks = updatedTasks.filter((t) => t.stageId === destColumnId);

      let globalInsertIndex = updatedTasks.length;
      if (destination.index < destTasks.length) {
        const targetTaskAtDest = destTasks[destination.index];
        globalInsertIndex = updatedTasks.findIndex(
          (t) => t.id === targetTaskAtDest.id,
        );
      } else {
        if (destTasks.length > 0) {
          const lastTaskAtDest = destTasks[destTasks.length - 1];
          globalInsertIndex =
            updatedTasks.findIndex((t) => t.id === lastTaskAtDest.id) + 1;
        } else {
          globalInsertIndex = updatedTasks.length;
        }
      }

      updatedTasks.splice(globalInsertIndex, 0, modifiedTask);
      setLocalTasks(updatedTasks);

      try {
        await api.patch(
          `/projects/${projectDetails.id}/tasks/${draggableId}`,
          { stageId: destColumnId },
        );

        await fetchProjectDetails();
      } catch (err: any) {
        console.error(err);
        alert(err?.response?.data?.error || "Failed to update task column.");
        setLocalTasks(projectDetails.tasks || []);
      }
    }
  };

  const onAddColumn = async (data: { name: string }) => {
    if (!isWritable || !isAdminOrOwner) return;
    try {
      await api.post(`/projects/${projectDetails.id}/stages`, {
        name: data.name,
      });

      resetCol();
      setShowAddColumn(false);
      await fetchProjectDetails();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to create column.");
    }
  };

  if (loadingProjects || !projectDetails) {
    return (
      <ProjectLayoutShell
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      >
        <div className="p-6 h-full flex flex-col space-y-6">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-6 w-48 bg-gray-200" />
            <Skeleton className="h-5 w-20 bg-gray-200 rounded-full" />
          </div>
          <div className="flex space-x-4 overflow-x-auto flex-1 pb-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-72 bg-[#F4F5F7] rounded-[3px] p-3 flex-shrink-0 space-y-3"
              >
                <Skeleton className="h-4 w-1/2 bg-gray-200" />
                <Skeleton className="h-20 w-full bg-gray-200" />
                <Skeleton className="h-16 w-full bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </ProjectLayoutShell>
    );
  }

  return (
    <ProjectLayoutShell
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <div className="h-full flex flex-col bg-white overflow-hidden">
        {/* Sub-Header Metadata Bar */}
        <div className="px-6 py-3 border-b border-[#DFE1E6] flex items-center justify-between bg-white flex-shrink-0 select-none">
          <div className="flex items-center space-x-3">
            <Badge
              variant="outline"
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] ${getStatusBadgeStyles(
                projectDetails.status,
              )}`}
            >
              {projectDetails.status}
            </Badge>

            <span className="text-xs text-[#5E6C84]">
              Role:{" "}
              <strong className="text-[#172B4D]">
                {projectDetails.role || "MEMBER"}
              </strong>
            </span>
          </div>

          <div className="text-xs text-[#5E6C84]">
            Total Tasks:{" "}
            <strong className="text-[#172B4D]">
              {localTasks.length}
            </strong>
          </div>
        </div>

        {/* Board Workspace Area */}
        <div className="flex-1 p-6 overflow-x-auto overflow-y-hidden bg-[#FAFBFC]">
          {mounted ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable
                droppableId="board-columns"
                type="COLUMN"
                direction="horizontal"
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex space-x-4 h-full items-start"
                  >
                    {localStages.map((stage, index) => {
                      const stageTasks = localTasks.filter((t) => {
                        const matchesStage = t.stageId === stage.id;
                        const matchesSearch = searchQuery
                          ? t.title
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                          : true;
                        return matchesStage && matchesSearch;
                      });

                      return (
                        <Draggable
                          key={stage.id}
                          draggableId={stage.id}
                          index={index}
                          isDragDisabled={!isAdminOrOwner || !isWritable}
                        >
                          {(providedCol) => (
                            <div
                              ref={providedCol.innerRef}
                              {...providedCol.draggableProps}
                              className="h-full"
                            >
                              <BoardColumn
                                stage={stage}
                                tasks={stageTasks}
                                index={index}
                                dragHandleProps={providedCol.dragHandleProps}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}

                    {provided.placeholder}

                    {/* Add Column Button / Inline Input */}
                    {isAdminOrOwner && isWritable && (
                      <div className="w-72 flex-shrink-0">
                        {showAddColumn ? (
                          <div className="bg-[#F4F5F7] border border-[#DFE1E6] rounded-[3px] p-3 shadow-sm">
                            <form onSubmit={handleColSubmit(onAddColumn)}>
                              <Input
                                type="text"
                                placeholder="Enter column name..."
                                className="bg-white border-[#DFE1E6] text-xs h-8 mb-2 focus:border-[#0052CC]"
                                autoFocus
                                {...registerCol("name")}
                              />
                              {colErrors.name && (
                                <p className="text-[10px] text-[#DE350B] font-semibold mb-2">
                                  {colErrors.name.message}
                                </p>
                              )}
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="submit"
                                  disabled={isColSubmitting}
                                  className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs h-7 px-3 rounded-[3px]"
                                >
                                  {isColSubmitting ? "Adding..." : "Add Column"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => {
                                    resetCol();
                                    setShowAddColumn(false);
                                  }}
                                  className="text-xs h-7 px-2 text-[#5E6C84]"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowAddColumn(true)}
                            className="w-full flex items-center space-x-2 p-3 bg-[#F4F5F7] hover:bg-[#EBECF0] border border-dashed border-[#DFE1E6] rounded-[3px] text-xs font-semibold text-[#5E6C84] hover:text-[#172B4D] transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Column</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="flex space-x-4 h-full items-start">
              {localStages.map((stage) => (
                <div key={stage.id} className="w-72 h-full bg-[#F4F5F7] rounded-[3px] p-3" />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProjectLayoutShell>
  );
}

export default function ProjectBoardPage() {
  return (
    <ProjectProvider>
      <ProjectBoardContent />
    </ProjectProvider>
  );
}
