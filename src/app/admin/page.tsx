"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutGrid,
  FilePen,
  Inbox,
  FileText,
  Plus,
  ArrowUpRight,
  Pencil,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { usePortfolio } from "@/context/PortfolioContext";

export default function AdminDashboardPage() {
  const { projects, inquiries, resumeSettings } = usePortfolio();

  const publishedCount = projects.filter((p) => p.status === "published").length;
  const draftCount = projects.filter((p) => p.status === "draft").length;
  const unreadInquiries = inquiries.filter((i) => i.status === "new").length;

  const recentProjects = projects.slice(0, 5);
  const recentInquiries = inquiries.slice(0, 4);

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title="Dashboard"
        subtitle="Overview of published case studies, content drafts, and inquiries"
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

      <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-7xl">
        {/* 4 Stat Cards (Figma #2:386) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Published */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-3">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="text-xs font-medium uppercase font-mono-code">
                Published
              </span>
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--success)]">
                <CheckCircle2 className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-display text-[var(--text)]">
                {publishedCount}
              </span>
              <span className="text-xs text-[var(--text-muted)]">live projects</span>
            </div>
          </div>

          {/* Card 2: Drafts */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-3">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="text-xs font-medium uppercase font-mono-code">
                Drafts
              </span>
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--warning)]">
                <FilePen className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-display text-[var(--text)]">
                {draftCount}
              </span>
              <span className="text-xs text-[var(--text-muted)]">unpublished</span>
            </div>
          </div>

          {/* Card 3: Inquiries */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-3">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="text-xs font-medium uppercase font-mono-code">
                New Inquiries
              </span>
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--primary)]">
                <Inbox className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-display text-[var(--text)]">
                {unreadInquiries}
              </span>
              <span className="text-xs text-[var(--text-muted)]">awaiting review</span>
            </div>
          </div>

          {/* Card 4: Resume */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-3">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="text-xs font-medium uppercase font-mono-code">
                CV Version
              </span>
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]">
                <FileText className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono-code text-[var(--text)]">
                {resumeSettings.versionLabel}
              </span>
              <span className="text-xs text-[var(--text-muted)] truncate">
                {resumeSettings.updatedAt}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Band */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
            <span className="font-mono-code uppercase">Quick Actions:</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              href="/admin/projects/new"
              icon={<Plus className="w-3.5 h-3.5 stroke-[1.75]" />}
            >
              Add Project
            </Button>
            <Button
              variant="secondary"
              size="sm"
              href="/admin/resume"
              icon={<FileText className="w-3.5 h-3.5 stroke-[1.75]" />}
            >
              Update Resume
            </Button>
            <Button
              variant="secondary"
              size="sm"
              href="/"
              external
              iconRight={<ArrowUpRight className="w-3.5 h-3.5 stroke-[1.75]" />}
            >
              View Public Site
            </Button>
          </div>
        </div>

        {/* Two-Column Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Projects Table (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text)] tracking-tight">
                Recent Projects
              </h2>
              <Link
                href="/admin/projects"
                className="text-xs font-medium text-[var(--primary)] hover:underline"
              >
                View all ({projects.length})
              </Link>
            </div>

            <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] font-mono-code uppercase text-[11px] border-b border-[var(--border)]">
                  <tr>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {recentProjects.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[var(--surface-2)] transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 relative rounded overflow-hidden bg-[var(--border)] shrink-0">
                            <Image
                              src={p.coverImage}
                              alt={p.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-[var(--text)] truncate max-w-xs">
                              {p.title}
                            </span>
                            <span className="font-mono-code text-[10px] text-[var(--text-muted)] truncate">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-[var(--text-muted)] font-mono-code capitalize">
                        {p.category}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/projects/${p.id}`}
                            className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                            title="Edit project"
                          >
                            <Pencil className="w-3.5 h-3.5 stroke-[1.75]" />
                          </Link>
                          <Link
                            href={`/projects/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                            title="Preview live"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[1.75]" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Latest Inquiries Widget (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text)] tracking-tight">
                Latest Messages
              </h2>
              <Link
                href="/admin/inbox"
                className="text-xs font-medium text-[var(--primary)] hover:underline"
              >
                Open Inbox
              </Link>
            </div>

            <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
              {recentInquiries.length > 0 ? (
                recentInquiries.map((inq) => (
                  <Link
                    key={inq.id}
                    href="/admin/inbox"
                    className="p-4 flex flex-col gap-1 hover:bg-[var(--surface-2)] transition-colors block"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text)] truncate">
                        {inq.name}
                      </span>
                      <StatusBadge status={inq.status} />
                    </div>
                    <span className="text-xs font-medium text-[var(--text)] truncate">
                      {inq.subject || inq.message}
                    </span>
                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {inq.message}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                  No inquiries received yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
