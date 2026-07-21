"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";

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

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
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
      const token = await getToken();
      if (!token) return;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setProjects(data);

        const currentProj = data.find((p: any) => p.id === projectId);
        if (currentProj) {
          setActiveProject(currentProj);
        }
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, [projectId, getToken]);

  // Fetch project details (status, role, tasks, etc)
  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setProjectDetails(data);
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  }, [projectId, getToken]);

  // Sync profile & load projects
  useEffect(() => {
    if (!isLoaded || !user) return;
    (async () => {
      try {
        setLoadingProjects(true);
        const token = await getToken();
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
          const err = await res.json();
          setProfileError(err.error ?? `HTTP ${res.status}`);
          return;
        }

        const { user: dbUser } = await res.json();
        setBackendDbId(dbUser.id);
        
        // Parallel fetch projects list and current project details
        await Promise.all([fetchProjects(), fetchProjectDetails()]);
      } catch (e: any) {
        setProfileError(e.message);
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, [isLoaded, user, getToken, fetchProjects, fetchProjectDetails]);

  // Fetch details if projectId changes
  useEffect(() => {
    if (projectId && backendDbId) {
      fetchProjectDetails();
      fetchProjects();
    }
  }, [projectId, backendDbId, fetchProjectDetails, fetchProjects]);

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
