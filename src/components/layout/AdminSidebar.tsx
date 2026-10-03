"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Gauge,
  LayoutGrid,
  Image as ImageIcon,
  FileText,
  User,
  Settings,
  Inbox,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";

export function AdminSidebar() {
  const pathname = usePathname();
  const { inquiries, profile } = usePortfolio();

  const unreadCount = inquiries.filter((inq) => inq.status === "new").length;

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: Gauge, exact: true },
    { label: "Projects", href: "/admin/projects", icon: LayoutGrid },
    { label: "Media Library", href: "/admin/media", icon: ImageIcon },
    { label: "Resume / CV", href: "/admin/resume", icon: FileText },
    { label: "Profile", href: "/admin/profile", icon: User },
    { label: "Inbox", href: "/admin/inbox", icon: Inbox, count: unreadCount },
    { label: "Site Settings", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout error:", e);
    }
  };

  return (
    <aside className="w-60 shrink-0 bg-[var(--surface)] border-r border-[var(--border)] min-h-screen flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[var(--border)] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              R
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[var(--text)] tracking-tight">
                Portfolio CMS
              </span>
              <span className="text-[10px] font-mono-code text-[var(--text-muted)]">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-3 flex flex-col gap-1">
          <span className="px-3 py-2 text-[11px] font-mono-code uppercase tracking-wider text-[var(--text-muted)] font-medium">
            Management
          </span>
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-ring ${
                  active
                    ? "bg-[var(--primary)] text-white shadow-xs font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 stroke-[1.75]" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono-code font-bold ${
                      active
                        ? "bg-white text-[var(--primary)]"
                        : "bg-[var(--primary)] text-white"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Quick Links */}
      <div className="p-3 border-t border-[var(--border)] flex flex-col gap-2.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>View Public Site</span>
          </span>
          <span className="text-[10px] font-mono-code">/</span>
        </Link>

        {/* Profile Card */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] min-w-0">
          <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0 border border-[var(--border)]">
            <Image
              src={profile.photo || "/images/avatar-56586a.png"}
              alt={profile.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[var(--text)] truncate">
              {profile.name}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] truncate">
              Logged in as Admin
            </span>
          </div>
        </div>

        {/* Full-width Logout Button */}
        <Link
          href="/admin/login"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-[var(--danger)] bg-[var(--danger)]/10 hover:bg-[var(--danger)] hover:text-white border border-[var(--danger)]/20 transition-all duration-150 group shadow-xs focus-ring"
          title="Sign Out / Logout from CMS"
          aria-label="Sign Out / Logout"
        >
          <LogOut className="w-3.5 h-3.5 stroke-[2] transition-transform group-hover:-translate-x-0.5" />
          <span>Sign Out / Logout</span>
        </Link>
      </div>
    </aside>
  );
}
