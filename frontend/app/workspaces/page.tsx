"use client";

import React, { useState, useEffect } from "react";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Trash,
  Edit2,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import CreateWorkspaceModal from "../../components/workspaces/CreateWorkspaceModal";
import EditWorkspaceModal from "../../components/workspaces/EditWorkspaceModal";
import CustomAlertDialog from "../../components/shared/CustomAlertDialog";
import EmptyState from "../../components/shared/EmptyState";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

export default function WorkspacesDashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  // Workspaces states
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Workspaces
  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (err) {
      console.error("Error fetching workspaces:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchWorkspaces();
    }
  }, [isLoaded, user]);

  // Filter workspaces based on search query
  const filteredWorkspaces = workspaces.filter(
    (ws) =>
      ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ws.workspaceType &&
        ws.workspaceType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#172B4D] font-sans flex flex-col">
      {/* ── Responsive Global Header ─────────────────────────────────────── */}
      <header className="h-[64px] min-h-[64px] px-4 md:px-8 bg-white border-b border-[#DFE1E6] flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-8 h-8 bg-[#0052CC] rounded-[3px] flex items-center justify-center font-bold text-white text-base shadow-sm flex-shrink-0">
            C
          </div>
          <span className="text-sm md:text-base font-bold tracking-tight text-[#172B4D]">
            Cadence
          </span>
        </div>
        <div className="flex items-center space-x-3 md:space-x-4">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-[3px] h-8 px-3 shadow-none"
          >
            Create Workspace
          </Button>
          <UserButton />
        </div>
      </header>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <main className="flex-grow w-full px-4 md:px-8 py-10 flex flex-col">
        {/* Title and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#172B4D]">
              Workspaces
            </h1>
            <p className="text-xs text-[#5E6C84] mt-1 leading-relaxed">
              Select or create a workspace to view active boards, sprints, and project timelines.
            </p>
          </div>
          {workspaces.length > 0 && !loading && (
            <div className="relative w-full md:w-72">
              <Search className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6C84]" />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#DFE1E6] rounded-[3px] focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all shadow-sm"
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
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full bg-gray-100" />
                  <Skeleton className="h-3.5 w-5/6 bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          /* Empty Onboarding State */
          <EmptyState
            title="Welcome to Cadence"
            description="Organize projects, boards, and team workflows in dedicated workspaces. Get started by creating your very first workspace."
            icon={<Briefcase className="w-6 h-6" />}
            action={
              <Button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-[3px] py-2"
              >
                Create Workspace
              </Button>
            }
          />
        ) : (
          /* Grid of Workspaces */
          filteredWorkspaces.length === 0 ? (
            <EmptyState
              title="No matching workspaces found"
              description="We couldn't find any workspaces matching your search query. Try checking the spelling or clear the search input."
              icon={<span className="text-lg">🔍</span>}
              iconBgClass="bg-[#F4F5F7] text-[#5E6C84]"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => router.push(`/workspaces/${ws.id}`)}
                  className="bg-white border border-[#DFE1E6] rounded-[4px] p-5 hover:border-[#0052CC] hover:shadow-md transition-all flex flex-col justify-between min-h-[170px] relative group cursor-pointer"
                >
                  {/* Top: Info */}
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 bg-[#0052CC] text-white font-bold text-sm rounded-[3px] flex items-center justify-center shadow-sm">
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Owner actions bar: Visible on hover */}
                      {ws.role === "OWNER" && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1.5 absolute top-4 right-4 bg-white pl-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWorkspace(ws);
                                    setShowEditModal(true);
                                  }}
                                  disabled={ws.status === "INACTIVE"}
                                  className={`p-1 rounded-[3px] transition-colors ${
                                    ws.status === "INACTIVE"
                                      ? "opacity-35 cursor-not-allowed text-[#5E6C84]"
                                      : "p-1 hover:bg-[#EBECF0] text-[#5E6C84] hover:text-[#172B4D]"
                                  }`}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-foreground text-background">
                                {ws.status === "INACTIVE"
                                  ? "Activate workspace to edit settings"
                                  : "Edit settings"}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWorkspace(ws);
                                    setShowDeleteModal(true);
                                  }}
                                  className={`p-1 rounded-[3px] transition-colors ${
                                    ws.status === "INACTIVE"
                                      ? "hover:bg-green-50 text-green-600 hover:text-green-800"
                                      : "hover:bg-red-50 text-red-500 hover:text-red-700"
                                  }`}
                                >
                                  {ws.status === "INACTIVE" ? (
                                    <Plus className="w-3.5 h-3.5" />
                                  ) : (
                                    <Trash className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-foreground text-background">
                                {ws.status === "INACTIVE"
                                  ? "Activate workspace"
                                  : "Deactivate workspace"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[#172B4D] mt-3 group-hover:text-[#0052CC] transition-colors truncate">
                      {ws.name}
                    </h3>
                    <p className="text-[10px] text-[#5E6C84] mt-0.5 font-normal uppercase tracking-wider">
                      {ws.workspaceType || "General Workspace"}
                    </p>
                    <p className="text-xs text-[#5E6C84] mt-3 line-clamp-2 leading-relaxed">
                      {ws.description || "No description provided."}
                    </p>
                  </div>

                  {/* Bottom: Enter action */}
                  <div className="border-t border-[#F4F5F7] mt-4 pt-3 flex items-center justify-between">
                    <span
                      className="text-xs text-[#0052CC] font-semibold hover:underline hover:text-[#0747A6]"
                    >
                      Enter Workspace
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {ws.status === "INACTIVE" && (
                        <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                          INACTIVE
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-[#5E6C84] bg-[#FAFBFC] px-1.5 py-0.5 rounded border border-[#DFE1E6]">
                        {ws.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* ── MODALS (Modular Shared Components) ─────────────────────────────── */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSuccess={(newWs: any) => {
          fetchWorkspaces();
          router.push(`/workspaces/${newWs.id}`);
        }}
      />

      <EditWorkspaceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedWorkspace(null);
        }}
        workspace={selectedWorkspace}
        onUpdateSuccess={() => {
          fetchWorkspaces();
        }}
      />

      <CustomAlertDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedWorkspace(null);
        }}
        title={selectedWorkspace?.status === "INACTIVE" ? "Activate Workspace?" : "Deactivate Workspace?"}
        confirmText={selectedWorkspace?.status === "INACTIVE" ? "Activate Workspace" : "Deactivate Workspace"}
        variant={selectedWorkspace?.status === "INACTIVE" ? "default" : "danger"}
        isLoading={isDeleting}
        description={
          <div className="space-y-3 text-left">
            <p>
              {selectedWorkspace?.status === "INACTIVE" ? (
                <>
                  Are you sure you want to activate the workspace{" "}
                  <strong className="text-[#172B4D]">"{selectedWorkspace?.name}"</strong>? This will restore edit permissions and enable project modifications.
                </>
              ) : (
                <>
                  Are you sure you want to deactivate the workspace{" "}
                  <strong className="text-[#172B4D]">"{selectedWorkspace?.name}"</strong>? This will switch the workspace and all projects inside it to view-only mode.
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
            const newStatus = selectedWorkspace.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces/${selectedWorkspace.id}`,
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
              setSelectedWorkspace(null);
              fetchWorkspaces();
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
  );
}
