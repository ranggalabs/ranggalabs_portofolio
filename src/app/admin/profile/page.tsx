"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Check,
  UploadCloud,
  Camera,
  ImagePlus,
  RotateCcw,
  Search,
  Loader2,
  X,
  GraduationCap,
  Award,
  Briefcase,
  Plus,
  Trash2,
} from "lucide-react";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { Button } from "@/components/ui/Button";
import { Toast, ToastType } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { usePortfolio } from "@/context/PortfolioContext";
import { Profile, MediaItem, EducationItem, CertificationItem, ExperienceItem } from "@/types";

export default function AdminProfilePage() {
  const { profile, updateProfile, mediaItems, addMediaItem } = usePortfolio();

  const [formData, setFormData] = useState<Profile>(() => ({
    ...profile,
    experiences: profile?.experiences || [],
    education: profile?.education || [],
    certifications: profile?.certifications || [],
  }));
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if initial backend data updates
  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        experiences: profile.experiences || [],
        education: profile.education || [],
        certifications: profile.certifications || [],
      });
    }
  }, [profile]);

  const handleUploadPhoto = async (file: File) => {
    const isImage =
      file.type.startsWith("image/") ||
      file.name.match(/\.(png|jpe?g|webp|gif|svg)$/i);

    if (!isImage) {
      setToast({
        type: "error",
        message: "Format file tidak valid. Hanya file gambar (PNG, JPG, WebP) yang diperbolehkan.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast({
        type: "error",
        message: "Ukuran file terlalu besar! Maksimal 10 MB.",
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("alt", `${formData.name || "Owner"} profile photo`);

      const res = await fetch("/api/media", {
        method: "POST",
        body: payload,
      });

      const json = await res.json();
      if (json.success && json.data) {
        setFormData((prev) => ({
          ...prev,
          photo: json.data.url,
        }));
        addMediaItem(json.data);
        setToast({
          type: "success",
          message: `Foto "${file.name}" berhasil diunggah! Klik "Save Profile" untuk menyimpan secara permanen.`,
        });
      } else {
        setToast({
          type: "error",
          message: json.error?.message || "Gagal mengunggah foto profil.",
        });
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      setToast({
        type: "error",
        message: "Terjadi kesalahan jaringan saat mengunggah foto.",
      });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadPhoto(e.target.files[0]);
    }
  };

  const handlePhotoDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPhoto(true);
  };

  const handlePhotoDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingPhoto) setIsDraggingPhoto(true);
  };

  const handlePhotoDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingPhoto(false);
  };

  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPhoto(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadPhoto(e.dataTransfer.files[0]);
      try {
        e.dataTransfer.clearData();
      } catch {
        // Ignore
      }
    }
  };

  const handleSelectFromMediaLibrary = (item: MediaItem) => {
    setFormData((prev) => ({
      ...prev,
      photo: item.url,
    }));
    setShowMediaModal(false);
    setToast({
      type: "success",
      message: "Foto profil dipilih dari Media Library! Klik 'Save Profile' untuk menyimpan.",
    });
  };

  const handleResetPhoto = () => {
    setFormData((prev) => ({
      ...prev,
      photo: "/images/profile_rangga-7ca715.png",
    }));
    setToast({
      type: "info",
      message: "Foto profil dikembalikan ke foto default bawaan.",
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setToast({
        type: "success",
        message: "Pengaturan profil & foto berhasil disimpan secara permanen!",
      });
    } catch (err) {
      console.error("Save profile error:", err);
      setToast({
        type: "error",
        message: "Gagal menyimpan perubahan profil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Experience management handlers
  const handleAddExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      role: "",
      company: "",
      period: "",
      location: "",
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      experiences: [...(prev.experiences || []), newItem],
    }));
  };

  const handleUpdateExperience = (
    index: number,
    field: keyof ExperienceItem,
    value: string
  ) => {
    setFormData((prev) => {
      const list = [...(prev.experiences || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, experiences: list };
    });
  };

  const handleDeleteExperience = (index: number) => {
    setFormData((prev) => {
      const list = (prev.experiences || []).filter((_, idx) => idx !== index);
      return { ...prev, experiences: list };
    });
  };

  // Education management handlers
  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: "",
      institution: "",
      period: "",
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      education: [...(prev.education || []), newItem],
    }));
  };

  const handleUpdateEducation = (
    index: number,
    field: keyof EducationItem,
    value: string
  ) => {
    setFormData((prev) => {
      const list = [...(prev.education || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, education: list };
    });
  };

  const handleDeleteEducation = (index: number) => {
    setFormData((prev) => {
      const list = (prev.education || []).filter((_, idx) => idx !== index);
      return { ...prev, education: list };
    });
  };

  // Certification management handlers
  const handleAddCertification = () => {
    const newItem: CertificationItem = {
      id: `cert-${Date.now()}`,
      title: "",
      issuer: "",
      year: new Date().getFullYear().toString(),
    };
    setFormData((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), newItem],
    }));
  };

  const handleUpdateCertification = (
    index: number,
    field: keyof CertificationItem,
    value: string
  ) => {
    setFormData((prev) => {
      const list = [...(prev.certifications || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, certifications: list };
    });
  };

  const handleDeleteCertification = (index: number) => {
    setFormData((prev) => {
      const list = (prev.certifications || []).filter((_, idx) => idx !== index);
      return { ...prev, certifications: list };
    });
  };

  const filteredMedia = mediaItems.filter(
    (m) =>
      m.fileName.toLowerCase().includes(mediaSearch.toLowerCase()) ||
      m.alt.toLowerCase().includes(mediaSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 pb-16">
      <AdminTopbar
        title="Owner Profile"
        subtitle="Manage public developer bio, avatar portrait, location, and social links"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave()}
            isLoading={isSaving}
            icon={<Check className="w-3.5 h-3.5 stroke-[1.75]" />}
          >
            Save Profile
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

      {/* Media Library Picker Modal */}
      <Modal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        title="Pilih Foto dari Media Library"
        description="Pilih salah satu gambar yang sudah ada di library untuk dijadikan foto profil."
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Cari media..."
              value={mediaSearch}
              onChange={(e) => setMediaSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 max-h-[320px] overflow-y-auto p-1">
            {filteredMedia.length > 0 ? (
              filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectFromMediaLibrary(item)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${
                    formData.photo === item.url
                      ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30"
                      : "border-[var(--border)] hover:border-[var(--primary)]/60 bg-[var(--surface-2)]"
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={item.alt || item.fileName}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold p-1 text-center">
                    Pilih Ini
                  </div>
                  {formData.photo === item.url && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-3 py-8 text-center text-xs text-[var(--text-muted)]">
                Tidak ada media yang cocok.
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowMediaModal(false)}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      <form onSubmit={handleSave} className="p-6 sm:p-8 max-w-4xl flex flex-col gap-6">
        {/* Avatar & Photo Management Card */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-6 shadow-xs">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-[var(--text)]">Profile Photo & Identity</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Foto portrait ini akan ditampilkan di halaman About, header profil, dan sidebar admin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)]">
            {/* Interactive Avatar Card with Drag & Drop */}
            <div
              onDragEnter={handlePhotoDragEnter}
              onDragOver={handlePhotoDragOver}
              onDragLeave={handlePhotoDragLeave}
              onDrop={handlePhotoDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 group shrink-0 shadow-sm ${
                isDraggingPhoto
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 scale-105"
                  : "border-[var(--border)] hover:border-[var(--primary)]/70 bg-[var(--surface)]"
              }`}
              title="Klik atau drag & drop foto baru ke sini"
            >
              <Image
                src={formData.photo || "/images/profile_rangga-7ca715.png"}
                alt={formData.name || "Profile Photo"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white p-2 text-center">
                <Camera className="w-6 h-6 stroke-[1.75] text-[var(--primary)]" />
                <span className="text-[11px] font-semibold">Ganti Foto</span>
                <span className="text-[9px] text-white/80 font-mono-code">Klik / Drop</span>
              </div>

              {/* Uploading Spinner Overlay */}
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
                  <span className="text-[10px] font-medium font-mono-code">Mengunggah...</span>
                </div>
              )}
            </div>

            {/* Hidden HTML5 File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={handleFileInputChange}
              className="hidden"
              id="profile-photo-input"
            />

            {/* Actions & URL Input */}
            <div className="flex-1 flex flex-col gap-3 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploadingPhoto}
                  icon={<UploadCloud className="w-3.5 h-3.5 stroke-[1.75]" />}
                >
                  Upload Foto Baru
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowMediaModal(true)}
                  icon={<ImagePlus className="w-3.5 h-3.5 stroke-[1.75]" />}
                >
                  Pilih dari Media Library
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetPhoto}
                  icon={<RotateCcw className="w-3.5 h-3.5 stroke-[1.75]" />}
                >
                  Reset Foto
                </Button>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-xs font-medium text-[var(--text)]">
                  Photo Path / Image URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    placeholder="/images/profile_rangga.png atau https://..."
                    className="h-9 px-3 rounded-lg text-xs font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring flex-1"
                  />
                </div>
                <span className="text-[11px] text-[var(--text-muted)] font-mono-code">
                  Format didukung: PNG, JPG, WebP hingga 10MB.
                </span>
              </div>
            </div>
          </div>

          {/* Basic Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-2 border-t border-[var(--border)]">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text)]">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 px-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text)]">
                Headline / Title
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) =>
                  setFormData({ ...formData, headline: e.target.value })
                }
                className="h-10 px-3 rounded-lg text-sm font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-[var(--text)]">
                Location & Timezone
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="h-10 px-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>
          </div>
        </div>

        {/* Bio & Availability */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4 shadow-xs">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Biography & Status
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text)]">
              Short Biography (Hero & About)
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="p-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text)]">
                Availability Status Text
              </label>
              <input
                type="text"
                value={formData.availability}
                onChange={(e) =>
                  setFormData({ ...formData, availability: e.target.value })
                }
                className="h-10 px-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text)]">
                Public Indicator
              </label>
              <label className="h-10 px-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between cursor-pointer">
                <span className="text-xs text-[var(--text)]">
                  Show Green Pulse Available Dot
                </span>
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) =>
                    setFormData({ ...formData, isAvailable: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[var(--primary)] focus-ring cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4 shadow-xs">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Contact & Social Profiles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text)]">
                Public Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-10 px-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text)]">
                WhatsApp Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-10 px-3 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text)]">
                GitHub Profile URL
              </label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="h-10 px-3 rounded-lg text-xs font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text)]">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin: e.target.value })
                }
                className="h-10 px-3 rounded-lg text-xs font-mono-code bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
              />
            </div>
          </div>
        </div>

        {/* Work & Engineering Experience Section */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-base font-semibold text-[var(--text)]">
                  Work & Engineering Experience
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Riwayat karier, peran engineering, dan pencapaian yang tampil pada halaman /about
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddExperience}
              icon={<Plus className="w-3.5 h-3.5 stroke-[1.75]" />}
            >
              Tambah Pengalaman
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {formData.experiences && formData.experiences.length > 0 ? (
              formData.experiences.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="p-4 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] flex flex-col gap-3 relative group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
                    <span className="text-xs font-semibold font-mono-code text-[var(--primary)]">
                      Pengalaman #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(idx)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors focus-ring cursor-pointer"
                      title="Hapus riwayat pengalaman ini"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[var(--text)]">
                        Role / Jabatan *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Lead Fullstack & IoT Engineer"
                        value={exp.role}
                        onChange={(e) =>
                          handleUpdateExperience(idx, "role", e.target.value)
                        }
                        required
                        className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[var(--text)]">
                        Perusahaan / Organisasi *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Rangga Labs & Municipal Initiatives"
                        value={exp.company}
                        onChange={(e) =>
                          handleUpdateExperience(idx, "company", e.target.value)
                        }
                        required
                        className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[var(--text)]">
                        Periode *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 2023 — Present"
                        value={exp.period}
                        onChange={(e) =>
                          handleUpdateExperience(idx, "period", e.target.value)
                        }
                        required
                        className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[var(--text)]">
                        Lokasi *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Bandung, Indonesia"
                        value={exp.location}
                        onChange={(e) =>
                          handleUpdateExperience(idx, "location", e.target.value)
                        }
                        required
                        className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--text)]">
                      Deskripsi Peran & Pencapaian
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Jelaskan arsitektur yang dibangun, teknologi utama yang dipakai, dan dampak solusi..."
                      value={exp.description || ""}
                      onChange={(e) =>
                        handleUpdateExperience(idx, "description", e.target.value)
                      }
                      className="p-2.5 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring resize-y leading-relaxed"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 px-4 rounded-xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 text-center bg-[var(--surface-2)]/30">
                <Briefcase className="w-8 h-8 text-[var(--text-muted)] stroke-[1.5]" />
                <p className="text-xs text-[var(--text-muted)]">
                  Belum ada data pengalaman kerja. Klik tombol di bawah untuk menambahkan.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddExperience}
                  icon={<Plus className="w-3.5 h-3.5 stroke-[1.75]" />}
                  className="mt-1"
                >
                  Tambah Riwayat Pengalaman
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-base font-semibold text-[var(--text)]">
                  Education
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Riwayat pendidikan formal atau gelar yang tampil pada halaman /about
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddEducation}
              icon={<Plus className="w-3.5 h-3.5 stroke-[1.75]" />}
            >
              Tambah Pendidikan
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {formData.education && formData.education.length > 0 ? (
              formData.education.map((edu, idx) => (
                <div
                  key={edu.id || idx}
                  className="p-4 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] flex flex-col gap-3 relative group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
                    <span className="text-xs font-semibold font-mono-code text-[var(--primary)]">
                      Pendidikan #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(idx)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors focus-ring cursor-pointer"
                      title="Hapus riwayat pendidikan ini"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1 sm:col-span-1">
                      <label className="text-xs font-medium text-[var(--text)]">
                        Gelar / Jenjang *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Bachelor of Computer Science"
                        value={edu.degree}
                        onChange={(e) =>
                          handleUpdateEducation(idx, "degree", e.target.value)
                        }
                        required
                        className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                      />
                    </div>

                    <div className="flex flex-col gap-1 sm:col-span-1">
                      <label className="text-xs font-medium text-[var(--text)]">
                        Institusi / Universitas *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Universitas di Bandung"
                        value={edu.institution}
                        onChange={(e) =>
                          handleUpdateEducation(idx, "institution", e.target.value)
                        }
                        required
                        className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                      />
                    </div>

                    <div className="flex flex-col gap-1 sm:col-span-1">
                      <label className="text-xs font-medium text-[var(--text)]">
                        Periode *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 2019 — 2023"
                        value={edu.period}
                        onChange={(e) =>
                          handleUpdateEducation(idx, "period", e.target.value)
                        }
                        required
                        className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--text)]">
                      Deskripsi / Fokus Kajian (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Focused on Distributed Systems, Network Architecture, Software Engineering, and Internet of Things."
                      value={edu.description || ""}
                      onChange={(e) =>
                        handleUpdateEducation(idx, "description", e.target.value)
                      }
                      className="p-2.5 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring resize-y leading-relaxed"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 px-4 rounded-xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 text-center bg-[var(--surface-2)]/30">
                <GraduationCap className="w-8 h-8 text-[var(--text-muted)] stroke-[1.5]" />
                <p className="text-xs text-[var(--text-muted)]">
                  Belum ada data pendidikan. Klik tombol di bawah untuk menambahkan.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddEducation}
                  icon={<Plus className="w-3.5 h-3.5 stroke-[1.75]" />}
                  className="mt-1"
                >
                  Tambah Riwayat Pendidikan
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Certifications & Focus Section */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-base font-semibold text-[var(--text)]">
                  Certifications & Focus
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Daftar sertifikasi profesional dan fokus keahlian pada halaman /about
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddCertification}
              icon={<Plus className="w-3.5 h-3.5 stroke-[1.75]" />}
            >
              Tambah Sertifikasi
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {formData.certifications && formData.certifications.length > 0 ? (
              formData.certifications.map((cert, idx) => (
                <div
                  key={cert.id || idx}
                  className="p-4 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] flex flex-col sm:flex-row sm:items-center gap-3 relative group"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1 sm:col-span-1">
                      <label className="text-xs font-medium text-[var(--text)]">
                        Nama Sertifikasi *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Fullstack Web Architecture"
                        value={cert.title}
                        onChange={(e) =>
                          handleUpdateCertification(idx, "title", e.target.value)
                        }
                        required
                        className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                      />
                    </div>

                    <div className="flex flex-col gap-1 sm:col-span-1">
                      <label className="text-xs font-medium text-[var(--text)]">
                        Penerbit / Lembaga *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Advanced Engineering Certification"
                        value={cert.issuer}
                        onChange={(e) =>
                          handleUpdateCertification(idx, "issuer", e.target.value)
                        }
                        required
                        className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                      />
                    </div>

                    <div className="flex flex-col gap-1 sm:col-span-1">
                      <label className="text-xs font-medium text-[var(--text)]">
                        Tahun *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 2023"
                        value={cert.year}
                        onChange={(e) =>
                          handleUpdateCertification(idx, "year", e.target.value)
                        }
                        required
                        className="h-9 px-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                      />
                    </div>
                  </div>

                  <div className="flex sm:self-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteCertification(idx)}
                      className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors focus-ring cursor-pointer"
                      title="Hapus sertifikasi ini"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.75]" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 px-4 rounded-xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 text-center bg-[var(--surface-2)]/30">
                <Award className="w-8 h-8 text-[var(--text-muted)] stroke-[1.5]" />
                <p className="text-xs text-[var(--text-muted)]">
                  Belum ada sertifikasi. Klik tombol di bawah untuk menambahkan.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddCertification}
                  icon={<Plus className="w-3.5 h-3.5 stroke-[1.75]" />}
                  className="mt-1"
                >
                  Tambah Sertifikasi
                </Button>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          type="submit"
          isLoading={isSaving}
          icon={<Check className="w-4 h-4 stroke-[1.75]" />}
          className="self-start"
        >
          Save All Changes
        </Button>
      </form>
    </div>
  );
}
