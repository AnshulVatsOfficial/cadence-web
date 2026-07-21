"use client";

import React, { useState } from "react";
import { useProject, ProjectProvider } from "../../../components/projects/ProjectContext";
import ProjectLayoutShell from "../../../components/projects/ProjectLayoutShell";
import { Skeleton } from "../../../components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

function renderPriorityIcon(priority: string) {
  switch (priority.toUpperCase()) {
    case "URGENT":
      return (
        <span className="text-[#DE350B] flex items-center">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
          </svg>
        </span>
      );
    case "HIGH":
      return (
        <span className="text-[#FF5630] flex items-center">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M4 15l1.41 1.41L11 10.83V20h2v-9.17l5.58 5.59L20 15l-8-8-8 8z" />
          </svg>
        </span>
      );
    case "MEDIUM":
      return (
        <span className="text-[#FFAB00] flex items-center">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </span>
      );
    case "LOW":
      return (
        <span className="text-[#36B37E] flex items-center">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
          </svg>
        </span>
      );
    default:
      return null;
  }
}

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

function getColumnBadgeColor(stageName: string) {
  const norm = stageName.toLowerCase();
  if (norm.includes("todo") || norm.includes("to do")) {
    return "bg-[#F4F5F7] text-[#172B4D]";
  } else if (norm.includes("progress") || norm.includes("doing")) {
    return "bg-[#DEEBFF] text-[#0747A6]";
  } else if (norm.includes("review") || norm.includes("testing")) {
    return "bg-[#EAE6FF] text-[#403294]";
  } else if (norm.includes("done") || norm.includes("completed")) {
    return "bg-green-50 text-green-700";
  }
  return "bg-gray-100 text-gray-800";
}

function ProjectBoardContent() {
  const { projectDetails, loadingProjects } = useProject();
  const [searchQuery, setSearchQuery] = useState("");

  if (loadingProjects) {
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

  const stages = projectDetails?.stages || [];
  const tasks = projectDetails?.tasks || [];

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

        {/* Kanban Board Grid */}
        <div className="flex-grow overflow-x-auto p-6 bg-white">
          <div className="flex space-x-4 h-full min-w-[900px]">
            {stages.map((stage: any) => {
              const stageTasks = tasks.filter((t: any) => t.stageId === stage.id);
              const filteredTasks = stageTasks.filter(
                (task: any) =>
                  task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  task.id.toLowerCase().includes(searchQuery.toLowerCase())
              );

              return (
                <div
                  key={stage.id}
                  className="flex flex-col w-72 bg-[#F4F5F7] rounded-[4px] border border-[#DFE1E6] max-h-full"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-3 py-3 select-none flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold tracking-wider text-[#5E6C84]">
                        {stage.name.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getColumnBadgeColor(stage.name)}`}>
                        {filteredTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Task List container */}
                  <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-2">
                    {filteredTasks.map((task: any) => {
                      // Grab initials of the first assignee, if any
                      const mainAssignee = task.assignees?.[0]?.user;
                      const assigneeInitials = mainAssignee?.name
                        ? mainAssignee.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U";

                      return (
                        <div
                          key={task.id}
                          className="bg-white border border-[#DFE1E6] rounded-[3px] p-3 shadow-sm hover:border-[#4c86e0] transition-all cursor-pointer group"
                        >
                          <h4 className="text-xs font-semibold text-[#172B4D] leading-relaxed mb-1.5 group-hover:text-[#0052CC] transition-colors">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-[#5E6C84] line-clamp-2 mb-3">
                              {typeof task.description === "string"
                                ? task.description
                                : JSON.stringify(task.description)}
                            </p>
                          )}

                          {/* Footer details: Key, Priority, Assignee */}
                          <div className="flex items-center justify-between border-t border-[#F4F5F7] pt-2">
                            <span className="text-[10px] font-bold text-[#5E6C84] tracking-tight">
                              {task.id}
                            </span>
                            <div className="flex items-center space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>{renderPriorityIcon(task.priority)}</span>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-foreground text-background">
                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()} Priority
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
                      );
                    })}

                    {filteredTasks.length === 0 && (
                      <div className="text-center py-8 text-xs text-[#5E6C84] italic select-none">
                        No issues found
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
