"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Pencil,
  Eye,
  Trash2,
  Star,
  GripVertical,
  LayoutGrid,
} from "lucide-react";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePortfolio } from "@/context/PortfolioContext";
import { Project } from "@/types";

export default function AdminProjectsPage() {
  const { projects, deleteProject, saveProject } = usePortfolio();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (search.trim() !== "") {
        const q = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [projects, statusFilter, categoryFilter, search]);

  const toggleFeatured = (project: Project) => {
    saveProject({
      ...project,
      featured: !project.featured,
    });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteProject(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title="Projects"
        subtitle="Manage case studies, drafts, featured ordering, and tech stacks"
        action={
          <Button
            variant="primary"
            size="sm"
            href="/admin/projects/new"
            icon={<Plus className="w-3.5 h-3.5 stroke-[1.75]" />}
          >
            New Project
          </Button>
        }
      />

      <div className="p-6 sm:p-8 flex flex-col gap-6 max-w-7xl">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.75]" />
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus-ring"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              aria-label="Filter by publication status"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="fullstack">Fullstack</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="iot">IoT & Hardware</option>
            </select>
          </div>
        </div>

        {/* Projects Data Table (Figma #2:1387) */}
        {filteredProjects.length > 0 ? (
          <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] font-mono-code uppercase text-[11px] border-b border-[var(--border)] select-none">
                <tr>
                  <th className="py-3 px-3 w-8"></th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4 hidden md:table-cell">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Year</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[var(--surface-2)] transition-colors group"
                  >
                    {/* Drag Handle */}
                    <td className="py-3 px-3 text-[var(--text-muted)] cursor-grab">
                      <GripVertical className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                    </td>

                    {/* Project Cover & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-7 relative rounded overflow-hidden bg-[var(--border)] shrink-0">
                          <Image
                            src={p.coverImage}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/admin/projects/${p.id}`}
                            className="font-semibold text-[var(--text)] hover:text-[var(--primary)] transition-colors truncate max-w-xs sm:max-w-sm"
                          >
                            {p.title}
                          </Link>
                          <span className="font-mono-code text-[11px] text-[var(--text-muted)] truncate">
                            /{p.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 hidden md:table-cell text-[var(--text-muted)] font-mono-code capitalize">
                      {p.category}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>

                    {/* Featured Star Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleFeatured(p)}
                        className={`p-1.5 rounded transition-colors focus-ring cursor-pointer ${
                          p.featured
                            ? "text-amber-500 hover:text-amber-600"
                            : "text-[var(--text-muted)] hover:text-amber-500"
                        }`}
                        title={p.featured ? "Featured on Home" : "Not featured"}
                        aria-label="Toggle featured"
                      >
                        <Star
                          className={`w-4 h-4 stroke-[1.75] ${
                            p.featured ? "fill-amber-500" : ""
                          }`}
                        />
                      </button>
                    </td>

                    {/* Year */}
                    <td className="py-3 px-4 hidden sm:table-cell font-mono-code text-[var(--text-muted)]">
                      {p.year}
                    </td>

                    {/* Updated Date */}
                    <td className="py-3 px-4 hidden lg:table-cell font-mono-code text-[var(--text-muted)]">
                      {p.updatedAt}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          title="Edit Project"
                          aria-label="Edit project"
                        >
                          <Pencil className="w-3.5 h-3.5 stroke-[1.75]" />
                        </Link>

                        <Link
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                          title="View Live Page"
                          aria-label="View live page"
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[1.75]" />
                        </Link>

                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                          title="Delete Project"
                          aria-label="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<LayoutGrid className="w-6 h-6 stroke-[1.75]" />}
            title="No projects found"
            description="Try changing filters or add your first case study."
            actionText="Create Project"
            actionHref="/admin/projects/new"
          />
        )}
      </div>

      {/* Delete Confirmation Modal (Stitch Rule 4: destructive actions always danger + confirm Modal) */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Project"
        description={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete Project"
        confirmVariant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
