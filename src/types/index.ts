export type ProjectCategory =
  | "all"
  | "fullstack"
  | "frontend"
  | "backend"
  | "iot"
  | "tools";

export interface ProjectMetric {
  id: string;
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  coverAlt: string;
  category: ProjectCategory;
  categoryDisplay: string;
  role: string;
  year: string;
  clientName?: string;
  clientType?: string;
  techStack: string[];
  liveUrl?: string;
  repoUrl?: string;
  problem: string;
  solution: string;
  result: string;
  metrics: ProjectMetric[];
  gallery: string[];
  featured: boolean;
  order: number;
  status: "published" | "draft";
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: string;
}

export interface Technology {
  id: string;
  name: string;
  slug: string;
  category: "frontend" | "backend" | "database" | "iot" | "tools";
}

export interface MediaItem {
  id: string;
  fileName: string;
  url: string;
  size: string;
  dimensions: string;
  alt: string;
  caption?: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
  status: "new" | "read" | "replied";
}

export interface ExperienceItem {
  id?: string;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
}

export interface EducationItem {
  id?: string;
  degree: string;
  institution: string;
  period: string;
  description?: string;
}

export interface CertificationItem {
  id?: string;
  title: string;
  issuer: string;
  year: string;
}

export interface Profile {
  name: string;
  headline: string;
  bio: string;
  photo: string;
  location: string;
  availability: string;
  isAvailable: boolean;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  socialLinks: {
    platform: string;
    url: string;
  }[];
  experiences?: ExperienceItem[];
  education?: EducationItem[];
  certifications?: CertificationItem[];
}

export interface ResumeSettings {
  fileName: string;
  versionLabel: string;
  fileSize: string;
  updatedAt: string;
  publicUrl: string;
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImage: string;
  contactEmail: string;
  analyticsId?: string;
}
