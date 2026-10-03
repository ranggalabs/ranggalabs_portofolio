import { z } from "zod";

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters long"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters long")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and dashes"),
  summary: z.string().max(160, "Summary cannot exceed 160 characters"),
  coverImage: z.string().min(1, "Cover image path or URL is required"),
  coverAlt: z.string().min(3, "Cover accessibility alt text is required (min 3 chars)"),
  category: z.enum(["all", "fullstack", "frontend", "backend", "iot", "tools"]),
  categoryDisplay: z.string().optional(),
  role: z.string().min(2, "Role is required"),
  year: z.string().min(4, "Valid 4-digit year is required"),
  clientName: z.string().optional(),
  clientType: z.string().optional(),
  techStack: z.array(z.string()).min(1, "At least one technology must be listed"),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  repoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  problem: z.string().optional(),
  solution: z.string().optional(),
  result: z.string().optional(),
  metrics: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  gallery: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  order: z.number().optional(),
  status: z.enum(["published", "draft"]).default("draft"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please provide a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters long").optional(),
  message: z.string().min(10, "Message must be at least 10 characters long"),
  honeypot: z.string().max(0, "Bot detected").optional(),
});

export const mediaSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  url: z.string().min(1, "URL is required"),
  size: z.string().default("0 KB"),
  dimensions: z.string().default("Auto"),
  alt: z.string().min(3, "Accessibility alt text is required (min 3 chars)"),
  caption: z.string().optional(),
});

export const mediaUpdateSchema = z.object({
  alt: z.string().min(3, "Accessibility alt text is required (min 3 chars)").optional(),
  caption: z.string().optional(),
});

export const experienceItemSchema = z.object({
  id: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  company: z.string().min(1, "Company is required"),
  period: z.string().min(1, "Period is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional().default(""),
});

export const educationItemSchema = z.object({
  id: z.string().optional(),
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution is required"),
  period: z.string().min(1, "Period is required"),
  description: z.string().optional().default(""),
});

export const certificationItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  issuer: z.string().min(1, "Issuer is required"),
  year: z.string().min(1, "Year is required"),
});

export const profileSchema = z.object({
  name: z.string().min(2),
  headline: z.string().min(2),
  bio: z.string().min(10),
  photo: z.string(),
  location: z.string(),
  availability: z.string(),
  isAvailable: z.boolean(),
  email: z.string().email(),
  phone: z.string(),
  github: z.string(),
  linkedin: z.string(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string(),
      })
    )
    .optional(),
  experiences: z.array(experienceItemSchema).optional(),
  education: z.array(educationItemSchema).optional(),
  certifications: z.array(certificationItemSchema).optional(),
});

export const resumeSchema = z.object({
  fileName: z.string().min(3),
  versionLabel: z.string().min(2),
  fileSize: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().min(2),
  siteUrl: z.string().url(),
  defaultSeoTitle: z.string().min(3),
  defaultSeoDescription: z.string().min(10),
  defaultOgImage: z.string().min(1),
  contactEmail: z.string().email(),
  analyticsId: z.string().optional(),
});
