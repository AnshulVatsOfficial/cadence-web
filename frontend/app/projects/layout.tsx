"use client";

import React from "react";
import { ProjectProvider } from "@/components/projects/ProjectContext";
import ProjectLayoutShell from "@/components/projects/ProjectLayoutShell";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      <ProjectLayoutShell>
        {children}
      </ProjectLayoutShell>
    </ProjectProvider>
  );
}
