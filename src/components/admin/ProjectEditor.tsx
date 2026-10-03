"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  FilePen,
  Eye,
  Trash2,
  Plus,
  ArrowLeft,
  Search,
  Sparkles,
  Globe,
  Share2,
  AlertTriangle,
  UploadCloud,
  FileImage,
  ImagePlus,
  CheckCircle2,
} from "lucide-react";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { TechChip } from "@/components/ui/TechChip";
import { usePortfolio } from "@/context/PortfolioContext";
import { Project, ProjectCategory } from "@/types";

export interface ProjectEditorProps {
  initialData?: Project;
  isNew?: boolean;
}

export function ProjectEditor({ initialData, isNew = false }: ProjectEditorProps) {
  const router = useRouter();
  const { saveProject, deleteProject, mediaItems, addMediaItem } = usePortfolio();

  const [formData, setFormData] = useState<Project>(
    initialData || {
      id: `proj-${Date.now()}`,
      title: "",
      slug: "",
      summary: "",
      coverImage: "/images/angkot_to_school-63d994.png",
      coverAlt: "",
      category: "fullstack",
      categoryDisplay: "WEB APPLICATION",
      role: "Fullstack Developer",
      year: new Date().getFullYear().toString(),
      clientName: "",
      clientType: "Commercial / Enterprise",
      techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
      liveUrl: "",
      repoUrl: "",
      problem: "",
      solution: "",
      result: "",
      metrics: [{ id: "m1", label: "Performance Gain", value: "+45%" }],
      gallery: [],
      featured: false,
      order: 1,
      status: "draft",
      seoTitle: "",
      seoDescription: "",
      updatedAt: new Date().toISOString().split("T")[0],
    }
  );

  const [newTechInput, setNewTechInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [autoSlug, setAutoSlug] = useState(isNew);

  // Cover & Gallery Media Upload States & Refs
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [isCoverDragging, setIsCoverDragging] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [showMediaPickerModal, setShowMediaPickerModal] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"cover" | "gallery">("cover");

  const handleCoverUploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setToastMessage("Hanya file format gambar (PNG, JPG, WebP, SVG) yang diperbolehkan.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setToastMessage("Ukuran file gambar maksimal 10 MB.");
      return;
    }

    setIsUploadingCover(true);
    try {
      const altText =
        formData.coverAlt.trim() ||
        (formData.title ? `${formData.title} cover image` : file.name.replace(/\.[^/.]+$/, ""));

      const payload = new FormData();
      payload.append("file", file);
      payload.append("alt", altText.length >= 3 ? altText : `${altText} preview`);

      const res = await fetch("/api/media", {
        method: "POST",
        body: payload,
      });

      const json = await res.json();
      if (json.success && json.data) {
        setFormData((prev) => ({
          ...prev,
          coverImage: json.data.url,
          coverAlt: prev.coverAlt.trim() ? prev.coverAlt : json.data.alt,
        }));
        addMediaItem(json.data);
        setToastMessage("Cover image berhasil diunggah!");
      } else {
        setToastMessage(json.error?.message || "Gagal mengunggah foto cover.");
      }
    } catch (err) {
      console.error("Cover upload error:", err);
      setToastMessage("Terjadi kesalahan jaringan saat mengunggah foto cover.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleCoverFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleCoverUploadFile(e.target.files[0]);
    }
  };

  const handleCoverDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragging(true);
  };

  const handleCoverDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCoverDragging) setIsCoverDragging(true);
  };

  const handleCoverDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsCoverDragging(false);
  };

  const handleCoverDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleCoverUploadFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleGalleryUploadFiles = async (files: FileList) => {
    setIsUploadingGallery(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const payload = new FormData();
        payload.append("file", file);
        payload.append(
          "alt",
          `${formData.title || "Project"} screenshot ${i + 1}`
        );

        const res = await fetch("/api/media", {
          method: "POST",
          body: payload,
        });

        const json = await res.json();
        if (json.success && json.data) {
          newUrls.push(json.data.url);
          addMediaItem(json.data);
        }
      }

      if (newUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          gallery: [...(prev.gallery || []), ...newUrls],
        }));
        setToastMessage(`${newUrls.length} foto galeri berhasil diunggah!`);
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
      setToastMessage("Gagal mengunggah foto galeri.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleGalleryFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleGalleryUploadFiles(e.target.files);
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSelectMediaFromPicker = (item: { url: string; alt: string }) => {
    if (mediaPickerTarget === "cover") {
      setFormData((prev) => ({
        ...prev,
        coverImage: item.url,
        coverAlt: prev.coverAlt.trim() ? prev.coverAlt : item.alt,
      }));
      setToastMessage("Cover image diperbarui dari library!");
    } else {
      setFormData((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), item.url],
      }));
      setToastMessage("Gambar ditambahkan ke galeri project!");
    }
    setShowMediaPickerModal(false);
  };

  // Auto-generate slug from title if enabled
  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const updated: Project = { ...prev, title: val };
      if (autoSlug) {
        updated.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return updated;
    });
  };

  const handleAddMetric = () => {
    setFormData((prev) => ({
      ...prev,
      metrics: [
        ...prev.metrics,
        { id: `m-${Date.now()}`, label: "New Metric", value: "100%" },
      ],
    }));
  };

  const handleRemoveMetric = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((m) => m.id !== id),
    }));
  };

  const handleMetricChange = (id: string, field: "label" | "value", val: string) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.map((m) =>
        m.id === id ? { ...m, [field]: val } : m
      ),
    }));
  };

  const handleAddTech = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (!newTechInput.trim()) return;
    if (!formData.techStack.includes(newTechInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, newTechInput.trim()],
      }));
    }
    setNewTechInput("");
  };

  const handleRemoveTech = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tech),
    }));
  };

  const handleSave = (newStatus?: "published" | "draft") => {
    const updatedStatus = newStatus || formData.status;
    const toSave: Project = {
      ...formData,
      status: updatedStatus,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    saveProject(toSave);
    setFormData(toSave);
    setToastMessage(
      updatedStatus === "published"
        ? "Project published successfully!"
        : "Draft saved successfully!"
    );

    if (isNew) {
      setTimeout(() => {
        router.push(`/admin/projects/${toSave.id}`);
      }, 700);
    }
  };

  const handleDelete = () => {
    if (initialData?.id) {
      deleteProject(initialData.id);
      router.push("/admin/projects");
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-16">
      <AdminTopbar
        title={isNew ? "New Project" : `Edit Project: ${formData.title || "Untitled"}`}
        subtitle="Fullstack case study editor with live SEO preview and publish control"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              href="/admin/projects"
              icon={<ArrowLeft className="w-3.5 h-3.5 stroke-[1.75]" />}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSave("published")}
              icon={<Upload className="w-3.5 h-3.5 stroke-[1.75]" />}
            >
              Publish
            </Button>
          </div>
        }
      />

      {toastMessage && (
        <Toast
          type="success"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="p-6 sm:p-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* MAIN FORM COLUMN (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* General Info Card */}
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4">
              <h2 className="text-base font-semibold text-[var(--text)]">
                Project Overview
              </h2>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text)]">
                  Project Title <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Angkot To School"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="h-10 px-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                />
              </div>

              {/* Slug (mono) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--text)]">
                    URL Slug
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSlug}
                      onChange={(e) => setAutoSlug(e.target.checked)}
                      className="rounded"
                    />
                    <span>Auto-generate</span>
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono-code text-[var(--text-muted)]">
                    /projects/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setFormData({ ...formData, slug: e.target.value });
                    }}
                    className="w-full h-10 pl-22 pr-3 rounded-lg text-xs font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                  />
                </div>
              </div>

              {/* Summary (with 160-char counter per Stitch Section 6.2 #4) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--text)]">
                    Summary & Meta Description
                  </label>
                  <span
                    className={`text-[11px] font-mono-code ${
                      formData.summary.length > 160
                        ? "text-[var(--danger)] font-bold"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {formData.summary.length}/160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="1-2 sentences summarizing the client, core system, and primary achievement..."
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  className="p-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring leading-relaxed"
                />
              </div>
            </div>

            {/* Media & Cover Image Card (Required Alt Text per PRD FR-6) */}
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text)]">
                    Cover Media
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Gambar visual utama untuk kartu project di halaman publik, pratinjau media sosial, dan banner studi kasus.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setMediaPickerTarget("cover");
                      setShowMediaPickerModal(true);
                    }}
                    icon={<FileImage className="w-3.5 h-3.5 stroke-[1.75]" />}
                  >
                    Pilih dari Library
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    isLoading={isUploadingCover}
                    icon={<UploadCloud className="w-3.5 h-3.5 stroke-[1.75]" />}
                  >
                    Upload Foto Baru
                  </Button>
                </div>
              </div>

              {/* Hidden Cover File Input */}
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFileInputChange}
                className="hidden"
                id="project-cover-input"
              />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Left: Drag & Drop Dropzone & Preview (6 cols) */}
                <div className="md:col-span-6 flex flex-col gap-2">
                  <div
                    onDragEnter={handleCoverDragEnter}
                    onDragOver={handleCoverDragOver}
                    onDragLeave={handleCoverDragLeave}
                    onDrop={handleCoverDrop}
                    onClick={() => coverFileInputRef.current?.click()}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group ${
                      isCoverDragging
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 scale-[1.01]"
                        : "border-[var(--border)] hover:border-[var(--primary)]/60 bg-[var(--surface-2)]/60"
                    }`}
                  >
                    {formData.coverImage ? (
                      <>
                        <Image
                          src={formData.coverImage}
                          alt={formData.coverAlt || "Project Cover Preview"}
                          fill
                          className="object-cover transition-opacity group-hover:opacity-75"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                          <UploadCloud className="w-8 h-8 stroke-[1.75] text-[var(--primary)]" />
                          <span className="text-xs font-semibold">Klik atau Drop foto baru untuk mengganti</span>
                          <span className="text-[11px] text-white/80 font-mono-code">PNG, JPG, WebP hingga 10MB</span>
                        </div>
                        {isUploadingCover && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 text-white">
                            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-medium">Mengunggah foto cover...</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                          <UploadCloud className="w-6 h-6 stroke-[1.75]" />
                        </div>
                        <span className="text-xs font-semibold text-[var(--text)]">
                          Drag & drop foto cover ke sini, atau klik untuk upload
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] font-mono-code">
                          Rekomendasi rasio 16:9 (1280x720 atau 1920x1080)
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Pratinjau Cover Project</span>
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="text-[var(--primary)] hover:underline font-medium cursor-pointer"
                    >
                      Ganti Foto Cover
                    </button>
                  </div>
                </div>

                {/* Right: Asset URL & Mandatory Alt Text (6 cols) */}
                <div className="md:col-span-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--text)]">
                      Asset URL / Path
                    </label>
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) =>
                        setFormData({ ...formData, coverImage: e.target.value })
                      }
                      placeholder="/images/example.png atau https://..."
                      className="h-10 px-3 rounded-lg text-xs font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                    />
                  </div>

                  {/* Required Alt Text Field per PRD FR-6 */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[var(--text)] flex items-center gap-1.5">
                        <span>Accessibility Alt Text</span>
                        <span className="text-[var(--danger)]">*</span>
                      </label>
                      <span className="text-[10px] font-mono-code text-[var(--text-muted)]">
                        Mandatory (FR-6)
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Deskripsi gambar untuk pembaca layar (min 3 karakter)"
                      value={formData.coverAlt}
                      onChange={(e) =>
                        setFormData({ ...formData, coverAlt: e.target.value })
                      }
                      className={`h-10 px-3 rounded-lg text-xs bg-[var(--bg)] border text-[var(--text)] focus-ring ${
                        !formData.coverAlt || formData.coverAlt.length < 3
                          ? "border-[var(--warning)]"
                          : "border-[var(--border)]"
                      }`}
                    />
                    {!formData.coverAlt || formData.coverAlt.length < 3 ? (
                      <span className="text-[11px] text-[var(--warning)] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 stroke-[1.75]" />
                        Wajib diisi minimal 3 karakter untuk kepatuhan aksesibilitas WCAG AA & SEO 100.
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--success)] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.75]" />
                        Alt text valid untuk pembaca layar.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Gallery & Screenshots Card */}
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text)]">
                    Project Gallery & Screenshots
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Screenshot arsitektur, dashboard, dan visual tambahan untuk studi kasus.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setMediaPickerTarget("gallery");
                      setShowMediaPickerModal(true);
                    }}
                    icon={<FileImage className="w-3.5 h-3.5 stroke-[1.75]" />}
                  >
                    Pilih dari Library
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    isLoading={isUploadingGallery}
                    icon={<Plus className="w-3.5 h-3.5 stroke-[1.75]" />}
                  >
                    Upload Foto Galeri
                  </Button>
                </div>
              </div>

              {/* Hidden Gallery File Input */}
              <input
                ref={galleryFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryFileInputChange}
                className="hidden"
                id="project-gallery-input"
              />

              {formData.gallery && formData.gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {formData.gallery.map((imgUrl, idx) => (
                    <div
                      key={`${imgUrl}-${idx}`}
                      className="relative aspect-video rounded-lg overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] group"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Gallery screenshot ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white hover:bg-[var(--danger)] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Hapus foto dari galeri"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="p-6 rounded-xl border border-dashed border-[var(--border)] hover:border-[var(--primary)]/60 bg-[var(--surface-2)]/30 flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-colors"
                >
                  <ImagePlus className="w-6 h-6 text-[var(--text-muted)] stroke-[1.75]" />
                  <span className="text-xs font-medium text-[var(--text)]">Belum ada screenshot tambahan</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Klik tombol di atas untuk upload foto screenshot galeri</span>
                </div>
              )}
            </div>

            {/* Case Study Sections (Problem / Solution / Result) */}
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4">
              <h2 className="text-base font-semibold text-[var(--text)]">
                Case Study Content
              </h2>

              {/* Problem */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text)]">
                  The Problem / Challenge
                </label>
                <textarea
                  rows={4}
                  placeholder="What was the initial bottleneck, client pain point, or technical deficit?"
                  value={formData.problem}
                  onChange={(e) =>
                    setFormData({ ...formData, problem: e.target.value })
                  }
                  className="p-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring leading-relaxed"
                />
              </div>

              {/* Solution */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text)]">
                  The Solution & Architecture
                </label>
                <textarea
                  rows={4}
                  placeholder="How did you architect and execute the solution? Include protocols, edge devices, and frameworks..."
                  value={formData.solution}
                  onChange={(e) =>
                    setFormData({ ...formData, solution: e.target.value })
                  }
                  className="p-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring leading-relaxed"
                />
              </div>

              {/* Result */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text)]">
                  Outcome & Measurable Results
                </label>
                <textarea
                  rows={4}
                  placeholder="What concrete metrics, adoption stats, or operational wins were achieved?"
                  value={formData.result}
                  onChange={(e) =>
                    setFormData({ ...formData, result: e.target.value })
                  }
                  className="p-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring leading-relaxed"
                />
              </div>
            </div>

            {/* Measurable Metrics Repeater */}
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text)]">
                    Key Performance Metrics
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Prominent quantitative proof points displayed on the case study.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={handleAddMetric}
                  icon={<Plus className="w-3.5 h-3.5 stroke-[1.75]" />}
                >
                  Add Metric
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                {formData.metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]"
                  >
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Value (e.g. -66% or 12,400+)"
                        value={metric.value}
                        onChange={(e) =>
                          handleMetricChange(metric.id, "value", e.target.value)
                        }
                        className="h-8 px-2.5 rounded bg-[var(--bg)] border border-[var(--border)] text-xs font-semibold text-[var(--primary)] focus-ring"
                      />
                      <input
                        type="text"
                        placeholder="Label (e.g. Turnaround Time Reduction)"
                        value={metric.label}
                        onChange={(e) =>
                          handleMetricChange(metric.id, "label", e.target.value)
                        }
                        className="h-8 px-2.5 rounded bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] flex-1 focus-ring"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMetric(metric.id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] rounded hover:bg-[var(--surface)] transition-colors cursor-pointer"
                      title="Delete metric"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.75]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack Tag Input */}
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4">
              <h2 className="text-base font-semibold text-[var(--text)]">
                Technologies & Tools
              </h2>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add technology (e.g. TypeScript, ESP32, Leaflet)..."
                  value={newTechInput}
                  onChange={(e) => setNewTechInput(e.target.value)}
                  onKeyDown={handleAddTech}
                  className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] flex-1 focus-ring"
                />
                <Button variant="secondary" size="sm" type="button" onClick={handleAddTech}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {formData.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-code bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)]"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="hover:text-[var(--danger)] transition-colors cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text)]">
                  Live Site URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.liveUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, liveUrl: e.target.value })
                  }
                  className="h-9 px-3 rounded-lg text-xs font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text)]">
                  Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.repoUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, repoUrl: e.target.value })
                  }
                  className="h-9 px-3 rounded-lg text-xs font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                />
              </div>
            </div>
          </div>

          {/* SIDE PANEL COLUMN (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Publish Control Panel */}
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code uppercase text-[var(--text-muted)] font-semibold">
                  Status
                </span>
                <StatusBadge status={formData.status} />
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleSave("published")}
                  icon={<Upload className="w-4 h-4 stroke-[1.75]" />}
                  className="w-full"
                >
                  Publish Changes
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleSave("draft")}
                  icon={<FilePen className="w-4 h-4 stroke-[1.75]" />}
                  className="w-full"
                >
                  Save as Draft
                </Button>

                {formData.slug && (
                  <Button
                    variant="ghost"
                    size="md"
                    href={`/projects/${formData.slug}`}
                    external
                    icon={<Eye className="w-4 h-4 stroke-[1.75]" />}
                    className="w-full"
                  >
                    Live Preview
                  </Button>
                )}
              </div>
            </div>

            {/* Categorization & Metadata Panel */}
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono-code text-[var(--text-muted)]">
                Metadata
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text)]">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as ProjectCategory,
                      categoryDisplay: e.target.value.toUpperCase(),
                    })
                  }
                  className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                >
                  <option value="fullstack">Fullstack / Web App</option>
                  <option value="frontend">Frontend / Extension</option>
                  <option value="backend">Backend / Distributed</option>
                  <option value="iot">IoT & Telematics</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text)]">Year</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring font-mono-code"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text)]">Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dishub Kota Bandung"
                  value={formData.clientName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                />
              </div>

              {/* Featured toggle */}
              <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer mt-1">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[var(--text)]">
                    Featured Project
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Display prominently on homepage
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[var(--primary)] focus-ring cursor-pointer"
                />
              </label>
            </div>

            {/* Live SEO & Social Share Preview (Stitch Section 6.2 #4) */}
            <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--primary)] stroke-[1.75]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider font-mono-code text-[var(--text)]">
                  Live Search Engine Preview
                </h3>
              </div>

              {/* Google Search Snippet Preview */}
              <div className="p-4 rounded-lg bg-white text-black border border-gray-200 flex flex-col gap-1 text-xs">
                <span className="text-[11px] text-gray-600 truncate">
                  https://ranggaprasetya.dev/projects/{formData.slug || "project-slug"}
                </span>
                <span className="text-sm font-semibold text-[#1a0dab] hover:underline line-clamp-1">
                  {formData.seoTitle || formData.title || "Project Title"} | Rangga Prasetya
                </span>
                <span className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                  {formData.seoDescription || formData.summary || "Case study overview..."}
                </span>
              </div>

              {/* Social Card Preview */}
              <div className="flex items-center gap-2 pt-2">
                <Share2 className="w-4 h-4 text-[var(--primary)] stroke-[1.75]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider font-mono-code text-[var(--text)]">
                  Social Share Preview
                </h3>
              </div>

              <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] flex flex-col">
                <div className="relative aspect-video w-full bg-[var(--border)]">
                  <Image
                    src={formData.coverImage}
                    alt="Social preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <span className="text-[10px] font-mono-code text-[var(--text-muted)] uppercase">
                    ranggaprasetya.dev
                  </span>
                  <span className="text-xs font-semibold text-[var(--text)] line-clamp-1">
                    {formData.title || "Project Title"}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                    {formData.summary}
                  </span>
                </div>
              </div>
            </div>

            {/* Destructive Action */}
            {!isNew && (
              <div className="p-4 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[var(--danger)]">
                    Danger Zone
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Permanently delete this project
                  </span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  icon={<Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
        description={`Are you sure you want to permanently delete "${formData.title}"?`}
        confirmText="Confirm Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
      />

      {/* Media Library Picker Modal */}
      <Modal
        isOpen={showMediaPickerModal}
        onClose={() => setShowMediaPickerModal(false)}
        title={mediaPickerTarget === "cover" ? "Pilih Cover dari Media Library" : "Pilih Foto Galeri dari Library"}
        description="Pilih salah satu gambar yang sudah tersedia untuk dijadikan aset project."
      >
        <div className="flex flex-col gap-3 py-1">
          {mediaItems && mediaItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto p-1">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectMediaFromPicker(item)}
                  className="flex flex-col gap-1.5 p-2 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)] cursor-pointer transition-all group"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-[var(--surface-2)] border border-[var(--border)]">
                    <Image
                      src={item.url}
                      alt={item.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--text)] truncate">
                    {item.fileName}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] truncate">
                    {item.alt}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] flex flex-col items-center gap-2">
              <FileImage className="w-8 h-8 stroke-[1.75]" />
              <span>Media Library masih kosong. Anda dapat mengunggah foto baru secara langsung.</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
