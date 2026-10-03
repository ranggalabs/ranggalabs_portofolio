"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  Project,
  Profile,
  ResumeSettings,
  SiteSettings,
  MediaItem,
  Inquiry,
} from "@/types";

const defaultProfile: Profile = {
  name: "Rangga Prasetya",
  headline: "Fullstack Developer & IoT Engineer",
  bio: "",
  photo: "/images/profile_rangga-7ca715.png",
  location: "Bandung, Indonesia",
  email: "rangga@dealwithrangga.my.id",
  phone: "+62 812-3456-7890",
  github: "https://github.com/ranggaprasetya",
  linkedin: "https://linkedin.com/in/ranggaprasetya",
  availability: "Available for contract",
  isAvailable: true,
  socialLinks: [],
};

const defaultResumeSettings: ResumeSettings = {
  versionLabel: "v2024.2",
  fileName: "CV_Rangga_Prasetya_Fullstack.pdf",
  publicUrl: "/CV_Rangga_Prasetya_Fullstack.pdf",
  fileSize: "1.2 MB",
  updatedAt: "October 2024",
};

const defaultSiteSettings: SiteSettings = {
  siteName: "Rangga Prasetya Portfolio",
  siteUrl: "https://dealwithrangga.my.id",
  defaultSeoTitle: "Rangga Prasetya — Fullstack Developer",
  defaultSeoDescription: "Fullstack developer portfolio",
  defaultOgImage: "/images/angkot_to_school-63d994.png",
  contactEmail: "rangga@dealwithrangga.my.id",
};

interface PortfolioContextType {
  projects: Project[];
  profile: Profile;
  resumeSettings: ResumeSettings;
  siteSettings: SiteSettings;
  mediaItems: MediaItem[];
  inquiries: Inquiry[];
  isLoading: boolean;
  getProjectBySlug: (slug: string) => Project | undefined;
  getProjectById: (id: string) => Project | undefined;
  saveProject: (project: Project) => Promise<Project | void>;
  deleteProject: (id: string) => Promise<void>;
  updateProfile: (updated: Profile) => Promise<void>;
  updateResumeSettings: (updated: Partial<ResumeSettings>, skipApi?: boolean) => Promise<void>;
  updateSiteSettings: (updated: Partial<SiteSettings>) => Promise<void>;
  addMediaItem: (item: Omit<MediaItem, "id" | "createdAt">) => Promise<MediaItem | void>;
  updateMediaItem: (id: string, updated: Partial<MediaItem>) => Promise<void>;
  deleteMediaItem: (id: string) => Promise<void>;
  addInquiry: (inquiry: Omit<Inquiry, "id" | "createdAt" | "status">) => Promise<void>;
  markInquiryRead: (id: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  resetToDefault: () => void;
  refreshData: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export interface PortfolioInitialData {
  projects?: Project[];
  profile?: Profile;
  resumeSettings?: ResumeSettings;
  siteSettings?: SiteSettings;
  mediaItems?: MediaItem[];
  inquiries?: Inquiry[];
}

export function PortfolioProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: PortfolioInitialData;
}) {
  const [projects, setProjects] = useState<Project[]>(() => initialData?.projects || []);
  const [profile, setProfile] = useState<Profile>(() => initialData?.profile || defaultProfile);
  const [resumeSettings, setResumeSettings] = useState<ResumeSettings>(() => initialData?.resumeSettings || defaultResumeSettings);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => initialData?.siteSettings || defaultSiteSettings);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => initialData?.mediaItems || []);
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => initialData?.inquiries || []);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state if server passes updated initialData on navigation
  useEffect(() => {
    if (initialData?.profile) setProfile(initialData.profile);
    if (initialData?.projects) setProjects(initialData.projects);
    if (initialData?.resumeSettings) setResumeSettings(initialData.resumeSettings);
    if (initialData?.siteSettings) setSiteSettings(initialData.siteSettings);
    if (initialData?.mediaItems) setMediaItems(initialData.mediaItems);
  }, [initialData]);

  // Fetch initial data from backend API
  const refreshData = useCallback(async () => {
    try {
      const [projRes, mediaRes, profRes, resumeRes, setRes, inqRes] =
        await Promise.allSettled([
          fetch(`/api/projects?status=all&_t=${Date.now()}`, { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
          fetch(`/api/media?_t=${Date.now()}`, { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
          fetch(`/api/profile?_t=${Date.now()}`, { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
          fetch(`/api/resume?_t=${Date.now()}`, { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
          fetch(`/api/settings?_t=${Date.now()}`, { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
          fetch(`/api/inquiries?_t=${Date.now()}`, { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
        ]);

      if (projRes.status === "fulfilled" && projRes.value?.success && projRes.value?.data) {
        setProjects(projRes.value.data);
      }
      if (mediaRes.status === "fulfilled" && mediaRes.value?.success && mediaRes.value?.data) {
        setMediaItems(mediaRes.value.data);
      }
      if (profRes.status === "fulfilled" && profRes.value?.success && profRes.value?.data) {
        setProfile(profRes.value.data);
      }
      if (resumeRes.status === "fulfilled" && resumeRes.value?.success && resumeRes.value?.data) {
        setResumeSettings(resumeRes.value.data);
      }
      if (setRes.status === "fulfilled" && setRes.value?.success && setRes.value?.data) {
        setSiteSettings(setRes.value.data);
      }
      if (inqRes.status === "fulfilled" && inqRes.value?.success && inqRes.value?.data) {
        setInquiries(inqRes.value.data);
      }
    } catch (e) {
      console.warn("Backend API sync notice: Using localized cache", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      refreshData();
    } else {
      setIsLoading(false);
    }
  }, [initialData, refreshData]);

  const getProjectBySlug = (slug: string) => {
    return projects.find((p) => p.slug === slug);
  };

  const getProjectById = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  const saveProject = async (project: Project): Promise<Project | void> => {
    const isExisting = projects.some((p) => p.id === project.id);
    const now = new Date().toISOString().split("T")[0];

    // Optimistic UI update
    setProjects((prev) => {
      const exists = prev.findIndex((p) => p.id === project.id);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = { ...project, updatedAt: now };
        return next;
      } else {
        return [
          {
            ...project,
            id: project.id || `proj-${Date.now()}`,
            order: prev.length + 1,
            updatedAt: now,
          },
          ...prev,
        ];
      }
    });

    try {
      const url = isExisting ? `/api/projects/${project.id}` : "/api/projects";
      const method = isExisting ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });

      const json = await res.json();
      if (json.success && json.data) {
        // Sync with verified backend data
        setProjects((prev) =>
          prev.map((p) => (p.id === json.data.id || p.id === project.id ? json.data : p))
        );
        return json.data;
      }
    } catch (err) {
      console.error("Failed to persist project to backend:", err);
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    const res = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
      headers: { "Cache-Control": "no-cache" },
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      const errorMsg =
        json?.error?.message ||
        `Gagal menghapus project dari server (HTTP ${res.status}).`;
      console.error("Delete project server response error:", json);
      throw new Error(errorMsg);
    }

    // Only update local state if backend deletion succeeded
    setProjects((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
  };

  const updateProfile = async (updated: Profile) => {
    // Optimistic UI update
    setProfile(updated);

    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("Failed to persist profile to backend:", err);
    }
  };

  const updateResumeSettings = async (updated: Partial<ResumeSettings>, skipApi = false) => {
    const nextResume = {
      ...resumeSettings,
      ...updated,
      updatedAt: updated.updatedAt || new Date().toISOString().split("T")[0],
    };
    setResumeSettings(nextResume);

    if (!skipApi) {
      try {
        await fetch("/api/resume", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextResume),
        });
      } catch (err) {
        console.error("Failed to persist resume settings to backend:", err);
      }
    }
  };

  const updateSiteSettings = async (updated: Partial<SiteSettings>) => {
    const nextSite = { ...siteSettings, ...updated };
    setSiteSettings(nextSite);

    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextSite),
      });
    } catch (err) {
      console.error("Failed to persist site settings to backend:", err);
    }
  };

  const addMediaItem = async (item: Omit<MediaItem, "id" | "createdAt">): Promise<MediaItem | void> => {
    const tempItem: MediaItem = {
      ...item,
      id: `med-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setMediaItems((prev) => [tempItem, ...prev]);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMediaItems((prev) =>
          prev.map((m) => (m.id === tempItem.id ? json.data : m))
        );
        return json.data;
      }
    } catch (err) {
      console.error("Failed to save media item to backend:", err);
    }
  };

  const updateMediaItem = async (id: string, updated: Partial<MediaItem>) => {
    setMediaItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
    );

    try {
      await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error(`Failed to update media item ${id}:`, err);
    }
  };

  const deleteMediaItem = async (id: string) => {
    setMediaItems((prev) => prev.filter((m) => m.id !== id));

    try {
      await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(`Failed to delete media item ${id}:`, err);
    }
  };

  const addInquiry = async (inquiry: Omit<Inquiry, "id" | "createdAt" | "status">) => {
    const tempInq: Inquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "new",
    };
    setInquiries((prev) => [tempInq, ...prev]);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiry),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === tempInq.id ? json.data : i))
        );
      }
    } catch (err) {
      console.error("Failed to post inquiry to backend:", err);
    }
  };

  const markInquiryRead = async (id: string) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: "read" } : inq))
    );

    try {
      await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
    } catch (err) {
      console.error(`Failed to mark inquiry ${id} as read:`, err);
    }
  };

  const deleteInquiry = async (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));

    try {
      await fetch(`/api/inquiries/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(`Failed to delete inquiry ${id}:`, err);
    }
  };

  const resetToDefault = () => {
    refreshData();
  };

  return (
    <PortfolioContext.Provider
      value={{
        projects,
        profile,
        resumeSettings,
        siteSettings,
        mediaItems,
        inquiries,
        isLoading,
        getProjectBySlug,
        getProjectById,
        saveProject,
        deleteProject,
        updateProfile,
        updateResumeSettings,
        updateSiteSettings,
        addMediaItem,
        updateMediaItem,
        deleteMediaItem,
        addInquiry,
        markInquiryRead,
        deleteInquiry,
        resetToDefault,
        refreshData,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
