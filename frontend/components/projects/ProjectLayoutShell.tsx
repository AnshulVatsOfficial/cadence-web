"use client";

import React, { useState } from "react";
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
  LogOut,
  User as UserIcon,
  Mail,
  CreditCard,
  Sparkles,
  FileText,
} from "lucide-react";
import ProjectNotesModal from "./ProjectNotesModal";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { useProject } from "./ProjectContext";
import CreateProjectModal from "./CreateProjectModal";
import EditProjectModal from "./EditProjectModal";
import AICopilotChatDrawer from "./AICopilotChatDrawer";
import CustomAlertDialog from "../shared/CustomAlertDialog";
import InformationBanner from "../shared/InformationBanner";
import SubscriptionUpgradeFlow from "../billing/SubscriptionUpgradeFlow";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  const { user, logout } = useAuth();
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
    showUpgradeModal,
    setShowUpgradeModal,
    upgradeAlertMessage,
  } = useProject();

  const [isDeletingProj, setIsDeletingProj] = useState(false);
  const [pendingInviteCount, setPendingInviteCount] = useState(0);
  const [showCopilotDrawer, setShowCopilotDrawer] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  React.useEffect(() => {
    if (user) {
      api
        .get("/invitations")
        .then((res) => {
          const received = res.data.received || [];
          const pending = received.filter((i: any) => i.status === "PENDING");
          setPendingInviteCount(pending.length);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleProjectChange = (proj: any) => {
    router.push(`/projects/${proj.id}`);
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "US";
  };

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="flex items-center space-x-2 p-1 h-auto w-auto rounded-full hover:bg-ds-bg-neutral transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <div className="w-8 h-8 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {getInitials(user?.name, user?.email)}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border border-[#DFE1E6] shadow-md rounded-[3px]" align="end">
        <div className="px-3 py-2 border-b border-[#DFE1E6]">
          <p className="text-xs font-bold text-[#172B4D] truncate">
            {user?.name || "User"}
          </p>
          {user?.email && !(!user.email.includes("@") && user.email.length > 20) && (
            <p className="text-[11px] text-[#5E6C84] truncate">{user.email}</p>
          )}
        </div>
        <DropdownMenuItem
          onClick={logout}
          className="text-xs text-red-600 font-semibold px-3 py-2 cursor-pointer hover:bg-red-50 flex items-center space-x-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
                ) : (
                  <div className="flex items-center gap-1 w-full group-data-[collapsible=icon]:justify-center">
                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuButton size="lg" className="w-full flex items-center justify-between p-2 hover:bg-[#EBECF0] rounded-[3px] border border-transparent hover:border-[#DFE1E6] transition-all min-w-0">
                          <div className="flex items-center space-x-2.5 truncate">
                            {activeProject ? (
                              <>
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
                              </>
                            ) : (
                              <>
                                <div className="w-8 h-8 bg-[#0052CC] text-white font-bold text-base rounded-[3px] flex items-center justify-center shadow-sm flex-shrink-0">
                                  C
                                </div>
                                <div className="flex flex-col text-left truncate group-data-[collapsible=icon]:hidden">
                                  <span className="text-sm font-bold text-[#172B4D] truncate">
                                    Cadence
                                  </span>
                                  <span className="text-[10px] text-[#5E6C84] uppercase tracking-wider font-semibold">
                                    Select a Project
                                  </span>
                                </div>
                              </>
                            )}
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
                              activeProject && p.id === activeProject.id ? "bg-[#DEEBFF] text-[#0747A6] font-semibold" : ""
                            }`}
                          >
                            <span className="truncate">{p.name}</span>
                            {activeProject && p.id === activeProject.id && (
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
                    </div>
                    
                    <SidebarTrigger className="text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#EBECF0] h-8 w-8 rounded-[3px] flex-shrink-0 hidden md:flex" />
                  </div>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          {/* Sidebar Content */}
          <SidebarContent className="p-3 group-data-[collapsible=icon]:p-2 space-y-6">
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

              <SidebarMenuButton
                onClick={() => router.push("/projects/invitations")}
                className={`w-full flex items-center justify-between gap-x-2.5 px-2 py-1.5 rounded-[3px] text-left text-xs group-data-[collapsible=icon]:justify-center ${
                  pathname === "/projects/invitations"
                    ? "bg-[#DEEBFF] text-[#0747A6] font-semibold"
                    : "text-[#172B4D] hover:bg-[#EBECF0]"
                }`}
              >
                <div className="flex items-center gap-x-2.5 min-w-0">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">Invitations</span>
                </div>
                {pendingInviteCount > 0 && (
                  <span className="bg-[#0052CC] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 group-data-[collapsible=icon]:hidden">
                    {pendingInviteCount}
                  </span>
                )}
              </SidebarMenuButton>

              <SidebarMenuButton
                onClick={() => router.push("/projects/billing")}
                className={`w-full flex items-center gap-x-2.5 px-2 py-1.5 rounded-[3px] text-left text-xs group-data-[collapsible=icon]:justify-center ${
                  pathname === "/projects/billing"
                    ? "bg-[#DEEBFF] text-[#0747A6] font-semibold"
                    : "text-[#172B4D] hover:bg-[#EBECF0]"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate group-data-[collapsible=icon]:hidden">Billing</span>
              </SidebarMenuButton>
              
              {activeProject && (
                <SidebarMenuButton
                  onClick={() => router.push(`/projects/${activeProject.id}`)}
                  className={`w-full flex items-center gap-x-2.5 px-2 py-1.5 rounded-[3px] text-left text-xs group-data-[collapsible=icon]:justify-center ${
                    pathname === `/projects/${activeProject.id}`
                      ? "bg-[#DEEBFF] text-[#0747A6] font-semibold"
                      : "text-[#172B4D] hover:bg-[#EBECF0]"
                  }`}
                >
                  <KanbanSquare className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">Board</span>
                </SidebarMenuButton>
              )}
            </div>
          </SidebarContent>

          {/* Sidebar Footer: User profile & status */}
          <SidebarFooter className="border-t border-[#DFE1E6] p-3 group-data-[collapsible=icon]:p-2 flex flex-row items-center gap-x-2 bg-[#F4F5F7] group-data-[collapsible=icon]:justify-center">
            <UserDropdown />
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-xs font-semibold text-[#172B4D] truncate">
                {user?.name || user?.email || "User"}
              </p>
              {backendDbId ? (
                <span className="inline-flex items-center text-[9px] font-mono text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  ✓ Authenticated
                </span>
              ) : profileError ? (
                <span className="inline-flex items-center text-[9px] font-mono text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded cursor-help" title={profileError}>
                  ✗ Error
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
            <div className="flex items-center space-x-3">

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

            <div className="flex items-center space-x-3">
              {activeProject && (
                <Button
                  onClick={() => setShowNotesModal(true)}
                  variant="outline"
                  className="h-8 border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] text-xs font-semibold px-3 rounded-[3px] shadow-sm flex items-center space-x-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-[#0052CC]" />
                  <span>Project Notes</span>
                </Button>
              )}
              {activeProject && (
                <Button
                  onClick={() => setShowCopilotDrawer(true)}
                  className="h-8 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold px-3 rounded-[3px] shadow-sm flex items-center space-x-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>AI Copilot</span>
                </Button>
              )}
              {activeProject && setSearchQuery && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5E6C84] z-10 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 pl-8 pr-3 h-8 text-xs bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#0052CC] transition-all"
                  />
                </div>
              )}
              <UserDropdown />
            </div>
          </header>

          {projectDetails?.status === "INACTIVE" && (
            <InformationBanner
              variant="warning"
              message="This project is Inactive. Boards and settings are currently in view-only mode."
              className="border-x-0 border-t-0 border-b rounded-none px-6 py-2 flex-shrink-0"
            />
          )}

          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>
        </main>

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
              const newStatus = projectDetails?.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
              await api.patch(`/projects/${activeProject.id}`, { status: newStatus });
              setShowDeleteModal(false);
              await fetchProjectDetails();
              await fetchProjects();
            } catch (err: any) {
              alert(err?.response?.data?.error || "Failed to update project status");
            } finally {
              setIsDeletingProj(false);
            }
          }}
        />

        <SubscriptionUpgradeFlow
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          alertMessage={upgradeAlertMessage}
        />

        <AICopilotChatDrawer
          isOpen={showCopilotDrawer}
          onClose={() => setShowCopilotDrawer(false)}
        />

        {activeProject && (
          <ProjectNotesModal
            isOpen={showNotesModal}
            onClose={() => setShowNotesModal(false)}
            projectId={activeProject.id}
          />
        )}
      </div>
    </SidebarProvider>
  );
}
