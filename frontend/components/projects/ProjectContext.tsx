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
  loadingProjects: boolean;
  backendDbId: string | null;
  profileError: string | null;
  fetchProjects: () => Promise<void>;
  fetchProjectDetails: () => Promise<void>;

  // Shared Modals triggers
  showCreateModal: boolean;
  setShowCreateModal: (open: boolean) => void;
  showEditModal: boolean;
  setShowEditModal: (open: boolean) => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (open: boolean) => void;
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
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [backendDbId, setBackendDbId] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Modals States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  }, [projectId, accessToken]);

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

        await Promise.all([fetchProjects(), fetchProjectDetails()]);
      } catch (e: any) {
        setProfileError(
          e?.response?.data?.error || e.message || "Profile fetch failed",
        );
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, [authLoading, user, accessToken, fetchProjects, fetchProjectDetails]);

  // Fetch details if projectId changes
  useEffect(() => {
    if (projectId && backendDbId && accessToken) {
      fetchProjectDetails();
      fetchProjects();
    }
  }, [projectId, backendDbId, accessToken, fetchProjectDetails, fetchProjects]);

  return (
    <ProjectContext.Provider
      value={{
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
