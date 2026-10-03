"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  UploadCloud,
  Copy,
  Check,
  ArrowUpRight,
  Calendar,
  X,
  FileCheck2,
  AlertCircle,
} from "lucide-react";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { Button } from "@/components/ui/Button";
import { Toast, ToastType } from "@/components/ui/Toast";
import { usePortfolio } from "@/context/PortfolioContext";

export default function AdminResumePage() {
  const { resumeSettings, updateResumeSettings } = usePortfolio();

  const [versionLabel, setVersionLabel] = useState(resumeSettings.versionLabel || "v2.4");
  const [fileName, setFileName] = useState(resumeSettings.fileName || "CV_Rangga_Prasetya.pdf");
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if initial backend data updates
  useEffect(() => {
    if (resumeSettings.versionLabel && !stagedFile) {
      setVersionLabel(resumeSettings.versionLabel);
    }
    if (resumeSettings.fileName && !stagedFile) {
      setFileName(resumeSettings.fileName);
    }
  }, [resumeSettings, stagedFile]);

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/cv.pdf`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setToast({
      type: "success",
      message: "Permanent CV link copied to clipboard!",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const processFile = (file: File) => {
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setToast({
        type: "error",
        message: "Format file tidak valid. Hanya file berekstensi .pdf yang diperbolehkan.",
      });
      return;
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      setToast({
        type: "error",
        message: "Ukuran file terlalu besar! Maksimal 10 MB.",
      });
      return;
    }

    setStagedFile(file);
    setFileName(file.name);

    // Auto-suggest version bump if needed
    const match = versionLabel.match(/v?(\d+)\.(\d+)/);
    if (match) {
      const major = match[1];
      const minor = parseInt(match[2], 10) + 1;
      setVersionLabel(`v${major}.${minor}`);
    } else {
      setVersionLabel("v2.5");
    }

    setToast({
      type: "info",
      message: `File "${file.name}" berhasil di-drop! Klik "Publish New CV" untuk mengaktifkan ke /cv.pdf.`,
    });
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the container itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
      try {
        e.dataTransfer.clearData();
      } catch {
        // Ignore unsupported browser operations
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleClearStagedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStagedFile(null);
    setFileName(resumeSettings.fileName);
    setVersionLabel(resumeSettings.versionLabel);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setToast({
      type: "info",
      message: "File dibatalkan.",
    });
  };

  const handlePublishCV = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsUploading(true);

    try {
      if (stagedFile) {
        // Upload real binary PDF to /api/resume
        const formData = new FormData();
        formData.append("file", stagedFile);
        formData.append("versionLabel", versionLabel);
        formData.append("fileName", fileName);

        const res = await fetch("/api/resume", {
          method: "PUT",
          body: formData,
        });

        const json = await res.json();
        if (json.success && json.data) {
          updateResumeSettings(json.data, true);
          setStagedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setToast({
            type: "success",
            message: `Versi CV baru (${versionLabel}) berhasil dipublikasikan! Halaman /cv dan file /cv.pdf telah diperbarui.`,
          });
        } else {
          setToast({
            type: "error",
            message: json.error?.message || "Gagal mengunggah CV ke server.",
          });
        }
      } else {
        // Metadata only update
        const res = await fetch("/api/resume", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            versionLabel,
            fileName,
          }),
        });

        const json = await res.json();
        if (json.success && json.data) {
          updateResumeSettings(json.data, true);
          setToast({
            type: "success",
            message: "Metadata CV berhasil disimpan!",
          });
        } else {
          setToast({
            type: "error",
            message: json.error?.message || "Gagal memperbarui metadata CV.",
          });
        }
      }
    } catch (err) {
      console.error("Publish CV error:", err);
      setToast({
        type: "error",
        message: "Terjadi kesalahan jaringan saat memperbarui CV.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="flex flex-col flex-1 pb-16">
      <AdminTopbar
        title="Resume & CV Management"
        subtitle="Manage official downloadable CV PDF served at the permanent /cv.pdf URL"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => handlePublishCV()}
            isLoading={isUploading}
            icon={<UploadCloud className="w-3.5 h-3.5 stroke-[1.75]" />}
          >
            Publish New CV
          </Button>
        }
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="p-6 sm:p-8 max-w-4xl flex flex-col gap-8">
        {/* Current Active CV Status Card */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono-code text-[var(--text-muted)]">
                Active Resume Release
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono-code bg-[var(--success)]/10 text-[var(--success)] font-medium">
                Live
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono-code">
              <Calendar className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Updated: {resumeSettings.updatedAt}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-[var(--text)] font-mono-code truncate">
                  {resumeSettings.fileName}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono-code">
                  Version: {resumeSettings.versionLabel} • Size: {resumeSettings.fileSize}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                href="/cv"
                external
                iconRight={<ArrowUpRight className="w-3.5 h-3.5 stroke-[1.75]" />}
              >
                Buka Halaman /cv
              </Button>
              <Button
                variant="secondary"
                size="sm"
                href="/cv.pdf"
                external
                iconRight={<ArrowUpRight className="w-3.5 h-3.5 stroke-[1.75]" />}
              >
                Inspect PDF
              </Button>
            </div>
          </div>

          {/* Permanent URL box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text)]">
              Permanent Public Endpoint (Always serves newest version)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value="https://ranggaprasetya.dev/cv.pdf"
                className="h-10 px-3 rounded-lg text-xs font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] flex-1 select-all"
              />
              <Button
                variant="secondary"
                size="md"
                onClick={handleCopyLink}
                icon={copied ? <Check className="w-4 h-4 stroke-[1.75]" /> : <Copy className="w-4 h-4 stroke-[1.75]" />}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </div>

        {/* Upload & Version Replacement Form */}
        <form
          onSubmit={handlePublishCV}
          className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-[var(--text)]">
              Release Updated CV Version
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Upload a new PDF to immediately update the `/cv.pdf` download route without rebuilding code.
            </p>
          </div>

          {/* Hidden HTML5 File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
            id="cv-file-input"
          />

          {/* Drag & Drop Upload Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 cursor-pointer transition-all duration-200 select-none ${
              isDragging
                ? "border-[var(--primary)] bg-[var(--primary)]/10 scale-[1.01]"
                : stagedFile
                ? "border-[var(--success)]/60 bg-[var(--success)]/5"
                : "border-[var(--border)] hover:border-[var(--primary)]/60 bg-[var(--surface-2)]/50"
            }`}
          >
            {stagedFile ? (
              <div className="flex flex-col items-center gap-3 w-full max-w-md">
                <div className="w-14 h-14 rounded-2xl bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30 flex items-center justify-center animate-fade-in shadow-xs">
                  <FileCheck2 className="w-7 h-7 stroke-[1.75]" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-[var(--success)]/15 text-[var(--success)] font-mono-code">
                      PDF File Staged
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text)] font-mono-code break-all">
                    {stagedFile.name}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono-code">
                    {formatFileSize(stagedFile.size)} • Ready to deploy
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[var(--primary)] hover:underline font-medium"
                  >
                    Ganti file lain
                  </button>
                  <span className="text-xs text-[var(--border)]">•</span>
                  <button
                    type="button"
                    onClick={handleClearStagedFile}
                    className="flex items-center gap-1 text-xs text-[var(--danger)] hover:underline font-medium"
                  >
                    <X className="w-3.5 h-3.5 stroke-[1.75]" />
                    Batalkan
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`w-14 h-14 rounded-2xl bg-[var(--surface)] border flex items-center justify-center transition-all ${
                    isDragging
                      ? "border-[var(--primary)] text-[var(--primary)] scale-110 shadow-md"
                      : "border-[var(--border)] text-[var(--text-muted)]"
                  }`}
                >
                  <UploadCloud className="w-7 h-7 stroke-[1.75]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-[var(--text)]">
                    {isDragging
                      ? "Lepaskan file PDF di sini..."
                      : "Drag & drop file CV PDF di sini, atau klik untuk memilih"}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono-code">
                    Hanya format .PDF hingga 10 MB (Contoh: CV_Rangga_Prasetya.pdf)
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1"
                >
                  Pilih Dokumen PDF
                </Button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text)]">
                File Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="CV_Rangga_Prasetya.pdf"
                className="h-10 px-3 rounded-lg text-xs font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text)]">
                Version Identifier / Release Tag
              </label>
              <input
                type="text"
                placeholder="e.g. v2.5"
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
                className="h-10 px-3 rounded-lg text-xs font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={isUploading}
              iconRight={<UploadCloud className="w-4 h-4 stroke-[1.75]" />}
            >
              Publish New CV
            </Button>
            {stagedFile && (
              <span className="text-xs text-[var(--success)] font-medium flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 stroke-[1.75]" />
                File siap diunggah saat tombol ditekan
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
