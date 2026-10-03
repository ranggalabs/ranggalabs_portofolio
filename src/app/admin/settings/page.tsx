"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, RotateCcw, Globe, Shield, AlertTriangle } from "lucide-react";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { usePortfolio } from "@/context/PortfolioContext";
import { SiteSettings } from "@/types";

export default function AdminSettingsPage() {
  const { siteSettings, updateSiteSettings, resetToDefault } = usePortfolio();

  const [formData, setFormData] = useState<SiteSettings>(siteSettings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(formData);
    setToastMessage("Site settings updated successfully!");
  };

  const handleResetConfirm = () => {
    resetToDefault();
    setShowResetModal(false);
    setToastMessage("Site state reset to original seed data.");
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="flex flex-col flex-1 pb-16">
      <AdminTopbar
        title="Site Settings"
        subtitle="Global SEO defaults, OpenGraph metadata, domain configuration, and credentials"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            icon={<Check className="w-3.5 h-3.5 stroke-[1.75]" />}
          >
            Save Settings
          </Button>
        }
      />

      {toastMessage && (
        <Toast
          type="success"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      <form onSubmit={handleSave} className="p-6 sm:p-8 max-w-4xl flex flex-col gap-6">
        {/* Domain & Brand settings */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Domain & Brand Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text)]">Site Name</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) =>
                  setFormData({ ...formData, siteName: e.target.value })
                }
                className="h-10 px-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text)]">Production URL</label>
              <input
                type="url"
                value={formData.siteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, siteUrl: e.target.value })
                }
                className="h-10 px-3 rounded-lg text-sm font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-[var(--text)]">
                Default Contact Form Recipient
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                className="h-10 px-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>
          </div>
        </div>

        {/* Global SEO Settings */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Default SEO & Social Card Metadata
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text)]">
              Default Meta Title
            </label>
            <input
              type="text"
              value={formData.defaultSeoTitle}
              onChange={(e) =>
                setFormData({ ...formData, defaultSeoTitle: e.target.value })
              }
              className="h-10 px-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text)]">
              Default Meta Description
            </label>
            <textarea
              rows={3}
              value={formData.defaultSeoDescription}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultSeoDescription: e.target.value,
                })
              }
              className="p-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border)]">
            <label className="text-xs font-medium text-[var(--text)]">
              Default OpenGraph / Twitter Card Image Path
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={formData.defaultOgImage}
                onChange={(e) =>
                  setFormData({ ...formData, defaultOgImage: e.target.value })
                }
                className="h-10 px-3 rounded-lg text-xs font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] flex-1 focus-ring"
              />
              <div className="w-16 h-10 relative rounded overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] shrink-0">
                <Image
                  src={formData.defaultOgImage}
                  alt="OG Preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Database & Supabase connection info (PRD Section 5 & 8) */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--text)]">
              Database & Infrastructure (Supabase)
            </h2>
            <span className="text-[11px] font-mono-code px-2 py-0.5 rounded bg-[var(--success)]/10 text-[var(--success)] font-medium">
              Connected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex flex-col gap-1">
              <span className="font-mono-code text-[var(--text-muted)] uppercase text-[10px]">
                PostgreSQL Region
              </span>
              <span className="font-semibold text-[var(--text)]">
                Singapore (ap-southeast-1)
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex flex-col gap-1">
              <span className="font-mono-code text-[var(--text-muted)] uppercase text-[10px]">
                Payload CMS Schema
              </span>
              <span className="font-semibold text-[var(--text)] font-mono-code">
                payload (isolated schema)
              </span>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="primary"
            size="lg"
            type="submit"
            icon={<Check className="w-4 h-4 stroke-[1.75]" />}
          >
            Save Site Settings
          </Button>

          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={() => setShowResetModal(true)}
            icon={<RotateCcw className="w-3.5 h-3.5 stroke-[1.75]" />}
          >
            Reset Seed Data
          </Button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Portfolio Data"
        description="Are you sure you want to reset all projects, profile data, and media to the original seed state? Any customized items in local storage will be overwritten."
        confirmText="Confirm Reset"
        confirmVariant="danger"
        onConfirm={handleResetConfirm}
      />
    </div>
  );
}
