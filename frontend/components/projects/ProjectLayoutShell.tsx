"use client";

import React, { useState } from "react";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { useRouter, useParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  ChevronDown,
  Search,
  KanbanSquare,
  Loader2,
  Home,
  Check,
} from "lucide-react";
import { useProject } from "./ProjectContext";
import CreateProjectModal from "./CreateProjectModal";
import EditProjectModal from "./EditProjectModal";
import CustomAlertDialog from "../shared/CustomAlertDialog";
import InformationBanner from "../shared/InformationBanner";
import { Skeleton } from "../ui/skeleton";
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
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface ProjectLayoutShellProps {
  children: React.ReactNode;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export default function ProjectLayoutShell({
  children,
  searchQuery = "",
  setSearchQuery,
}: ProjectLayoutShellProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const projectId = params?.projectId as string;

  const {
    projects,
    activeProject,
    projectDetails,
    loadingProjects,
    backendDbId,
    profileError,
    fetchProjects,
    fetchProjectDetails,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDeleteModal,
    setShowDeleteModal,
  } = useProject();

  const [isDeletingProj, setIsDeletingProj] = useState(false);

  const handleProjectChange = (proj: any) => {
    router.push(`/projects/${proj.id}`);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
        {/* ── SIDEBAR PANEL ──────────────────────────────────────────────── */}
        <Sidebar collapsible="icon" className="border-r border-[#DFE1E6] bg-[#FAFBFC] select-none">
          
          {/* Sidebar Header: Project Dropdown Selector */}
          <SidebarHeader className="border-b border-[#DFE1E6] p-3 group-data-[collapsible=icon]:p-2 min-h-[64px] justify-center bg-white">
            <SidebarMenu>
              <SidebarMenuItem>
                {loadingProjects ? (
                  <div className="flex items-center space-x-2.5 px-2">
                    <Skeleton className="w-8 h-8 bg-gray-200 rounded-[3px] flex-shrink-0 animate-pulse" />
                    <div className="space-y-1.5 flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                      <Skeleton className="h-3 w-3/4 bg-gray-200 animate-pulse" />
                      <Skeleton className="h-2.5 w-1/2 bg-gray-200 animate-pulse" />
                    </div>
                  </div>
                ) : activeProject ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton size="lg" className="w-full flex items-center justify-between p-2 hover:bg-[#EBECF0] rounded-[3px] border border-transparent hover:border-[#DFE1E6] transition-all group-data-[collapsible=icon]:justify-center">
                        <div className="flex items-center space-x-2.5 truncate">
                          <div className="w-8 h-8 bg-[#0052CC] text-white font-bold text-sm rounded-[3px] flex items-center justify-center shadow-sm flex-shrink-0">
                            {activeProject.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col text-left truncate group-data-[collapsible=icon]:hidden">
                            <span className="text-xs font-bold text-[#172B4D] truncate">
                              {activeProject.name}
                            </span>
                            <span className="text-[10px] text-[#5E6C84] uppercase tracking-wider font-semibold">
                              {activeProject.projectType || "General Project"}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-[#5E6C84] flex-shrink-0 ml-1.5 group-data-[collapsible=icon]:hidden" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent className="w-56 bg-white border border-[#DFE1E6] shadow-md rounded-[3px]" align="start">
                      <div className="px-2 py-1.5 text-[9px] font-bold text-[#5E6C84] uppercase tracking-wider border-b border-[#F4F5F7] mb-1 select-none">
                        Switch Project
                      </div>
                      
                      {projects.map((p) => (
                        <DropdownMenuItem
                          key={p.id}
                          onClick={() => handleProjectChange(p)}
                          style={{ color: "#172B4D" }}
                          className={`text-xs px-2.5 py-2 rounded-[2px] flex items-center justify-between cursor-pointer hover:bg-[#F4F5F7] ${
                            p.id === activeProject.id ? "bg-[#DEEBFF] text-[#0747A6] font-semibold" : ""
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          {p.id === activeProject.id && (
                            <Check className="w-3.5 h-3.5 text-[#0052CC]" />
                          )}
                        </DropdownMenuItem>
                      ))}
                      
                      <div className="border-t border-[#F4F5F7] mt-1.5 pt-1">
                        <DropdownMenuItem
                          onClick={() => setShowCreateModal(true)}
                          className="text-xs text-[#0052CC] font-semibold px-2.5 py-2 rounded-[2px] cursor-pointer hover:bg-[#F4F5F7] flex items-center space-x-2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create New Project</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="text-center py-2 text-xs text-[#5E6C84] italic">
                    Select a project
                  </div>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          {/* Sidebar Content */}
          <SidebarContent className="p-3 group-data-[collapsible=icon]:p-2 space-y-6">
            
            {/* Global navigation shortcuts */}
            <div>
              <div className="space-y-0.5">
                <SidebarMenuButton
                  onClick={() => router.push("/projects")}
                  className={`w-full flex items-center gap-x-2.5 px-2 py-1.5 rounded-[3px] text-left text-xs group-data-[collapsible=icon]:justify-center ${
                    pathname === "/projects"
                      ? "bg-[#DEEBFF] text-[#0747A6] font-semibold"
                      : "text-[#172B4D] hover:bg-[#EBECF0]"
                  }`}
                >
                  <Home className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">All Projects</span>
                </SidebarMenuButton>
                
                {activeProject && (
                  <SidebarMenuButton
                    onClick={() => router.push(`/projects/${projectId}`)}
                    className={`w-full flex items-center gap-x-2.5 px-2 py-1.5 rounded-[3px] text-left text-xs group-data-[collapsible=icon]:justify-center ${
                      pathname === `/projects/${projectId}`
                        ? "bg-[#DEEBFF] text-[#0747A6] font-semibold"
                        : "text-[#172B4D] hover:bg-[#EBECF0]"
                    }`}
                  >
                    <KanbanSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Kanban Board</span>
                  </SidebarMenuButton>
                )}
              </div>
            </div>

          </SidebarContent>

          {/* Sidebar Footer: User profile & status */}
          <SidebarFooter className="border-t border-[#DFE1E6] p-3 group-data-[collapsible=icon]:p-2 flex flex-row items-center gap-x-2 bg-[#F4F5F7] group-data-[collapsible=icon]:justify-center">
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
                <span className="inline-flex items-center text-[9px] font-mono text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded cursor-help" title={profileError}>
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

        {/* ── MAIN LAYOUT FRAME ─────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          
          {/* Main Topbar Header */}
          <header className="flex items-center justify-between px-6 border-b border-[#DFE1E6] h-[64px] min-h-[64px] bg-white select-none">
            {/* Left side: Trigger + Breadcrumbs */}
            <div className="flex items-center space-x-3">
              <SidebarTrigger className="text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#EBECF0] h-8 w-8 rounded-[3px]" />
              {activeProject && (
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1.5 text-xs text-[#5E6C84]">
                    <Link href="/projects" className="hover:text-[#172B4D] hover:underline cursor-pointer">
                      Projects
                    </Link>
                    <span>/</span>
                    <span className="text-[#172B4D] font-semibold">{activeProject.name}</span>
                  </div>
                  <h1 className="text-lg font-bold text-[#172B4D] tracking-tight mt-0.5">
                    {activeProject.name}
                  </h1>
                </div>
              )}
            </div>

            {/* Right side: Search queries input & Profile triggers */}
            <div className="flex items-center space-x-4">
              {activeProject && setSearchQuery && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5E6C84]" />
                  <input
                    type="text"
                    placeholder="Search details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 pl-8 pr-3 py-1.5 text-xs bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] focus:outline-none focus:bg-white focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all"
                  />
                </div>
              )}
              <UserButton />
            </div>
          </header>

          {/* Reusable warning banner if project is inactive */}
          {projectDetails?.status === "INACTIVE" && (
            <InformationBanner
              variant="warning"
              message="This project is Inactive. Boards and settings are currently in view-only mode."
              className="border-x-0 border-t-0 border-b rounded-none px-6 py-2 flex-shrink-0"
            />
          )}

          {/* Child Viewport Slot */}
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>
        </main>

        {/* ── COMPONENT DIALOGS ─────────────────────────────────────────── */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateSuccess={async (newProj) => {
            await fetchProjects();
            router.push(`/projects/${newProj.id}`);
          }}
        />

        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          project={activeProject}
          onUpdateSuccess={async () => {
            await fetchProjects();
            await fetchProjectDetails();
          }}
        />

        {/* Deactivate/Activate Project Alert Dialog */}
        <CustomAlertDialog
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={projectDetails?.status === "INACTIVE" ? "Activate Project?" : "Deactivate Project?"}
          confirmText={projectDetails?.status === "INACTIVE" ? "Activate Project" : "Deactivate Project"}
          variant={projectDetails?.status === "INACTIVE" ? "default" : "danger"}
          isLoading={isDeletingProj}
          description={
            <div className="space-y-3 text-left">
              <p>
                {projectDetails?.status === "INACTIVE" ? (
                  <>
                    Are you sure you want to activate the project{" "}
                    <strong className="text-[#172B4D]">"{activeProject?.name}"</strong>? This will enable project modifications and team collaborations.
                  </>
                ) : (
                  <>
                    Are you sure you want to deactivate the project{" "}
                    <strong className="text-[#172B4D]">"{activeProject?.name}"</strong>? This will switch the project and all boards inside it to view-only mode.
                  </>
                )}
              </p>
            </div>
          }
          onConfirm={async () => {
            try {
              setIsDeletingProj(true);
              const token = await getToken();
              if (!token) return;
              const newStatus = projectDetails?.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${activeProject.id}`,
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
                await fetchProjectDetails();
                await fetchProjects();
              } else {
                const err = await res.json();
                alert(err.error || "Failed to update project status");
              }
            } catch (err) {
              console.error("Error updating project status:", err);
            } finally {
              setIsDeletingProj(false);
            }
          }}
        />

      </div>
    </SidebarProvider>
  );
}
