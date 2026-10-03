import fs from "fs";
import path from "path";
import {
  Project,
  Profile,
  ResumeSettings,
  SiteSettings,
  MediaItem,
  Inquiry,
} from "@/types";
import {
  initialProjects,
  initialProfile,
  initialResumeSettings,
  initialSiteSettings,
  initialMediaItems,
  initialInquiries,
} from "@/data/initialData";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export interface DatabaseSchema {
  projects: Project[];
  profile: Profile;
  resumeSettings: ResumeSettings;
  siteSettings: SiteSettings;
  mediaItems: MediaItem[];
  inquiries: Inquiry[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// In-memory cache as fallback
let memoryData: DatabaseSchema | null = null;

function ensureDb(): DatabaseSchema {
  if (memoryData) return memoryData;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch {}
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = {
        projects: initialProjects,
        profile: initialProfile,
        resumeSettings: initialResumeSettings,
        siteSettings: initialSiteSettings,
        mediaItems: initialMediaItems,
        inquiries: initialInquiries,
      };
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      } catch {}
      memoryData = initialData;
      return initialData;
    }

    const content = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content) as Partial<DatabaseSchema>;
    const completeData: DatabaseSchema = {
      projects: Array.isArray(parsed.projects) ? parsed.projects : initialProjects,
      profile: parsed.profile
        ? {
            ...initialProfile,
            ...parsed.profile,
            experiences: parsed.profile.experiences || initialProfile.experiences,
            education: parsed.profile.education || initialProfile.education,
            certifications: parsed.profile.certifications || initialProfile.certifications,
          }
        : initialProfile,
      resumeSettings: parsed.resumeSettings
        ? { ...initialResumeSettings, ...parsed.resumeSettings }
        : initialResumeSettings,
      siteSettings: parsed.siteSettings
        ? { ...initialSiteSettings, ...parsed.siteSettings }
        : initialSiteSettings,
      mediaItems: Array.isArray(parsed.mediaItems) ? parsed.mediaItems : initialMediaItems,
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : initialInquiries,
    };

    memoryData = completeData;
    return completeData;
  } catch (e) {
    console.error("Local db reading fallback:", e);
    const fallback: DatabaseSchema = {
      projects: initialProjects,
      profile: initialProfile,
      resumeSettings: initialResumeSettings,
      siteSettings: initialSiteSettings,
      mediaItems: initialMediaItems,
      inquiries: initialInquiries,
    };
    memoryData = fallback;
    return fallback;
  }
}

function writeDb(data: DatabaseSchema) {
  memoryData = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("Local DB write skipped (environment may be read-only):", e);
  }
}

// -------------------------------------------------------------
// Row Converters for Supabase (snake_case <-> camelCase)
// -------------------------------------------------------------

function projectFromRow(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary || "",
    coverImage: row.cover_image || "/images/angkot_to_school-63d994.png",
    coverAlt: row.cover_alt || row.title,
    category: row.category || "fullstack",
    categoryDisplay: row.category_display || (row.category || "fullstack").toUpperCase(),
    role: row.role || "Fullstack Developer",
    year: row.year || "2024",
    clientName: row.client_name || undefined,
    clientType: row.client_type || undefined,
    techStack: Array.isArray(row.tech_stack) ? row.tech_stack : [],
    liveUrl: row.live_url || undefined,
    repoUrl: row.repo_url || undefined,
    problem: row.problem || "",
    solution: row.solution || "",
    result: row.result || "",
    metrics: Array.isArray(row.metrics) ? row.metrics : [],
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    featured: Boolean(row.featured),
    order: typeof row.order === "number" ? row.order : 1,
    status: row.status || "draft",
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    updatedAt: row.updated_at || new Date().toISOString().split("T")[0],
  };
}

function projectToRow(project: Project): Record<string, any> {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    summary: project.summary || "",
    cover_image: project.coverImage || "",
    cover_alt: project.coverAlt || project.title,
    category: project.category || "fullstack",
    category_display: project.categoryDisplay || (project.category || "fullstack").toUpperCase(),
    role: project.role || "Fullstack Developer",
    year: project.year || new Date().getFullYear().toString(),
    client_name: project.clientName || null,
    client_type: project.clientType || null,
    tech_stack: project.techStack || [],
    live_url: project.liveUrl || null,
    repo_url: project.repoUrl || null,
    problem: project.problem || "",
    solution: project.solution || "",
    result: project.result || "",
    metrics: project.metrics || [],
    gallery: project.gallery || [],
    featured: project.featured ?? false,
    order: project.order ?? 1,
    status: project.status || "draft",
    seo_title: project.seoTitle || null,
    seo_description: project.seoDescription || null,
    updated_at: project.updatedAt || new Date().toISOString().split("T")[0],
  };
}

function profileFromRow(row: any): Profile {
  return {
    name: row.name || initialProfile.name,
    headline: row.headline || initialProfile.headline,
    bio: row.bio || initialProfile.bio,
    photo: row.photo || initialProfile.photo,
    location: row.location || initialProfile.location,
    availability: row.availability || initialProfile.availability,
    isAvailable: row.is_available ?? initialProfile.isAvailable,
    email: row.email || initialProfile.email,
    phone: row.phone || initialProfile.phone,
    github: row.github || initialProfile.github,
    linkedin: row.linkedin || initialProfile.linkedin,
    socialLinks: Array.isArray(row.social_links) ? row.social_links : initialProfile.socialLinks,
    experiences: Array.isArray(row.experiences) ? row.experiences : initialProfile.experiences,
    education: Array.isArray(row.education) ? row.education : initialProfile.education,
    certifications: Array.isArray(row.certifications) ? row.certifications : initialProfile.certifications,
  };
}

function profileToRow(profile: Profile): Record<string, any> {
  return {
    id: "default",
    name: profile.name,
    headline: profile.headline,
    bio: profile.bio,
    photo: profile.photo,
    location: profile.location,
    availability: profile.availability,
    is_available: profile.isAvailable,
    email: profile.email,
    phone: profile.phone,
    github: profile.github,
    linkedin: profile.linkedin,
    social_links: profile.socialLinks || [],
    experiences: profile.experiences || [],
    education: profile.education || [],
    certifications: profile.certifications || [],
  };
}

function resumeFromRow(row: any): ResumeSettings {
  return {
    fileName: row.file_name || initialResumeSettings.fileName,
    versionLabel: row.version_label || initialResumeSettings.versionLabel,
    fileSize: row.file_size || initialResumeSettings.fileSize,
    updatedAt: row.updated_at || initialResumeSettings.updatedAt,
    publicUrl: row.public_url || initialResumeSettings.publicUrl,
  };
}

function resumeToRow(resume: ResumeSettings): Record<string, any> {
  return {
    id: "default",
    file_name: resume.fileName,
    version_label: resume.versionLabel,
    file_size: resume.fileSize,
    updated_at: resume.updatedAt,
    public_url: resume.publicUrl,
  };
}

function siteSettingsFromRow(row: any): SiteSettings {
  return {
    siteName: row.site_name || initialSiteSettings.siteName,
    siteUrl: row.site_url || initialSiteSettings.siteUrl,
    defaultSeoTitle: row.default_seo_title || initialSiteSettings.defaultSeoTitle,
    defaultSeoDescription: row.default_seo_description || initialSiteSettings.defaultSeoDescription,
    defaultOgImage: row.default_og_image || initialSiteSettings.defaultOgImage,
    contactEmail: row.contact_email || initialSiteSettings.contactEmail,
    analyticsId: row.analytics_id || initialSiteSettings.analyticsId,
  };
}

function siteSettingsToRow(settings: SiteSettings): Record<string, any> {
  return {
    id: "default",
    site_name: settings.siteName,
    site_url: settings.siteUrl,
    default_seo_title: settings.defaultSeoTitle,
    default_seo_description: settings.defaultSeoDescription,
    default_og_image: settings.defaultOgImage,
    contact_email: settings.contactEmail,
    analytics_id: settings.analyticsId || "",
  };
}

function mediaFromRow(row: any): MediaItem {
  return {
    id: row.id,
    fileName: row.file_name,
    url: row.url,
    size: row.size || "0 KB",
    dimensions: row.dimensions || "Auto",
    alt: row.alt || "",
    caption: row.caption || undefined,
    createdAt: row.created_at || new Date().toISOString().split("T")[0],
  };
}

function mediaToRow(item: MediaItem): Record<string, any> {
  return {
    id: item.id,
    file_name: item.fileName,
    url: item.url,
    size: item.size,
    dimensions: item.dimensions,
    alt: item.alt,
    caption: item.caption || null,
    created_at: item.createdAt,
  };
}

function inquiryFromRow(row: any): Inquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject || undefined,
    message: row.message,
    createdAt: row.created_at || new Date().toISOString(),
    status: row.status || "new",
  };
}

function inquiryToRow(inquiry: Inquiry): Record<string, any> {
  return {
    id: inquiry.id,
    name: inquiry.name,
    email: inquiry.email,
    subject: inquiry.subject || null,
    message: inquiry.message,
    created_at: inquiry.createdAt,
    status: inquiry.status || "new",
  };
}

// -------------------------------------------------------------
// Unified Database Interface (Supabase with Local JSON fallback)
// -------------------------------------------------------------

export const db = {
  // --- PROJECTS ---
  async getProjects(options?: {
    status?: "published" | "draft" | "all";
    category?: string;
    featured?: boolean;
    search?: string;
  }): Promise<Project[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        let query = supabase.from("projects").select("*").order("order", { ascending: true });

        if (options?.status && options.status !== "all") {
          query = query.eq("status", options.status);
        }
        if (options?.category && options.category !== "all") {
          query = query.eq("category", options.category);
        }
        if (options?.featured !== undefined) {
          query = query.eq("featured", options.featured);
        }
        if (options?.search && options.search.trim()) {
          query = query.or(
            `title.ilike.%${options.search}%,summary.ilike.%${options.search}%`
          );
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(projectFromRow);
        }
        console.warn("Supabase getProjects error, falling back to local:", error);
      }
    }

    // Local fallback
    const data = ensureDb();
    let result = data.projects;

    if (options?.status && options.status !== "all") {
      result = result.filter((p) => p.status === options.status);
    }
    if (options?.category && options.category !== "all") {
      result = result.filter((p) => p.category === options.category);
    }
    if (options?.featured !== undefined) {
      result = result.filter((p) => p.featured === options.featured);
    }
    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.techStack.some((t) => t.toLowerCase().includes(q))
      );
    }

    return [...result].sort((a, b) => a.order - b.order);
  },

  async getProject(idOrSlug: string): Promise<Project | undefined> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
          .maybeSingle();

        if (!error && data) {
          return projectFromRow(data);
        }
      }
    }

    const data = ensureDb();
    return data.projects.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  },

  async saveProject(project: Partial<Project> & { title: string }): Promise<Project> {
    const now = new Date().toISOString().split("T")[0];
    const data = ensureDb();

    const existing = project.id ? await this.getProject(project.id) : undefined;
    const slug =
      project.slug ||
      project.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const completeProject: Project = {
      id: project.id || `proj-${Date.now()}`,
      title: project.title,
      slug,
      summary: project.summary || "",
      coverImage: project.coverImage || "/images/angkot_to_school-63d994.png",
      coverAlt: project.coverAlt || project.title,
      category: project.category || "fullstack",
      categoryDisplay: project.categoryDisplay || (project.category || "fullstack").toUpperCase(),
      role: project.role || "Fullstack Developer",
      year: project.year || new Date().getFullYear().toString(),
      clientName: project.clientName,
      clientType: project.clientType,
      techStack: project.techStack || ["Next.js", "TypeScript"],
      liveUrl: project.liveUrl,
      repoUrl: project.repoUrl,
      problem: project.problem || "",
      solution: project.solution || "",
      result: project.result || "",
      metrics: project.metrics || [],
      gallery: project.gallery || [],
      featured: project.featured ?? false,
      order: project.order ?? (existing?.order || data.projects.length + 1),
      status: project.status || "draft",
      seoTitle: project.seoTitle,
      seoDescription: project.seoDescription,
      updatedAt: now,
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const row = projectToRow(completeProject);
        const { data: upserted, error } = await supabase
          .from("projects")
          .upsert(row, { onConflict: "id" })
          .select()
          .single();

        if (!error && upserted) {
          // Also update local cache
          const idx = data.projects.findIndex((p) => p.id === completeProject.id);
          if (idx >= 0) {
            data.projects[idx] = completeProject;
          } else {
            data.projects.unshift(completeProject);
          }
          writeDb(data);
          return projectFromRow(upserted);
        }
        console.error("Supabase saveProject error:", error);
      }
    }

    // Local save
    const existingIndex = data.projects.findIndex((p) => p.id === completeProject.id);
    if (existingIndex >= 0) {
      data.projects[existingIndex] = completeProject;
    } else {
      data.projects.unshift(completeProject);
    }
    writeDb(data);
    return completeProject;
  },

  async deleteProject(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (!error) {
          const data = ensureDb();
          data.projects = data.projects.filter((p) => p.id !== id);
          writeDb(data);
          return true;
        }
        console.error("Supabase deleteProject error:", error);
      }
    }

    const data = ensureDb();
    const prevLen = data.projects.length;
    data.projects = data.projects.filter((p) => p.id !== id);
    if (data.projects.length !== prevLen) {
      writeDb(data);
      return true;
    }
    return false;
  },

  // --- MEDIA ---
  async getMedia(): Promise<MediaItem[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("media_items")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          return data.map(mediaFromRow);
        }
      }
    }

    const data = ensureDb();
    return data.mediaItems;
  },

  async addMedia(item: Omit<MediaItem, "id" | "createdAt">): Promise<MediaItem> {
    const newItem: MediaItem = {
      ...item,
      id: `med-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const row = mediaToRow(newItem);
        const { data: inserted, error } = await supabase
          .from("media_items")
          .insert(row)
          .select()
          .single();

        if (!error && inserted) {
          const data = ensureDb();
          data.mediaItems.unshift(newItem);
          writeDb(data);
          return mediaFromRow(inserted);
        }
        console.error("Supabase addMedia error:", error);
      }
    }

    const data = ensureDb();
    data.mediaItems.unshift(newItem);
    writeDb(data);
    return newItem;
  },

  async updateMedia(id: string, partial: Partial<MediaItem>): Promise<MediaItem | null> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const updateData: Record<string, any> = {};
        if (partial.alt !== undefined) updateData.alt = partial.alt;
        if (partial.caption !== undefined) updateData.caption = partial.caption;

        const { data, error } = await supabase
          .from("media_items")
          .update(updateData)
          .eq("id", id)
          .select()
          .maybeSingle();

        if (!error && data) {
          const updated = mediaFromRow(data);
          const localData = ensureDb();
          const idx = localData.mediaItems.findIndex((m) => m.id === id);
          if (idx >= 0) {
            localData.mediaItems[idx] = updated;
            writeDb(localData);
          }
          return updated;
        }
      }
    }

    const data = ensureDb();
    const idx = data.mediaItems.findIndex((m) => m.id === id);
    if (idx < 0) return null;
    data.mediaItems[idx] = { ...data.mediaItems[idx], ...partial };
    writeDb(data);
    return data.mediaItems[idx];
  },

  async deleteMedia(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase.from("media_items").delete().eq("id", id);
        if (!error) {
          const data = ensureDb();
          data.mediaItems = data.mediaItems.filter((m) => m.id !== id);
          writeDb(data);
          return true;
        }
      }
    }

    const data = ensureDb();
    const prev = data.mediaItems.length;
    data.mediaItems = data.mediaItems.filter((m) => m.id !== id);
    if (data.mediaItems.length !== prev) {
      writeDb(data);
      return true;
    }
    return false;
  },

  // --- RESUME ---
  async getResume(): Promise<ResumeSettings> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("resume_settings")
          .select("*")
          .eq("id", "default")
          .maybeSingle();

        if (!error && data) {
          return resumeFromRow(data);
        }
      }
    }

    const data = ensureDb();
    return data.resumeSettings;
  },

  async updateResume(partial: Partial<ResumeSettings>): Promise<ResumeSettings> {
    const current = await this.getResume();
    const updated: ResumeSettings = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const row = resumeToRow(updated);
        const { data, error } = await supabase
          .from("resume_settings")
          .upsert(row, { onConflict: "id" })
          .select()
          .single();

        if (!error && data) {
          const localData = ensureDb();
          localData.resumeSettings = updated;
          writeDb(localData);
          return resumeFromRow(data);
        }
        console.error("Supabase updateResume error:", error);
      }
    }

    const data = ensureDb();
    data.resumeSettings = updated;
    writeDb(data);
    return updated;
  },

  // --- PROFILE ---
  async getProfile(): Promise<Profile> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("profile")
          .select("*")
          .eq("id", "default")
          .maybeSingle();

        if (!error && data) {
          return profileFromRow(data);
        }
      }
    }

    const data = ensureDb();
    return data.profile;
  },

  async updateProfile(updatedPartial: Partial<Profile>): Promise<Profile> {
    const current = await this.getProfile();
    const updated: Profile = {
      ...current,
      ...updatedPartial,
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const row = profileToRow(updated);
        const { data, error } = await supabase
          .from("profile")
          .upsert(row, { onConflict: "id" })
          .select()
          .single();

        if (!error && data) {
          const localData = ensureDb();
          localData.profile = updated;
          writeDb(localData);
          return profileFromRow(data);
        }
        console.error("Supabase updateProfile error:", error);
      }
    }

    const data = ensureDb();
    data.profile = updated;
    writeDb(data);
    return data.profile;
  },

  // --- SETTINGS ---
  async getSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("id", "default")
          .maybeSingle();

        if (!error && data) {
          return siteSettingsFromRow(data);
        }
      }
    }

    const data = ensureDb();
    return data.siteSettings;
  },

  async updateSettings(updatedPartial: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const updated: SiteSettings = {
      ...current,
      ...updatedPartial,
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const row = siteSettingsToRow(updated);
        const { data, error } = await supabase
          .from("site_settings")
          .upsert(row, { onConflict: "id" })
          .select()
          .single();

        if (!error && data) {
          const localData = ensureDb();
          localData.siteSettings = updated;
          writeDb(localData);
          return siteSettingsFromRow(data);
        }
        console.error("Supabase updateSettings error:", error);
      }
    }

    const data = ensureDb();
    data.siteSettings = updated;
    writeDb(data);
    return data.siteSettings;
  },

  // --- INQUIRIES ---
  async getInquiries(): Promise<Inquiry[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("inquiries")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          return data.map(inquiryFromRow);
        }
      }
    }

    const data = ensureDb();
    return data.inquiries;
  },

  async addInquiry(
    inquiry: Omit<Inquiry, "id" | "createdAt" | "status">
  ): Promise<Inquiry> {
    const newInq: Inquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "new",
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const row = inquiryToRow(newInq);
        const { data: inserted, error } = await supabase
          .from("inquiries")
          .insert(row)
          .select()
          .single();

        if (!error && inserted) {
          const data = ensureDb();
          data.inquiries.unshift(newInq);
          writeDb(data);
          return inquiryFromRow(inserted);
        }
        console.error("Supabase addInquiry error:", error);
      }
    }

    const data = ensureDb();
    data.inquiries.unshift(newInq);
    writeDb(data);
    return newInq;
  },

  async updateInquiryStatus(
    id: string,
    status: "new" | "read" | "replied"
  ): Promise<Inquiry | null> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("inquiries")
          .update({ status })
          .eq("id", id)
          .select()
          .maybeSingle();

        if (!error && data) {
          const updated = inquiryFromRow(data);
          const localData = ensureDb();
          const idx = localData.inquiries.findIndex((i) => i.id === id);
          if (idx >= 0) {
            localData.inquiries[idx] = updated;
            writeDb(localData);
          }
          return updated;
        }
      }
    }

    const data = ensureDb();
    const idx = data.inquiries.findIndex((i) => i.id === id);
    if (idx < 0) return null;
    data.inquiries[idx].status = status;
    writeDb(data);
    return data.inquiries[idx];
  },

  async deleteInquiry(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase.from("inquiries").delete().eq("id", id);
        if (!error) {
          const data = ensureDb();
          data.inquiries = data.inquiries.filter((i) => i.id !== id);
          writeDb(data);
          return true;
        }
      }
    }

    const data = ensureDb();
    const prev = data.inquiries.length;
    data.inquiries = data.inquiries.filter((i) => i.id !== id);
    if (data.inquiries.length !== prev) {
      writeDb(data);
      return true;
    }
    return false;
  },
};
