"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Trash,
  Edit2,
  Briefcase,
  LogOut,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { ProjectProvider } from "../../components/projects/ProjectContext";
import ProjectLayoutShell from "../../components/projects/ProjectLayoutShell";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import EditProjectModal from "../../components/projects/EditProjectModal";
import InviteMembersModal from "../../components/projects/InviteMembersModal";
import CustomAlertDialog from "../../components/shared/CustomAlertDialog";
import EmptyState from "../../components/shared/EmptyState";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

export default function ProjectsDashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Projects states
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchProjects();
    }
  }, [user, authLoading]);

  // Filter projects based on search query
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.projectType &&
        p.projectType.toLowerCase().includes(searchQuery.toLowerCase())),
  );

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
    <ProjectProvider>
      <ProjectLayoutShell>
        <div className="flex-grow w-full px-4 md:px-8 py-10 flex flex-col bg-[#FAFBFC]">
          {/* Title and Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#172B4D]">
                Projects
              </h1>
              <p className="text-xs text-[#5E6C84] mt-1 leading-relaxed">
                Select or create a project to view active boards, sprints, and task timelines.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowInviteModal(true)}
                disabled={projects.length === 0}
                variant="outline"
                className="border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7] text-xs font-semibold rounded-[3px] h-8 px-3 shadow-none"
              >
                Invite Team Members
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-[3px] h-8 px-3 shadow-none"
              >
                Create Project
              </Button>
            </div>
          </div>

          <div className="mb-6">
            {projects.length > 0 && !loading && (
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6C84] z-10 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 h-9 text-xs bg-white border-[#DFE1E6] rounded-[3px] focus-visible:ring-1 focus-visible:ring-[#0052CC] transition-all shadow-xs"
                />
              </div>
            )}
          </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 space-y-4 min-h-[170px]"
              >
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-9 h-9 bg-gray-200 rounded-[3px]" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4 bg-gray-200" />
                    <Skeleton className="h-3 w-1/3 bg-gray-200" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full bg-gray-200" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-3 w-1/4 bg-gray-200" />
                  <Skeleton className="h-3 w-1/4 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty State for No Projects */
          <div className="flex-grow flex items-center justify-center py-12">
            <EmptyState
              title="No projects found"
              description="Get started by creating your first project workspace for your team."
              actionLabel="Create Project"
              onAction={() => setShowCreateModal(true)}
            />
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Empty State for Search No Results */
          <div className="flex-grow flex items-center justify-center py-12">
            <EmptyState
              title={`No projects matching "${searchQuery}"`}
              description="Check your spelling or try searching with a different term."
              icon={<Search className="w-5 h-5 text-[#5E6C84]" />}
              iconBgClass="bg-[#F4F5F7]"
              actionLabel="Clear search"
              onAction={() => setSearchQuery("")}
            />
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/projects/${p.id}`)}
                className="bg-white border border-[#DFE1E6] hover:border-[#0052CC] rounded-[4px] p-5 flex flex-col justify-between cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md group relative"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-[#0052CC] text-white font-bold text-sm rounded-[3px] flex items-center justify-center shadow-sm">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#172B4D] group-hover:text-[#0052CC] transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                        <p className="text-[10px] text-[#5E6C84] uppercase tracking-wider font-semibold">
                          {p.projectType || "Software Project"}
                        </p>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    {(p.role === "OWNER" || p.role === "ADMIN") && (
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setSelectedProject(p);
                            setShowEditModal(true);
                          }}
                          title="Edit Project"
                          className="h-7 w-7 p-1 text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#F4F5F7] rounded-[2px]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        {p.status === "INACTIVE" ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              setSelectedProject(p);
                              setShowDeleteModal(true);
                            }}
                            title="Reactivate Project"
                            className="h-7 w-7 p-1 text-[#5E6C84] hover:text-emerald-600 hover:bg-emerald-50 rounded-[2px]"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              setSelectedProject(p);
                              setShowDeleteModal(true);
                            }}
                            title="Deactivate Project"
                            className="h-7 w-7 p-1 text-[#5E6C84] hover:text-[#DE350B] hover:bg-red-50 rounded-[2px]"
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#5E6C84] mt-3 line-clamp-2 leading-relaxed">
                    {p.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#F4F5F7] text-[11px] text-[#5E6C84]">
                  <span className="font-medium">
                    {p.totalTasks ?? 0} {p.totalTasks === 1 ? "Task" : "Tasks"}
                  </span>
                  <div className="flex items-center space-x-2">
                    {p.status === "INACTIVE" ? (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200/80 px-2 py-0.5 rounded-[2px] font-bold text-[10px] uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Inactive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-[2px] font-bold text-[10px] uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    )}
                    <span className="bg-[#F4F5F7] text-[#172B4D] px-2 py-0.5 rounded-[2px] font-semibold text-[10px]">
                      {p.role || "MEMBER"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      {/* ── Dialog Modals ──────────────────────────────────────────────── */}
      <InviteMembersModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        projects={projects}
      />

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSuccess={(newProj) => {
          fetchProjects();
          router.push(`/projects/${newProj.id}`);
        }}
      />

      {selectedProject && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
          onUpdateSuccess={() => {
            fetchProjects();
          }}
        />
      )}

      {selectedProject && (
        <CustomAlertDialog
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProject(null);
          }}
          title={selectedProject.status === "INACTIVE" ? "Reactivate Project" : "Deactivate Project"}
          confirmText={selectedProject.status === "INACTIVE" ? "Reactivate" : "Deactivate"}
          variant={selectedProject.status === "INACTIVE" ? "default" : "danger"}
          isLoading={isDeleting}
          description={
            <span>
              Are you sure you want to {selectedProject.status === "INACTIVE" ? "reactivate" : "deactivate"} project{" "}
              <strong>"{selectedProject.name}"</strong>?
            </span>
          }
          onConfirm={async () => {
            try {
              setIsDeleting(true);
              const nextStatus = selectedProject.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
              await api.patch(`/projects/${selectedProject.id}`, {
                status: nextStatus,
              });
              setShowDeleteModal(false);
              setSelectedProject(null);
              fetchProjects();
            } catch (err: any) {
              alert(
                err?.response?.data?.error || "Failed to update project status.",
              );
            } finally {
              setIsDeleting(false);
            }
          }}
        />
      )}
        </div>
      </ProjectLayoutShell>
    </ProjectProvider>
  );
}
