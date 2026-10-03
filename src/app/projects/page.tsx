import React from "react";
import { Metadata } from "next";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { ProjectsExplorer } from "@/components/sections/ProjectsExplorer";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A comprehensive showcase of production web applications, municipal platforms, IoT telematics systems, and developer utilities by Rangga Prasetya.",
};

export default async function ProjectsPage() {
  const projects = await db.getProjects({ status: "published" });

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1 flex flex-col items-center">
        <ProjectsExplorer initialProjects={projects} />
      </main>
      <Footer />
    </div>
  );
}
