"use client";

import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

// Mock task data matching the Atlassian layout and schema
const INITIAL_COLUMNS = [
  {
    id: "todo",
    name: "TO DO",
    color: "bg-ds-bg-neutral text-ds-text",
    tasks: [
      {
        id: "CAD-1",
        title: "Integrate secure authentication in frontend",
        description: "Configure authentication middleware, routing redirects, and customize user access pages.",
        priority: "high",
        labels: ["Auth", "Frontend"],
        assignee: "JD",
      },
      {
        id: "CAD-2",
        title: "Create authentication middleware in backend API",
        description: "Parse authorization headers, verify token signature, and attach user context payload.",
        priority: "medium",
        labels: ["Auth", "Backend"],
        assignee: "AV",
      },
      {
        id: "CAD-3",
        title: "Configure base design system tokens",
        description: "Add primary and neutral CSS variables to globals.css and integrate with theme styles.",
        priority: "low",
        labels: ["Styling"],
        assignee: "JD",
      },
    ],
  },
  {
    id: "inprogress",
    name: "IN PROGRESS",
    color: "bg-brand-subtle text-brand-hover",
    tasks: [
      {
        id: "CAD-4",
        title: "Verify database synchronization on user signup",
        description: "Check if the backend successfully executes syncUser on the first request.",
        priority: "highest",
        labels: ["Database", "Backend"],
        assignee: "AV",
      },
    ],
  },
  {
    id: "review",
    name: "IN REVIEW",
    color: "bg-[#EAE6FF] text-[#403294]",
    tasks: [
      {
        id: "CAD-5",
        title: "Style signup and login pages",
        description: "Apply custom theme variables and classes to the authentication components.",
        priority: "medium",
        labels: ["Styling", "Frontend"],
        assignee: "JD",
      },
    ],
  },
  {
    id: "done",
    name: "DONE",
    color: "bg-[#E2F0D9] text-[#2A5913]",
    tasks: [
      {
        id: "CAD-6",
        title: "Project Initialization",
        description: "Configure multi-repo setup for frontend and backend API codebases.",
        priority: "low",
        labels: ["Setup"],
        assignee: "AV",
      },
    ],
  },
];

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Helper to render priority arrow SVG
  const renderPriorityIcon = (priority: string) => {
    switch (priority) {
      case "highest":
        return (
          <span className="text-ds-priority-highest flex items-center" title="Highest Priority">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
            </svg>
          </span>
        );
      case "high":
        return (
          <span className="text-ds-priority-high flex items-center" title="High Priority">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M4 15l1.41 1.41L11 10.83V20h2v-9.17l5.58 5.59L20 15l-8-8-8 8z" />
            </svg>
          </span>
        );
      case "medium":
        return (
          <span className="text-ds-priority-medium flex items-center" title="Medium Priority">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </span>
        );
      case "low":
        return (
          <span className="text-ds-priority-low flex items-center" title="Low Priority">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ds-bg text-ds-text">
      {/* ── Left Sidebar Navigation ─────────────────────────────────────────── */}
      <aside
        className={`flex flex-col border-r border-ds-border bg-ds-bg-neutral transition-all duration-200 ${
          isSidebarCollapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Project Header */}
        <div className="flex items-center justify-between p-4 border-b border-ds-border h-[64px]">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-2 text-brand font-bold tracking-tight">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.553 2.052a.84.84 0 00-.77.012L2.355 7.1c-.43.25-.693.71-.693 1.21v10.38c0 .5.263.96.693 1.21l8.428 5.035c.24.143.524.155.773.033l8.093-3.953a.846.846 0 00.493-.762V9.897a.844.844 0 00-.472-.756L11.553 2.052zM12 4.12l6.837 4.103-6.837 3.34-6.837-3.34L12 4.12z" />
              </svg>
              <span className="text-lg">Cadence Project</span>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="text-brand font-bold mx-auto">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.553 2.052a.84.84 0 00-.77.012L2.355 7.1c-.43.25-.693.71-.693 1.21v10.38c0 .5.263.96.693 1.21l8.428 5.035c.24.143.524.155.773.033l8.093-3.953a.846.846 0 00.493-.762V9.897a.844.844 0 00-.472-.756L11.553 2.052zM12 4.12l6.837 4.103-6.837 3.34-6.837-3.34L12 4.12z" />
              </svg>
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded-ds-btn hover:bg-ds-bg-neutral-hover text-ds-text-subtle focus:outline-none"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isSidebarCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <a
            href="#"
            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-ds-btn hover:bg-ds-bg-neutral-hover text-ds-text"
          >
            <svg className="w-4 h-4 text-ds-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {!isSidebarCollapsed && <span>Roadmap</span>}
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-ds-btn hover:bg-ds-bg-neutral-hover text-ds-text"
          >
            <svg className="w-4 h-4 text-ds-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            {!isSidebarCollapsed && <span>Backlog</span>}
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-3 py-2 text-sm font-semibold rounded-ds-btn bg-brand-subtle text-brand"
          >
            <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            {!isSidebarCollapsed && <span>Active Board</span>}
          </a>
          <div className="border-t border-ds-border my-2"></div>
          <a
            href="#"
            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-ds-btn hover:bg-ds-bg-neutral-hover text-ds-text"
          >
            <svg className="w-4 h-4 text-ds-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {!isSidebarCollapsed && <span>Project Settings</span>}
          </a>
        </nav>

        {/* User profile details at the bottom of the sidebar */}
        {!isSidebarCollapsed && isLoaded && user && (
          <div className="p-3 border-t border-ds-border flex items-center space-x-3">
            <UserButton />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ds-text truncate">{user.fullName || "Loading..."}</p>
              <p className="text-[10px] text-ds-text-subtle truncate">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Workspace Content Area ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar/Header */}
        <header className="flex items-center justify-between px-6 border-b border-ds-border h-[64px] min-h-[64px] bg-ds-bg">
          {/* Breadcrumbs & Title */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-1 text-xs text-ds-text-subtle">
              <span>Projects</span>
              <span>/</span>
              <span>Cadence Project</span>
              <span>/</span>
              <span className="text-ds-text">Board</span>
            </div>
            <h1 className="text-xl font-bold text-ds-text tracking-tight">Active Sprint Board</h1>
          </div>

          {/* User Button (Clerk controls) */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search board..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 px-3 py-1.5 text-sm bg-ds-bg-neutral-subtle border border-ds-border rounded-ds-btn focus:outline-none focus:bg-ds-bg focus:border-ds-border-focus focus:ring-1 focus:ring-ds-border-focus transition-all"
              />
              <span className="absolute right-2.5 top-2.5 text-ds-text-subtle">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
            <UserButton />
          </div>
        </header>

        {/* Board Toolbar */}
        <section className="px-6 py-4 flex items-center justify-between border-b border-ds-border bg-ds-bg-neutral-subtle">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold text-ds-text-subtle uppercase tracking-wider">Filters:</span>
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-brand text-white text-[10px] font-bold flex items-center justify-center cursor-pointer" title="John Doe">
                JD
              </div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-ds-priority-low text-white text-[10px] font-bold flex items-center justify-center cursor-pointer" title="Anshul Vats">
                AV
              </div>
            </div>
            <button className="text-xs px-2.5 py-1.5 bg-ds-bg-neutral-hover hover:bg-ds-bg-neutral font-medium rounded-ds-btn text-ds-text transition-colors">
              Only My Issues
            </button>
            <button className="text-xs px-2.5 py-1.5 bg-ds-bg-neutral-hover hover:bg-ds-bg-neutral font-medium rounded-ds-btn text-ds-text transition-colors">
              Recently Updated
            </button>
          </div>
          <button className="text-xs px-3 py-1.5 bg-brand hover:bg-brand-hover text-white font-medium rounded-ds-btn transition-colors flex items-center space-x-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Issue</span>
          </button>
        </section>

        {/* Kanban Board Grid */}
        <div className="flex-1 overflow-x-auto p-6 bg-ds-bg">
          <div className="flex space-x-4 h-full min-w-[900px]">
            {columns.map((column) => {
              // Filter tasks on search query
              const filteredTasks = column.tasks.filter(
                (task) =>
                  task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  task.id.toLowerCase().includes(searchQuery.toLowerCase())
              );

              return (
                <div
                  key={column.id}
                  className="flex flex-col w-72 bg-ds-bg-neutral rounded-ds-card border border-ds-border max-h-full"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-3 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold tracking-wider text-ds-text-subtle">
                        {column.name}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${column.color}`}>
                        {filteredTasks.length}
                      </span>
                    </div>
                    <button className="p-1 rounded-ds-btn hover:bg-ds-bg-neutral-hover text-ds-text-subtle">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Task List container */}
                  <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-2">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-ds-bg border border-ds-border rounded-ds-btn p-3 shadow-ds-elevation hover:border-ds-border-focus transition-all cursor-pointer group"
                      >
                        <h4 className="text-sm font-medium text-ds-text leading-5 mb-2 group-hover:text-brand transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-xs text-ds-text-subtle line-clamp-2 mb-3">
                          {task.description}
                        </p>

                        {/* Labels & Tags */}
                        {task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {task.labels.map((label) => (
                              <span
                                key={label}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-ds-btn bg-[#EAE6FF] text-[#403294]"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer details: Key, Priority, Assignee */}
                        <div className="flex items-center justify-between border-t border-ds-bg-neutral-subtle pt-2.5">
                          <span className="text-xs font-semibold text-ds-text-subtle tracking-tight hover:underline">
                            {task.id}
                          </span>
                          <div className="flex items-center space-x-2">
                            {renderPriorityIcon(task.priority)}
                            <div className="h-5 w-5 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center" title={`Assignee: ${task.assignee}`}>
                              {task.assignee}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredTasks.length === 0 && (
                      <div className="text-center py-8 text-xs text-ds-text-subtle">
                        No issues found
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
