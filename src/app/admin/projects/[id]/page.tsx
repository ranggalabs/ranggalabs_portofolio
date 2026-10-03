"use client";

import React from "react";
import { useParams, notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { usePortfolio } from "@/context/PortfolioContext";

export default function EditProjectPage() {
  const params = useParams();
  const id = params?.id as string;
  const { getProjectById } = usePortfolio();

  const project = getProjectById(id);

  if (!project) {
    return (
      <div className="p-8 text-center text-sm text-[var(--text-muted)]">
        Project not found.
      </div>
    );
  }

  return <ProjectEditor initialData={project} isNew={false} />;
}
