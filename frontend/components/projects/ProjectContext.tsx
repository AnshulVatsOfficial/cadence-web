"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";

interface ProjectContextProps {
  projects: any[];
  activeProject: any | null;
  projectDetails: any | null;
  projectMembers: any[];
  loadingProjects: boolean;
  backendDbId: string | null;
  profileError: string | null;
  fetchProjects: () => Promise<void>;
  fetchProjectDetails: () => Promise<void>;
  fetchProjectMembers: () => Promise<void>;

  // Shared Modals triggers
  showCreateModal: boolean;
  setShowCreateModal: (open: boolean) => void;
  showEditModal: boolean;
  setShowEditModal: (open: boolean) => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (open: boolean) => void;

  triggerSubscriptionUpgrade: (message: string) => void;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (open: boolean) => void;
  upgradeAlertMessage: string;
  // Task Modals & Active Task state
  selectedTask: any | null;
  setSelectedTask: (task: any | null) => void;
  showCreateTaskModal: boolean;
  setShowCreateTaskModal: (open: boolean) => void;
  createTaskDefaultStageId: string | null;
  setCreateTaskDefaultStageId: (stageId: string | null) => void;
  createTaskDefaultParentId: string | null;
  setCreateTaskDefaultParentId: (parentId: string | null) => void;
  openCreateTaskModal: (options?: { stageId?: string; parentTaskId?: string }) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(
  undefined,
);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const params = useParams();

  const projectId = params?.projectId as string;

  const [projects, setProjects] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [projectDetails, setProjectDetails] = useState<any | null>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [backendDbId, setBackendDbId] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Modals States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeAlertMessage, setUpgradeAlertMessage] = useState("");

  const triggerSubscriptionUpgrade = useCallback((message: string) => {
    setUpgradeAlertMessage(message);
    setShowUpgradeModal(true);
  }, []);
  // Task Modals States
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [createTaskDefaultStageId, setCreateTaskDefaultStageId] = useState<string | null>(null);
  const [createTaskDefaultParentId, setCreateTaskDefaultParentId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all projects for user
  const fetchProjects = useCallback(async () => {
    try {
      if (!accessToken) return;
      const res = await api.get("/projects");
      const data = res.data;
      setProjects(data);

      const currentProj = data.find((p: any) => p.id === projectId);
      if (currentProj) {
        setActiveProject(currentProj);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, [projectId, accessToken]);

  // Fetch project details (status, role, tasks, etc)
  const fetchProjectDetails = useCallback(async () => {
    if (!projectId || !accessToken) return;
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProjectDetails(res.data);
      setActiveProject((prev: any) => (prev ? { ...prev, ...res.data } : res.data));

      // Keep selectedTask updated if it's currently open
      setSelectedTask((prevTask: any) => {
        if (!prevTask) return null;
        const updated = res.data.tasks?.find((t: any) => t.id === prevTask.id);
        return updated || prevTask;
      });
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  }, [projectId, accessToken]);

  // Fetch project members
  const fetchProjectMembers = useCallback(async () => {
    if (!projectId || !accessToken) return;
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      setProjectMembers(res.data);
    } catch (err) {
      console.error("Error fetching project members:", err);
    }
  }, [projectId, accessToken]);

  const openCreateTaskModal = useCallback(
    ({ stageId, parentTaskId }: { stageId?: string; parentTaskId?: string } = {}) => {
      setCreateTaskDefaultStageId(stageId || null);
      setCreateTaskDefaultParentId(parentTaskId || null);
      setShowCreateTaskModal(true);
    },
    [],
  );

  // Sync profile & load projects
  useEffect(() => {
    if (authLoading || !user || !accessToken) return;
    (async () => {
      try {
        setLoadingProjects(true);
        const res = await api.get("/users/profile");
        const dbUser = res.data.user;
        setBackendDbId(dbUser.id);
        setProfileError(null);

        await Promise.all([fetchProjects(), fetchProjectDetails(), fetchProjectMembers()]);
      } catch (e: any) {
        setProfileError(
          e?.response?.data?.error || e.message || "Profile fetch failed",
        );
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, [authLoading, user, accessToken]); // Only run on auth state ready

  // Fetch details if projectId changes
  useEffect(() => {
    if (projectId && backendDbId && accessToken) {
      fetchProjectDetails();
      fetchProjects();
      fetchProjectMembers();
    }
  }, [projectId, backendDbId, accessToken]);

  const hasOpenedFromUrl = React.useRef(false);

  // Handle URL taskId deep-linking
  useEffect(() => {
    if (projectDetails?.tasks && !hasOpenedFromUrl.current) {
      const urlParams = new URLSearchParams(window.location.search);
      const taskIdParam = urlParams.get("taskId");
      if (taskIdParam) {
        const taskToOpen = projectDetails.tasks.find((t: any) => t.id === taskIdParam);
        if (taskToOpen) {
          setSelectedTask(taskToOpen);
          hasOpenedFromUrl.current = true;
        }
      } else {
        hasOpenedFromUrl.current = true; // No taskId in URL, so don't try again
      }
    }
  }, [projectDetails?.tasks]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        projectDetails,
        projectMembers,
        loadingProjects,
        backendDbId,
        profileError,
        fetchProjects,
        fetchProjectDetails,
        fetchProjectMembers,
        showCreateModal,
        setShowCreateModal,
        showEditModal,
        setShowEditModal,
        showDeleteModal,
        setShowDeleteModal,
        showUpgradeModal,
        setShowUpgradeModal,
        upgradeAlertMessage,
        triggerSubscriptionUpgrade,
        selectedTask,
        setSelectedTask,
        showCreateTaskModal,
        setShowCreateTaskModal,
        createTaskDefaultStageId,
        setCreateTaskDefaultStageId,
        createTaskDefaultParentId,
        setCreateTaskDefaultParentId,
        openCreateTaskModal,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
