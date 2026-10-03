import fs from "fs";
import path from "path";

const db = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "db.json"), "utf8"));

let sql = `-- ==============================================================
-- RANGGALABS PORTFOLIO - SUPABASE DATABASE SCHEMA & MIGRATION
-- Run this entire script in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  cover_alt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'fullstack',
  category_display TEXT NOT NULL DEFAULT 'FULLSTACK',
  role TEXT NOT NULL DEFAULT 'Fullstack Developer',
  year TEXT NOT NULL DEFAULT '2024',
  client_name TEXT,
  client_type TEXT,
  tech_stack JSONB NOT NULL DEFAULT '[]'::jsonb,
  live_url TEXT,
  repo_url TEXT,
  problem TEXT DEFAULT '',
  solution TEXT DEFAULT '',
  result TEXT DEFAULT '',
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  updated_at TEXT NOT NULL DEFAULT (to_char(now(), 'YYYY-MM-DD'))
);

-- Profile Table
CREATE TABLE IF NOT EXISTS public.profile (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL,
  headline TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  photo TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  availability TEXT NOT NULL DEFAULT '',
  is_available BOOLEAN NOT NULL DEFAULT true,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  github TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '',
  social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  experiences JSONB NOT NULL DEFAULT '[]'::jsonb,
  education JSONB NOT NULL DEFAULT '[]'::jsonb,
  certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Resume Settings Table
CREATE TABLE IF NOT EXISTS public.resume_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  file_name TEXT NOT NULL DEFAULT 'CV_Rangga_Prasetya.pdf',
  version_label TEXT NOT NULL DEFAULT 'v2.4-Latest',
  file_size TEXT NOT NULL DEFAULT '1.2 MB',
  updated_at TEXT NOT NULL DEFAULT (to_char(now(), 'YYYY-MM-DD')),
  public_url TEXT NOT NULL DEFAULT '/cv.pdf'
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name TEXT NOT NULL DEFAULT 'Rangga Prasetya',
  site_url TEXT NOT NULL DEFAULT 'https://ranggaprasetya.dev',
  default_seo_title TEXT NOT NULL DEFAULT 'Rangga Prasetya — Fullstack Developer',
  default_seo_description TEXT NOT NULL DEFAULT 'Crafting scalable web systems & smart digital solutions.',
  default_og_image TEXT NOT NULL DEFAULT '/images/angkot_to_school-63d994.png',
  contact_email TEXT NOT NULL DEFAULT 'rangga.prasetya@example.com',
  analytics_id TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Media Items Table
CREATE TABLE IF NOT EXISTS public.media_items (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  url TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT '0 KB',
  dimensions TEXT NOT NULL DEFAULT 'Auto',
  alt TEXT NOT NULL DEFAULT '',
  caption TEXT,
  created_at TEXT NOT NULL DEFAULT (to_char(now(), 'YYYY-MM-DD'))
);

-- Inquiries Table (Contact Form)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_order ON public.projects ("order");
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public read access to content
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read profile" ON public.profile;
CREATE POLICY "Public read profile" ON public.profile FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read resume_settings" ON public.resume_settings;
CREATE POLICY "Public read resume_settings" ON public.resume_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read media_items" ON public.media_items;
CREATE POLICY "Public read media_items" ON public.media_items FOR SELECT USING (true);

-- Allow public insert to inquiries (contact form submissions)
DROP POLICY IF EXISTS "Public insert inquiries" ON public.inquiries;
CREATE POLICY "Public insert inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);

-- Service role bypasses RLS automatically, but we also explicitly permit all operations
DROP POLICY IF EXISTS "Service role projects" ON public.projects;
CREATE POLICY "Service role projects" ON public.projects FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role profile" ON public.profile;
CREATE POLICY "Service role profile" ON public.profile FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role resume_settings" ON public.resume_settings;
CREATE POLICY "Service role resume_settings" ON public.resume_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role site_settings" ON public.site_settings;
CREATE POLICY "Service role site_settings" ON public.site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role media_items" ON public.media_items;
CREATE POLICY "Service role media_items" ON public.media_items FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role inquiries" ON public.inquiries;
CREATE POLICY "Service role inquiries" ON public.inquiries FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. STORAGE BUCKET CONFIGURATION
-- Creates 'portfolio' bucket with public access for uploaded images and CV
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Public Portfolio Storage Access" ON storage.objects;
CREATE POLICY "Public Portfolio Storage Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Service Role Upload Access" ON storage.objects;
CREATE POLICY "Service Role Upload Access" ON storage.objects
  FOR INSERT TO service_role WITH CHECK (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Service Role Modify Access" ON storage.objects;
CREATE POLICY "Service Role Modify Access" ON storage.objects
  FOR ALL TO service_role USING (bucket_id = 'portfolio');

-- ==============================================================
-- 6. INITIAL SEED DATA
-- ==============================================================
`;

function esc(val) {
  if (val === null || val === undefined) return "NULL";
  return "'" + String(val).replace(/'/g, "''") + "'";
}

function jsonEsc(val) {
  if (val === null || val === undefined) return "'[]'::jsonb";
  return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
}

// Seed Profile
if (db.profile) {
  const p = db.profile;
  sql += `
-- Insert Profile
INSERT INTO public.profile (id, name, headline, bio, photo, location, availability, is_available, email, phone, github, linkedin, social_links, experiences, education, certifications)
VALUES (
  'default',
  ${esc(p.name)},
  ${esc(p.headline)},
  ${esc(p.bio)},
  ${esc(p.photo)},
  ${esc(p.location)},
  ${esc(p.availability)},
  ${Boolean(p.isAvailable)},
  ${esc(p.email)},
  ${esc(p.phone)},
  ${esc(p.github)},
  ${esc(p.linkedin)},
  ${jsonEsc(p.socialLinks)},
  ${jsonEsc(p.experiences)},
  ${jsonEsc(p.education)},
  ${jsonEsc(p.certifications)}
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  photo = EXCLUDED.photo,
  location = EXCLUDED.location,
  availability = EXCLUDED.availability,
  is_available = EXCLUDED.is_available,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  github = EXCLUDED.github,
  linkedin = EXCLUDED.linkedin,
  social_links = EXCLUDED.social_links,
  experiences = EXCLUDED.experiences,
  education = EXCLUDED.education,
  certifications = EXCLUDED.certifications;
`;
}

// Seed Resume
if (db.resumeSettings) {
  const r = db.resumeSettings;
  sql += `
-- Insert Resume Settings
INSERT INTO public.resume_settings (id, file_name, version_label, file_size, updated_at, public_url)
VALUES (
  'default',
  ${esc(r.fileName)},
  ${esc(r.versionLabel)},
  ${esc(r.fileSize)},
  ${esc(r.updatedAt)},
  ${esc(r.publicUrl)}
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  version_label = EXCLUDED.version_label,
  file_size = EXCLUDED.file_size,
  updated_at = EXCLUDED.updated_at,
  public_url = EXCLUDED.public_url;
`;
}

// Seed Site Settings
if (db.siteSettings) {
  const s = db.siteSettings;
  sql += `
-- Insert Site Settings
INSERT INTO public.site_settings (id, site_name, site_url, default_seo_title, default_seo_description, default_og_image, contact_email, analytics_id)
VALUES (
  'default',
  ${esc(s.siteName)},
  ${esc(s.siteUrl)},
  ${esc(s.defaultSeoTitle)},
  ${esc(s.defaultSeoDescription)},
  ${esc(s.defaultOgImage)},
  ${esc(s.contactEmail)},
  ${esc(s.analyticsId || "")}
)
ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  site_url = EXCLUDED.site_url,
  default_seo_title = EXCLUDED.default_seo_title,
  default_seo_description = EXCLUDED.default_seo_description,
  default_og_image = EXCLUDED.default_og_image,
  contact_email = EXCLUDED.contact_email,
  analytics_id = EXCLUDED.analytics_id;
`;
}

// Seed Projects
if (db.projects && db.projects.length) {
  sql += `
-- Insert Projects
`;
  for (const proj of db.projects) {
    sql += `INSERT INTO public.projects (id, title, slug, summary, cover_image, cover_alt, category, category_display, role, year, client_name, client_type, tech_stack, live_url, repo_url, problem, solution, result, metrics, gallery, featured, "order", status, seo_title, seo_description, updated_at)
VALUES (
  ${esc(proj.id)},
  ${esc(proj.title)},
  ${esc(proj.slug)},
  ${esc(proj.summary)},
  ${esc(proj.coverImage)},
  ${esc(proj.coverAlt)},
  ${esc(proj.category)},
  ${esc(proj.categoryDisplay)},
  ${esc(proj.role)},
  ${esc(proj.year)},
  ${esc(proj.clientName)},
  ${esc(proj.clientType)},
  ${jsonEsc(proj.techStack)},
  ${esc(proj.liveUrl)},
  ${esc(proj.repoUrl)},
  ${esc(proj.problem)},
  ${esc(proj.solution)},
  ${esc(proj.result)},
  ${jsonEsc(proj.metrics)},
  ${jsonEsc(proj.gallery)},
  ${Boolean(proj.featured)},
  ${Number(proj.order) || 1},
  ${esc(proj.status)},
  ${esc(proj.seoTitle)},
  ${esc(proj.seoDescription)},
  ${esc(proj.updatedAt)}
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  summary = EXCLUDED.summary,
  cover_image = EXCLUDED.cover_image,
  cover_alt = EXCLUDED.cover_alt,
  category = EXCLUDED.category,
  category_display = EXCLUDED.category_display,
  role = EXCLUDED.role,
  year = EXCLUDED.year,
  client_name = EXCLUDED.client_name,
  client_type = EXCLUDED.client_type,
  tech_stack = EXCLUDED.tech_stack,
  live_url = EXCLUDED.live_url,
  repo_url = EXCLUDED.repo_url,
  problem = EXCLUDED.problem,
  solution = EXCLUDED.solution,
  result = EXCLUDED.result,
  metrics = EXCLUDED.metrics,
  gallery = EXCLUDED.gallery,
  featured = EXCLUDED.featured,
  "order" = EXCLUDED."order",
  status = EXCLUDED.status,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  updated_at = EXCLUDED.updated_at;
`;
  }
}

// Seed Media
if (db.mediaItems && db.mediaItems.length) {
  sql += `
-- Insert Media Items
`;
  for (const m of db.mediaItems) {
    sql += `INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  ${esc(m.id)},
  ${esc(m.fileName)},
  ${esc(m.url)},
  ${esc(m.size)},
  ${esc(m.dimensions)},
  ${esc(m.alt)},
  ${esc(m.caption)},
  ${esc(m.createdAt)}
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;
`;
  }
}

// Seed Inquiries
if (db.inquiries && db.inquiries.length) {
  sql += `
-- Insert Inquiries
`;
  for (const inq of db.inquiries) {
    sql += `INSERT INTO public.inquiries (id, name, email, subject, message, status)
VALUES (
  ${esc(inq.id)},
  ${esc(inq.name)},
  ${esc(inq.email)},
  ${esc(inq.subject)},
  ${esc(inq.message)},
  ${esc(inq.status || "new")}
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  subject = EXCLUDED.subject,
  message = EXCLUDED.message,
  status = EXCLUDED.status;
`;
  }
}

const outDir = path.join(process.cwd(), "supabase");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, "schema.sql"), sql, "utf8");
console.log("✅ Generated supabase/schema.sql successfully with all tables, RLS, storage, and seed data!");
