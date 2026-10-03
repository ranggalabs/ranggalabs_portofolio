"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  X,
  FileImage,
} from "lucide-react";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { usePortfolio } from "@/context/PortfolioContext";
import { MediaItem } from "@/types";

export default function AdminMediaPage() {
  const { mediaItems, addMediaItem, updateMediaItem, deleteMediaItem } =
    usePortfolio();

  const [search, setSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(
    mediaItems[0] || null
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingModal, setIsDraggingModal] = useState(false);

  const filteredMedia = mediaItems.filter((item) => {
    if (!search.trim()) return true;
    return (
      item.fileName.toLowerCase().includes(search.toLowerCase()) ||
      item.alt.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSaveSelected = () => {
    if (selectedMedia) {
      updateMediaItem(selectedMedia.id, selectedMedia);
      setToastMessage("Image metadata and alt text saved!");
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      setUploadError("Pilih file gambar terlebih dahulu.");
      return;
    }

    if (!uploadAlt.trim() || uploadAlt.trim().length < 3) {
      setUploadError("Alt text aksesibilitas wajib diisi minimal 3 karakter (FR-6).");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("alt", uploadAlt.trim());
      if (uploadCaption.trim()) {
        formData.append("caption", uploadCaption.trim());
      }

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        addMediaItem(json.data);
        setSelectedMedia(json.data);
        setIsUploadModalOpen(false);
        setUploadFile(null);
        setUploadAlt("");
        setUploadCaption("");
        setToastMessage("Gambar berhasil diunggah ke Media Library!");
      } else {
        setUploadError(json.error?.message || "Gagal mengunggah file media.");
      }
    } catch (err) {
      console.error("Media upload error:", err);
      setUploadError("Terjadi kesalahan jaringan.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-16">
      <AdminTopbar
        title="Media Library"
        subtitle="Manage uploaded case study screenshots, diagrams, and alt text"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            icon={<UploadCloud className="w-3.5 h-3.5 stroke-[1.75]" />}
          >
            Upload Media
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

      <div className="p-6 sm:p-8 max-w-7xl flex flex-col gap-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.75]" />
            <input
              type="text"
              placeholder="Search media files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors focus-ring ${
                viewMode === "grid"
                  ? "bg-[var(--surface-2)] text-[var(--primary)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
              title="Grid View"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4 stroke-[1.75]" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors focus-ring ${
                viewMode === "list"
                  ? "bg-[var(--surface-2)] text-[var(--primary)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
              title="List View"
              aria-label="List view"
            >
              <List className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        </div>

        {/* Media Grid & Inspector Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Media Items View (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredMedia.map((item) => {
                  const isSelected = selectedMedia?.id === item.id;
                  const hasAlt = !!item.alt && item.alt.trim().length > 0;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      className={`group relative flex flex-col rounded-xl overflow-hidden bg-[var(--surface)] border cursor-pointer transition-all ${
                        isSelected
                          ? "ring-2 ring-[var(--primary)] border-[var(--primary)]"
                          : "border-[var(--border)] hover:border-[var(--text-muted)]"
                      }`}
                    >
                      <div className="relative aspect-video w-full bg-[var(--surface-2)] overflow-hidden">
                        <Image
                          src={item.url}
                          alt={item.alt || item.fileName}
                          fill
                          className="object-cover transition-transform group-hover:scale-102"
                        />
                        {/* Alt text status badge per PRD FR-6 */}
                        <div className="absolute top-2 right-2">
                          {hasAlt ? (
                            <span className="p-1 rounded-full bg-white/90 dark:bg-black/80 text-[var(--success)] shadow-xs flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.75]" />
                            </span>
                          ) : (
                            <span
                              className="p-1 rounded-full bg-amber-500 text-white shadow-xs flex items-center justify-center"
                              title="Missing Alt Text"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 stroke-[1.75]" />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 flex flex-col gap-1">
                        <span className="font-mono-code text-[11px] text-[var(--text)] truncate font-medium">
                          {item.fileName}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono-code">
                          <span>{item.dimensions}</span>
                          <span>{item.size}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] font-mono-code uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">File</th>
                      <th className="py-2.5 px-4">Dimensions</th>
                      <th className="py-2.5 px-4">Size</th>
                      <th className="py-2.5 px-4">Alt Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredMedia.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedMedia(item)}
                        className={`hover:bg-[var(--surface-2)] transition-colors cursor-pointer ${
                          selectedMedia?.id === item.id ? "bg-[var(--surface-2)]" : ""
                        }`}
                      >
                        <td className="py-2.5 px-4 font-mono-code text-[var(--text)] font-medium">
                          {item.fileName}
                        </td>
                        <td className="py-2.5 px-4 font-mono-code text-[var(--text-muted)]">
                          {item.dimensions}
                        </td>
                        <td className="py-2.5 px-4 font-mono-code text-[var(--text-muted)]">
                          {item.size}
                        </td>
                        <td className="py-2.5 px-4">
                          {item.alt ? (
                            <span className="text-[var(--success)] font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.75]" />
                              <span>Valid</span>
                            </span>
                          ) : (
                            <span className="text-amber-500 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 stroke-[1.75]" />
                              <span>Missing</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Inspector / Edit Side Panel (4 Cols) */}
          <div className="lg:col-span-4">
            {selectedMedia ? (
              <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4 shadow-xs sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <h3 className="text-sm font-semibold text-[var(--text)]">
                    File Details
                  </h3>
                  <button
                    onClick={() => {
                      deleteMediaItem(selectedMedia.id);
                      setSelectedMedia(null);
                    }}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                    title="Delete Media"
                  >
                    <Trash2 className="w-4 h-4 stroke-[1.75]" />
                  </button>
                </div>

                <div className="relative aspect-video rounded-lg overflow-hidden bg-[var(--surface-2)] border border-[var(--border)]">
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.alt || "Preview"}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-mono-code text-[var(--text)] font-semibold truncate">
                    {selectedMedia.fileName}
                  </span>
                  <div className="flex items-center gap-3 text-[var(--text-muted)] font-mono-code text-[11px]">
                    <span>{selectedMedia.dimensions}</span>
                    <span>•</span>
                    <span>{selectedMedia.size}</span>
                  </div>
                </div>

                {/* Alt Text editing per PRD FR-6 */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border)]">
                  <label className="text-xs font-medium text-[var(--text)]">
                    Alternative Text (Alt) <span className="text-[var(--danger)]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter descriptive alt text..."
                    value={selectedMedia.alt}
                    onChange={(e) =>
                      setSelectedMedia({ ...selectedMedia, alt: e.target.value })
                    }
                    className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                  />
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Required for accessibility compliance and SEO 100.
                  </span>
                </div>

                {/* Caption editing */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--text)]">
                    Caption (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter caption for galleries..."
                    value={selectedMedia.caption || ""}
                    onChange={(e) =>
                      setSelectedMedia({
                        ...selectedMedia,
                        caption: e.target.value,
                      })
                    }
                    className="p-2.5 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  type="button"
                  onClick={handleSaveSelected}
                  className="w-full mt-2"
                >
                  Save Metadata
                </Button>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center text-xs text-[var(--text-muted)] flex flex-col items-center gap-2">
                <FileImage className="w-8 h-8 stroke-[1.75]" />
                <span>Select an image to view details and edit alt text.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Media Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadFile(null);
          setUploadError(null);
        }}
        title="Upload Image to Media Library"
        description="Pilih atau drop file gambar untuk ditambahkan ke galeri atau cover project."
        confirmText="Upload & Save"
        onConfirm={handleUploadSubmit}
        isConfirmLoading={isUploading}
      >
        <div className="flex flex-col gap-4 py-1">
          {uploadError && (
            <div className="p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-xs text-[var(--danger)]">
              {uploadError}
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDraggingModal(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingModal(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDraggingModal(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingModal(false);
              if (e.dataTransfer.files?.[0]) {
                setUploadFile(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 transition-colors cursor-pointer ${
              isDraggingModal
                ? "border-[var(--primary)] bg-[var(--primary)]/10"
                : uploadFile
                ? "border-[var(--success)]/60 bg-[var(--success)]/5"
                : "border-[var(--border)] bg-[var(--surface-2)]/50 hover:border-[var(--primary)]/40"
            }`}
            onClick={() => document.getElementById("media-modal-file-input")?.click()}
          >
            <input
              id="media-modal-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setUploadFile(e.target.files[0]);
                }
              }}
            />
            {uploadFile ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-[var(--success)] font-mono-code">
                  ✓ File Selected: {uploadFile.name}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-mono-code">
                  {(uploadFile.size / 1024).toFixed(1)} KB • Klik untuk ganti
                </span>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-[var(--text-muted)] stroke-[1.75]" />
                <span className="text-xs font-medium text-[var(--text)]">
                  Drag & drop file gambar atau klik untuk memilih
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-mono-code">
                  PNG, JPG, WebP, SVG hingga 10 MB
                </span>
              </>
            )}
          </div>

          {/* Mandatory Alt text (FR-6) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text)] flex items-center justify-between">
              <span>
                Accessibility Alt Text <span className="text-[var(--danger)]">*</span>
              </span>
              <span className="text-[11px] font-mono-code text-[var(--text-muted)]">
                Mandatory (FR-6)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dashboard interface showing live sensor telemetry"
              value={uploadAlt}
              onChange={(e) => setUploadAlt(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
            />
          </div>

          {/* Caption */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text)]">
              Caption (Optional)
            </label>
            <input
              type="text"
              placeholder="Short caption for display in galleries"
              value={uploadCaption}
              onChange={(e) => setUploadCaption(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
