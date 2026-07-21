"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Settings,
  Folder,
  Check,
  ChevronDown,
  Search,
  KanbanSquare,
  Briefcase,
  Loader2,
} from "lucide-react";
import CreateWorkspaceModal from "../../../components/workspaces/CreateWorkspaceModal";
import EditWorkspaceModal from "../../../components/workspaces/EditWorkspaceModal";
import CustomAlertDialog from "../../../components/shared/CustomAlertDialog";
import EmptyState from "../../../components/shared/EmptyState";
import InformationBanner from "../../../components/shared/InformationBanner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "../../../components/ui/sidebar";

// Shadcn Dropdown UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";

const INITIAL_COLUMNS = [
  {
    id: "todo",
    name: "TO DO",
    color: "bg-[#F4F5F7] text-[#172B4D]",
    tasks: [
      {
        id: "CAD-1",
        title: "Integrate secure authentication in frontend",
        description:
          "Configure authentication middleware, routing redirects, and customize user access pages.",
        priority: "high",
        labels: ["Auth", "Frontend"],
        assignee: "JD",
      },
      {
        id: "CAD-2",
        title: "Create authentication middleware in backend API",
        description:
          "Parse authorization headers, verify token signature, and attach user context payload.",
        priority: "medium",
        labels: ["Auth", "Backend"],
        assignee: "AV",
      },
      {
        id: "CAD-3",
        title: "Configure base design system tokens",
        description:
          "Add primary and neutral CSS variables to globals.css and integrate with theme styles.",
        priority: "low",
        labels: ["Styling"],
        assignee: "JD",
      },
    ],
  },
  {
    id: "inprogress",
    name: "IN PROGRESS",
    color: "bg-[#DEEBFF] text-[#0747A6]",
    tasks: [
      {
        id: "CAD-4",
        title: "Verify database synchronization on user signup",
        description:
          "Check if the backend successfully executes syncUser on the first request.",
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
        description:
          "Apply custom theme variables and classes to the authentication components.",
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
        description:
          "Configure multi-repo setup for frontend and backend API codebases.",
        priority: "low",
        labels: ["Setup"],
        assignee: "AV",
      },
    ],
  },
];

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const resolvedParams = use(params);
  const workspaceId = resolvedParams.workspaceId;

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [columns] = useState(INITIAL_COLUMNS);
  const [searchQuery, setSearchQuery] = useState("");

  // User details & Workspaces State
  const [backendDbId, setBackendDbId] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<any | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<any | null>(null);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selection
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch Workspaces list
  const fetchWorkspaces = useCallback(async (token: string) => {
    try {
      setLoadingWorkspaces(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);

        // Find current workspace in list
        const currentWs = data.find((w: any) => w.id === workspaceId);
        if (currentWs) {
          setActiveWorkspace(currentWs);
        } else if (data.length > 0) {
          // If workspace not found, redirect to first or global workspaces list
          router.push(`/workspaces/${data[0].id}`);
        } else {
          router.push("/workspaces");
        }
      }
    } catch (err) {
      console.error("Error fetching workspaces:", err);
    } finally {
      setLoadingWorkspaces(false);
    }
  }, [workspaceId, router]);

  // Profile Lazy Sync Effect
  useEffect(() => {
    if (!isLoaded || !user) return;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const res = await fetch(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          const err = await res.json();
          setProfileError(err.error ?? `HTTP ${res.status}`);
          return;
        }

        const { user: dbUser } = await res.json();
        setBackendDbId(dbUser.id);
        fetchWorkspaces(token);
      } catch (e: any) {
        setProfileError(e.message);
      }
    })();
  }, [isLoaded, user, getToken, fetchWorkspaces]);

  // Fetch details of active workspace when it changes
  useEffect(() => {
    if (!workspaceId) return;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces/${workspaceId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setWorkspaceDetails(data);

          // Select first project by default if projects exist
          if (data.projects && data.projects.length > 0) {
            setSelectedProject(data.projects[0]);
          } else {
            setSelectedProject(null);
          }
        }
      } catch (err) {
        console.error("Error fetching workspace details:", err);
      }
    })();
  }, [workspaceId, getToken]);

  const handleWorkspaceChange = (ws: any) => {
    router.push(`/workspaces/${ws.id}`);
  };

  // Helper to render priority arrow SVG
  const renderPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "highest":
      case "urgent":
        return (
          <span className="text-[#DE350B] flex items-center">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
            </svg>
          </span>
        );
      case "high":
        return (
          <span className="text-[#FF5630] flex items-center">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M4 15l1.41 1.41L11 10.83V20h2v-9.17l5.58 5.59L20 15l-8-8-8 8z" />
            </svg>
          </span>
        );
      case "medium":
        return (
          <span className="text-[#FFAB00] flex items-center">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </span>
        );
      case "low":
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
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-white text-[#172B4D] font-sans">

        {/* ── Left Sidebar (Shadcn UI + Jira Styling) ─────────────────────── */}
        <Sidebar collapsible="icon" className="border-r border-[#DFE1E6]">
          {/* Sidebar Header: Workspace Selector */}
          <SidebarHeader className="border-b border-[#DFE1E6] p-2 h-[64px] flex items-center justify-center">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="w-full hover:bg-[#EBECF0] transition focus-visible:ring-0 focus-visible:ring-offset-0 border-0 flex items-center justify-between px-2"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {loadingWorkspaces ? (
                          <Skeleton className="w-7 h-7 bg-gray-200 rounded-[3px] flex-shrink-0" />
                        ) : (
                          <Avatar className="w-7 h-7 rounded-[3px] flex-shrink-0">
                            <AvatarFallback
                              className="bg-[#0052CC] text-white font-bold text-xs rounded-[3px]"
                              style={{ color: "white" }}
                            >
                              {activeWorkspace ? activeWorkspace.name.charAt(0).toUpperCase() : ""}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="min-w-0 text-left group-data-[collapsible=icon]:hidden">
                          {loadingWorkspaces ? (
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-20 bg-gray-200" />
                              <Skeleton className="h-2.5 w-12 bg-gray-200" />
                            </div>
                          ) : (
                            <>
                              <p className="text-xs font-semibold text-[#172B4D] truncate leading-tight">
                                {activeWorkspace ? activeWorkspace.name : "Select Workspace"}
                              </p>
                              <p className="text-[10px] text-[#5E6C84] truncate leading-none mt-0.5 font-normal">
                                {activeWorkspace ? activeWorkspace.workspaceType : "None"}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#5E6C84] flex-shrink-0 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white border border-[#DFE1E6] rounded-[3px] shadow-lg z-50">
                    <DropdownMenuLabel className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider px-2 py-1.5">
                      Workspaces
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#DFE1E6]" />
                    {loadingWorkspaces ? (
                      <div className="px-2 py-2 space-y-2.5">
                        {[1, 2].map((i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <Skeleton className="w-5 h-5 bg-gray-200 rounded-[3px]" />
                            <Skeleton className="h-3 w-28 bg-gray-200 rounded-[2px]" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {workspaces.map((ws) => (
                          <DropdownMenuItem
                            key={ws.id}
                            onClick={() => handleWorkspaceChange(ws)}
                            className={`flex items-center justify-between px-2 py-1.5 text-xs rounded-[2px] cursor-pointer hover:bg-[#F4F5F7] transition ${activeWorkspace?.id === ws.id ? "bg-[#DEEBFF] text-[#0747A6] font-semibold" : "text-[#172B4D]"
                              }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-5 h-5 bg-[#0052CC] text-white font-bold text-[10px] rounded-[3px] flex items-center justify-center"
                                style={{ color: "white" }}
                              >
                                {ws.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate">{ws.name}</span>
                            </div>
                            {activeWorkspace?.id === ws.id && <Check className="w-3.5 h-3.5 text-[#0747A6]" />}
                          </DropdownMenuItem>
                        ))}
                        {workspaces.length === 0 && (
                          <div className="px-2 py-1.5 text-xs text-[#5E6C84] italic">
                            No workspaces found
                          </div>
                        )}
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-[#DFE1E6]" />
                    <DropdownMenuItem
                      onClick={() => router.push("/workspaces")}
                      className="flex items-center space-x-2 px-2 py-1.5 text-xs text-[#172B4D] hover:bg-[#F4F5F7] cursor-pointer rounded-[2px] font-medium"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>All Workspaces</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center space-x-2 px-2 py-1.5 text-xs text-[#0052CC] hover:bg-[#F4F5F7] cursor-pointer rounded-[2px] font-medium border-t border-[#DFE1E6] mt-1 pt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Workspace</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          {/* Sidebar Content: Projects & Planning Lists */}
          <SidebarContent className="px-2 py-3 space-y-4">
            {loadingWorkspaces ? (
              <div className="space-y-4 px-2">
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
                    Projects
                  </div>
                  <div className="space-y-2.5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-2.5 px-2 py-1">
                        <Skeleton className="w-3.5 h-3.5 bg-gray-200 rounded-[2px]" />
                        <Skeleton className="h-3.5 w-24 bg-gray-200 rounded-[2px] group-data-[collapsible=icon]:hidden" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeWorkspace && workspaceDetails ? (
              <>
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider mb-1 group-data-[collapsible=icon]:hidden">
                    Projects
                  </div>
                  <div className="space-y-0.5">
                    {workspaceDetails.projects && workspaceDetails.projects.map((proj: any) => (
                      <SidebarMenuButton
                        key={proj.id}
                        onClick={() => setSelectedProject(proj)}
                        className={`w-full flex items-center space-x-2.5 px-2 py-1.5 rounded-[3px] text-left text-xs ${selectedProject?.id === proj.id
                          ? "bg-[#DEEBFF] text-[#0747A6] font-semibold"
                          : "text-[#172B4D] hover:bg-[#EBECF0]"
                          }`}
                      >
                        <Folder className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{proj.name}</span>
                      </SidebarMenuButton>
                    ))}
                    {(!workspaceDetails.projects || workspaceDetails.projects.length === 0) && (
                      <p className="text-[11px] text-[#5E6C84] px-2 py-1.5 italic group-data-[collapsible=icon]:hidden">
                        No projects in workspace.
                      </p>
                    )}
                  </div>
                </div>

                {selectedProject && (
                  <div className="space-y-1">
                    <div className="border-t border-[#DFE1E6] my-2 group-data-[collapsible=icon]:hidden"></div>
                    <div className="px-2 py-1 text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider mb-1 group-data-[collapsible=icon]:hidden">
                      Planning
                    </div>
                    <SidebarMenuButton
                      className="w-full flex items-center space-x-2.5 px-2 py-1.5 rounded-[3px] text-xs bg-[#DEEBFF] text-[#0747A6] font-semibold"
                    >
                      <KanbanSquare className="w-3.5 h-3.5" />
                      <span className="group-data-[collapsible=icon]:hidden">Board</span>
                    </SidebarMenuButton>
                    {activeWorkspace.role === "OWNER" && (
                      <SidebarMenuButton
                        onClick={() => setShowEditModal(true)}
                        className="w-full flex items-center space-x-2.5 px-2 py-1.5 rounded-[3px] text-xs text-[#172B4D] hover:bg-[#EBECF0]"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span className="group-data-[collapsible=icon]:hidden">Workspace Settings</span>
                      </SidebarMenuButton>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-xs text-[#5E6C84] italic px-2 group-data-[collapsible=icon]:hidden">
                Create or select a workspace to view projects.
              </div>
            )}
          </SidebarContent>

          {/* Sidebar Footer: User profile */}
          <SidebarFooter className="border-t border-[#DFE1E6] p-3 flex flex-row items-center space-x-3 bg-[#F4F5F7]">
            <UserButton />
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-xs font-semibold text-[#172B4D] truncate">
                {user?.fullName || "Loading..."}
              </p>
              {backendDbId ? (
                <span className="inline-flex items-center text-[9px] font-mono text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  ✓ Database Synced
                </span>
              ) : profileError ? (
                <span
                  className="inline-flex items-center text-[9px] font-mono text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded cursor-help"
                  title={profileError}
                >
                  ✗ Sync Failed
                </span>
              ) : (
                <span className="text-[9px] font-mono text-gray-500 flex items-center space-x-1">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>syncing...</span>
                </span>
              )}
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* ── Main Workspace Content Area ─────────────────────────────────── */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">

          {/* Topbar/Header: Always Persistent with SidebarTrigger */}
          <header className="flex items-center justify-between px-6 border-b border-[#DFE1E6] h-[64px] min-h-[64px] bg-white">
            {/* Left Header: Trigger and Location Breadcrumbs */}
            <div className="flex items-center space-x-3">
              <SidebarTrigger className="text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#EBECF0] h-8 w-8 rounded-[3px]" />
              {activeWorkspace && (
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1.5 text-xs text-[#5E6C84]">
                    <Link href="/workspaces" className="hover:text-[#172B4D] hover:underline cursor-pointer">
                      Workspaces
                    </Link>
                    <span>/</span>
                    <span className="font-semibold text-[#172B4D]">{activeWorkspace.name}</span>
                    {selectedProject && (
                      <>
                        <span>/</span>
                        <span className="hover:text-[#172B4D] cursor-pointer">Projects</span>
                        <span>/</span>
                        <span className="text-[#172B4D]">{selectedProject.name}</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-lg font-bold text-[#172B4D] tracking-tight mt-0.5">
                    {selectedProject ? selectedProject.name : activeWorkspace.name}
                  </h1>
                </div>
              )}
            </div>

            {/* Right Header: Global Search and User Profile */}
            <div className="flex items-center space-x-4">
              {activeWorkspace && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5E6C84]" />
                  <input
                    type="text"
                    placeholder="Search board..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 pl-8 pr-3 py-1.5 text-xs bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] focus:outline-none focus:bg-white focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all"
                  />
                </div>
              )}
              <UserButton />
            </div>
          </header>

          {/* Inactive Status Banner */}
          {workspaceDetails?.status === "INACTIVE" && (
            <InformationBanner
              variant="warning"
              message="This workspace is Inactive. Projects and settings are currently in view-only mode."
              className="border-x-0 border-t-0 border-b rounded-none px-6 py-2 flex-shrink-0"
            />
          )}

          {/* If workspaces are loading, show board skeleton */}
          {loadingWorkspaces ? (
            <div className="flex-grow flex flex-col overflow-hidden bg-white">
              {/* Board Toolbar Loader */}
              <section className="px-6 py-3 flex items-center justify-between border-b border-[#DFE1E6] bg-[#FAFBFC] min-h-[50px]">
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
                  {Array.from({ length: 6 }, (_, index) => <div
                    key={index}
                    className="flex flex-col w-72 bg-[#F4F5F7] rounded-[4px] border border-[#DFE1E6] p-2 space-y-3 h-full"
                  >
                    <div className="flex items-center justify-between px-2 py-1">
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
                  </div>)}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Board Toolbar */}
              <section className="px-6 py-3 flex items-center justify-between border-b border-[#DFE1E6] bg-[#FAFBFC] min-h-[50px]">
                <div className="flex items-center space-x-4">
                  {selectedProject && (
                    <>
                      <span className="text-[10px] font-bold text-[#5E6C84] uppercase tracking-wider">
                        Filters:
                      </span>
                      <button className="text-[11px] px-2.5 py-1 bg-[#EBECF0] hover:bg-[#DFE1E6] font-semibold rounded-[3px] text-[#172B4D] transition-colors">
                        Only My Issues
                      </button>
                    </>
                  )}
                </div>

                {/* Workspace actions bar if user is OWNER / ADMIN */}
                {activeWorkspace && activeWorkspace.role === "OWNER" && (
                  <div className="flex items-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="outline"
                              onClick={() => setShowEditModal(true)}
                              className="text-[11px] h-8 px-3 border-[#DFE1E6] hover:bg-[#EBECF0] text-[#172B4D] rounded-[3px] font-semibold"
                              disabled={workspaceDetails?.status === "INACTIVE"}
                            >
                              Edit Workspace
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-foreground text-background">
                          {workspaceDetails?.status === "INACTIVE"
                            ? "Activate workspace to edit settings"
                            : "Edit workspace settings"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button
                      variant={workspaceDetails?.status === "INACTIVE" ? "default" : "destructive"}
                      onClick={() => setShowDeleteModal(true)}
                      className={`text-[11px] h-8 px-3 rounded-[3px] font-semibold ${workspaceDetails?.status === "INACTIVE"
                          ? "bg-green-700 hover:bg-green-800 text-white"
                          : "bg-[#DE350B] hover:bg-[#BF2600] text-white"
                        }`}
                    >
                      {workspaceDetails?.status === "INACTIVE" ? "Activate Workspace" : "Deactivate Workspace"}
                    </Button>
                  </div>
                )}
              </section>

              {/* Content Display: Kanban Board Grid */}
              <div className="flex-1 overflow-x-auto p-6 bg-white">
                {selectedProject ? (
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
                          className="flex flex-col w-72 bg-[#F4F5F7] rounded-[4px] border border-[#DFE1E6] max-h-full"
                        >
                          {/* Column Header */}
                          <div className="flex items-center justify-between px-3 py-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] font-bold tracking-wider text-[#5E6C84]">
                                {column.name}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${column.color}`}>
                                {filteredTasks.length}
                              </span>
                            </div>
                          </div>

                          {/* Task List container */}
                          <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-2">
                            {filteredTasks.map((task) => (
                              <div
                                key={task.id}
                                className="bg-white border border-[#DFE1E6] rounded-[3px] p-3 shadow-sm hover:border-[#4c86e0] transition-all cursor-pointer group"
                              >
                                <h4 className="text-xs font-semibold text-[#172B4D] leading-relaxed mb-1.5 group-hover:text-[#0052CC] transition-colors">
                                  {task.title}
                                </h4>
                                <p className="text-[11px] text-[#5E6C84] line-clamp-2 mb-3">
                                  {task.description}
                                </p>

                                {/* Labels & Tags */}
                                {task.labels.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2.5">
                                    {task.labels.map((label) => (
                                      <span
                                        key={label}
                                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] bg-[#EAE6FF] text-[#403294]"
                                      >
                                        {label}
                                      </span>
                                    ))}
                                  </div>
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
                                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                        </TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div
                                            className="h-5 w-5 rounded-full bg-[#0052CC] text-white text-[9px] font-bold flex items-center justify-center cursor-help"
                                          >
                                            {task.assignee}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-foreground text-background">
                                          Assignee: {task.assignee}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {filteredTasks.length === 0 && (
                              <div className="text-center py-8 text-xs text-[#5E6C84] italic">
                                No issues found
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // If a workspace is selected but has no project
                  <EmptyState
                    title="No Projects in this Workspace"
                    description="To view active sprint boards and issue trackers, create your first project inside this workspace."
                    icon={<Folder className="w-5 h-5" />}
                    iconBgClass="bg-[#EAE6FF] text-[#403294]"
                  />
                )}
              </div>
            </>
          )}
        </main>

        {/* ── MODALS (Modular Shared Components) ─────────────────────────────── */}
        <CreateWorkspaceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={async (newWs) => {
            const token = await getToken();
            if (token) {
              await fetchWorkspaces(token);
              router.push(`/workspaces/${newWs.id}`);
            }
          }}
        />

        <EditWorkspaceModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          workspace={activeWorkspace}
          onUpdateSuccess={async (updatedWs) => {
            const token = await getToken();
            if (token) {
              await fetchWorkspaces(token);
            }
          }}
        />

        <CustomAlertDialog
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={workspaceDetails?.status === "INACTIVE" ? "Activate Workspace?" : "Deactivate Workspace?"}
          confirmText={workspaceDetails?.status === "INACTIVE" ? "Activate Workspace" : "Deactivate Workspace"}
          variant={workspaceDetails?.status === "INACTIVE" ? "default" : "danger"}
          isLoading={isDeleting}
          description={
            <div className="space-y-3 text-left">
              <p>
                {workspaceDetails?.status === "INACTIVE" ? (
                  <>
                    Are you sure you want to activate the workspace{" "}
                    <strong className="text-[#172B4D]">"{activeWorkspace?.name}"</strong>? This will enable project modifications and team collaborations.
                  </>
                ) : (
                  <>
                    Are you sure you want to deactivate the workspace{" "}
                    <strong className="text-[#172B4D]">"{activeWorkspace?.name}"</strong>? This will switch the workspace and all projects inside it to view-only mode.
                  </>
                )}
              </p>
            </div>
          }
          onConfirm={async () => {
            try {
              setIsDeleting(true);
              const token = await getToken();
              if (!token) return;
              const newStatus = workspaceDetails?.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces/${activeWorkspace.id}`,
                {
                  method: "PATCH",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ status: newStatus }),
                }
              );

              if (res.ok) {
                setShowDeleteModal(false);
                // Reload workspace details
                const updatedRes = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces/${workspaceId}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                if (updatedRes.ok) {
                  const data = await updatedRes.json();
                  setWorkspaceDetails(data);
                }
                // Refresh list
                await fetchWorkspaces(token);
              } else {
                const err = await res.json();
                alert(err.error || "Failed to update workspace status");
              }
            } catch (err) {
              console.error("Error updating workspace status:", err);
            } finally {
              setIsDeleting(false);
            }
          }}
        />

      </div>
    </SidebarProvider>
  );
}
