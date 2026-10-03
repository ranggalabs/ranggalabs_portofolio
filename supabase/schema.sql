-- ==============================================================
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

-- Allow full access for server-mediated CMS operations
-- (Application security is strictly enforced at Next.js API layer via HMAC-SHA256 admin tokens)
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
DROP POLICY IF EXISTS "Service role projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all projects" ON public.projects;
CREATE POLICY "Allow all projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read profile" ON public.profile;
DROP POLICY IF EXISTS "Service role profile" ON public.profile;
DROP POLICY IF EXISTS "Allow all profile" ON public.profile;
CREATE POLICY "Allow all profile" ON public.profile FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read resume_settings" ON public.resume_settings;
DROP POLICY IF EXISTS "Service role resume_settings" ON public.resume_settings;
DROP POLICY IF EXISTS "Allow all resume_settings" ON public.resume_settings;
CREATE POLICY "Allow all resume_settings" ON public.resume_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Service role site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow all site_settings" ON public.site_settings;
CREATE POLICY "Allow all site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read media_items" ON public.media_items;
DROP POLICY IF EXISTS "Service role media_items" ON public.media_items;
DROP POLICY IF EXISTS "Allow all media_items" ON public.media_items;
CREATE POLICY "Allow all media_items" ON public.media_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Service role inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow all inquiries" ON public.inquiries;
CREATE POLICY "Allow all inquiries" ON public.inquiries FOR ALL USING (true) WITH CHECK (true);

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

-- Insert Profile
INSERT INTO public.profile (id, name, headline, bio, photo, location, availability, is_available, email, phone, github, linkedin, social_links, experiences, education, certifications)
VALUES (
  'default',
  'Rangga Prasetya',
  'Fullstack Developer',
  'Fullstack developer with a passion for high-performance web applications, IoT integration, and human-centered user experiences based in Bandung, Indonesia. Over 3 years building reliable software solutions spanning municipal smart city platforms, edge IoT systems, and high-speed web apps.',
  '/uploads/1790711425440-WhatsApp_Image_2026-09-30_at_01.14.04.jpeg',
  'Bandung, Indonesia (UTC+7)',
  'Available for projects',
  true,
  'ranggahd321@gmail.com',
  '082121719679',
  'https://github.com/ranggalabs',
  'https://www.linkedin.com/in/ranggaprasetya/',
  '[{"platform":"GitHub","url":"https://github.com/ranggaprasetya"},{"platform":"LinkedIn","url":"https://linkedin.com/in/ranggaprasetya"},{"platform":"Email","url":"mailto:rangga.prasetya@example.com"}]'::jsonb,
  '[{"id":"exp-1","role":"Lead Fullstack & IoT Engineer","company":"Rangga Labs & Municipal Initiatives","period":"2024 — Present","location":"Bandung, Indonesia","description":"Architecting distributed transit telematics (Angkot To School) for Dishub Kota Bandung, smart parking sensor arrays with ESP32 edge telemetry, and fullstack cloud architectures."},{"id":"exp-2","role":"Fullstack Web Developer","company":"Digital Studio & Freelance","period":"2022 — 2023","location":"Bandung, Indonesia","description":"Built custom web applications, Chrome developer extensions (Threadibility), interactive quiz systems, and high-performance client websites using React, Next.js, and PostgreSQL."},{"id":"exp-3","role":"Embedded Systems & Firmware Developer","company":"IoT & Hardware Projects","period":"2021 — 2022","location":"Bandung, Indonesia","description":"Designed micro-controller firmware on ESP32/Arduino, calibrated multi-sensor telemetry (PMS5003, BME280), and developed MQTT communication bridges with cloud databases."}]'::jsonb,
  '[{"id":"edu-1","degree":"Bachelor of Computer Science / Informatics","institution":"Universitas di Bandung","period":"2019 — 2023","description":"Focused on Distributed Systems, Network Architecture, Software Engineering, and Internet of Things."}]'::jsonb,
  '[{"id":"cert-1","title":"Fullstack Web Architecture & Cloud Systems","issuer":"Advanced Engineering Certification","year":"2023"},{"id":"cert-2","title":"Embedded Systems with ESP32 & FreeRTOS","issuer":"Hardware & IoT Systems","year":"2022"},{"id":"cert-3","title":"PostgreSQL Database Performance Tuning","issuer":"Database Engineering Institute","year":"2022"}]'::jsonb
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

-- Insert Resume Settings
INSERT INTO public.resume_settings (id, file_name, version_label, file_size, updated_at, public_url)
VALUES (
  'default',
  'CV_Rangga_Prasetya_Template.pdf',
  'v2.5',
  '221 KB',
  '2026-09-29',
  '/cv.pdf'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  version_label = EXCLUDED.version_label,
  file_size = EXCLUDED.file_size,
  updated_at = EXCLUDED.updated_at,
  public_url = EXCLUDED.public_url;

-- Insert Site Settings
INSERT INTO public.site_settings (id, site_name, site_url, default_seo_title, default_seo_description, default_og_image, contact_email, analytics_id)
VALUES (
  'default',
  'Rangga Prasetya — Portfolio & CMS',
  'https://ranggaprasetya.dev',
  'Rangga Prasetya — Fullstack Developer',
  'Fullstack developer with a passion for high-performance web applications, IoT integration, and human-centered user experiences based in Bandung, Indonesia.',
  '/images/angkot_to_school-63d994.png',
  'rangga.prasetya@example.com',
  ''
)
ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  site_url = EXCLUDED.site_url,
  default_seo_title = EXCLUDED.default_seo_title,
  default_seo_description = EXCLUDED.default_seo_description,
  default_og_image = EXCLUDED.default_og_image,
  contact_email = EXCLUDED.contact_email,
  analytics_id = EXCLUDED.analytics_id;

-- Insert Projects
INSERT INTO public.projects (id, title, slug, summary, cover_image, cover_alt, category, category_display, role, year, client_name, client_type, tech_stack, live_url, repo_url, problem, solution, result, metrics, gallery, featured, "order", status, seo_title, seo_description, updated_at)
VALUES (
  'proj-1',
  'Angkot To School (DISHUB Kota Bandung)',
  'angkot-to-school',
  'Real-time public transit tracking and safe route recommendation system for primary and secondary students across Bandung.',
  '/images/angkot_to_school-63d994.png',
  'Angkot To School public transit tracking dashboard preview',
  'fullstack',
  'WEB APPLICATION',
  'Lead Fullstack & IoT Architect',
  '2024',
  'DISHUB Kota Bandung',
  'Government / Municipal Agency',
  '["React","Leaflet.js","Node.js","Express","PostgreSQL","WebSockets"]'::jsonb,
  'https://angkot-school.bandung.go.id',
  'https://github.com/ranggaprasetya/angkot-school',
  'Public minibuses (Angkot) in Bandung lacked predictable scheduling and live tracking, causing parent anxiety, erratic student commute times, and inefficient route dispatch for municipal transport authorities.',
  'Engineered an end-to-end telematics gateway utilizing high-frequency GPS telemetry, low-latency WebSockets, Leaflet.js real-time map clustering, and automated geofencing notifications alerting parents when vehicles approach school zones.',
  'Formally adopted by DISHUB Kota Bandung across 14 high-volume school routes. Successfully reduced average student waiting times by 34% and serves over 12,400 active student passengers every school morning.',
  '[{"id":"m1","label":"Active Daily Students","value":"12,400+"},{"id":"m2","label":"Transit Delay Reduction","value":"34%"},{"id":"m3","label":"Fleet Telematics Uptime","value":"99.94%"}]'::jsonb,
  '["/images/angkot_detail_hero-21d03b.png","/images/gallery_fleet_dispatch-26a8dd.png","/images/gallery_mobile_route-26a8dd.png"]'::jsonb,
  true,
  1,
  'published',
  'Angkot To School — Municipal Transit Tracking Case Study',
  'Case study on building real-time GPS fleet tracking and student safety geofencing with React, Leaflet, and Node.js for Dishub Kota Bandung.',
  '2024-11-20'
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
INSERT INTO public.projects (id, title, slug, summary, cover_image, cover_alt, category, category_display, role, year, client_name, client_type, tech_stack, live_url, repo_url, problem, solution, result, metrics, gallery, featured, "order", status, seo_title, seo_description, updated_at)
VALUES (
  'proj-2',
  'Smart Parking IoT System',
  'smart-parking-iot-system',
  'Automated barrier control and slot occupancy sensor dashboard using ESP32 edge telemetry and cloud state sync.',
  '/images/smart_parking-7bdf3b.png',
  'Smart Parking IoT System occupancy monitoring console',
  'iot',
  'IOT & CLOUD',
  'IoT Firmware & Backend Engineer',
  '2024',
  'Bandung Urban Hub',
  'Commercial Facility',
  '["ESP32","TypeScript","Supabase","MQTT Protocol","PostgreSQL","Docker"]'::jsonb,
  'https://smartparking.rangga.dev',
  'https://github.com/ranggaprasetya/smart-parking-iot',
  'Commercial multi-tier parking complexes suffered from severe ingress congestion due to uncoordinated manual ticket gates and absent live vacancy indications per parking bay level.',
  'Architected ultrasonic wireless sensor clusters on custom ESP32 microcontrollers communicating over MQTT to Supabase Realtime, integrated with an automatic license-plate gate actuator and live floor occupancy LED signs.',
  'Cut median vehicle search times from 9.2 minutes to 3.1 minutes (66% improvement) across 450 bays, while saving 18% in facility lighting power consumption through dynamic bay sensors.',
  '[{"id":"m1","label":"Search Time Reduction","value":"-66%"},{"id":"m2","label":"Occupancy Precision","value":"99.2%"},{"id":"m3","label":"Sensor Latency","value":"85ms"}]'::jsonb,
  '["/images/smart_parking-7bdf3b.png"]'::jsonb,
  true,
  2,
  'published',
  'Smart Parking IoT System — ESP32 & Supabase Realtime Architecture',
  'Automated smart parking infrastructure utilizing ESP32 firmware, MQTT, and Supabase Realtime dashboards.',
  '2024-10-15'
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
INSERT INTO public.projects (id, title, slug, summary, cover_image, cover_alt, category, category_display, role, year, client_name, client_type, tech_stack, live_url, repo_url, problem, solution, result, metrics, gallery, featured, "order", status, seo_title, seo_description, updated_at)
VALUES (
  'proj-3',
  'Threadibility',
  'threadibility',
  'Chrome extension and web service for accessible multi-thread discussion parsing and semantic tree visualization.',
  '/images/threadibility-63d994.png',
  'Threadibility discussion parsing tool',
  'frontend',
  'BROWSER TOOL',
  'Frontend Developer & Extension Author',
  '2023',
  'Open Source Initiative',
  'Developer Tool',
  '["Next.js","PostgreSQL","Tailwind","React","TypeScript"]'::jsonb,
  'https://threadibility.app',
  'https://github.com/ranggaprasetya/threadibility',
  'Deeply nested forum discussions and GitHub issue comments are challenging for screen readers and keyboard-only power users to navigate cleanly without getting lost in branches.',
  'Created a client-side tree parser extension that flattens conversations into an accessible semantic outline with instant keyboard shortcuts, speaker sentiment categorization, and branch collapsing.',
  'Grew to over 4,500 active weekly developers on the Chrome Web Store, earning a 4.9/5 average rating and an Accessibility Excellence award.',
  '[{"id":"m1","label":"Active Extension Users","value":"4,500+"},{"id":"m2","label":"Average Rating","value":"4.9 / 5.0"},{"id":"m3","label":"WCAG AA Contrast","value":"100%"}]'::jsonb,
  '["/images/threadibility-63d994.png"]'::jsonb,
  true,
  3,
  'published',
  'Threadibility — Accessible Forum Discussion Parsing Extension',
  'Chrome extension and web app providing accessible tree outlines for developer discussions and forums.',
  '2024-08-05'
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
INSERT INTO public.projects (id, title, slug, summary, cover_image, cover_alt, category, category_display, role, year, client_name, client_type, tech_stack, live_url, repo_url, problem, solution, result, metrics, gallery, featured, "order", status, seo_title, seo_description, updated_at)
VALUES (
  'proj-4',
  'Wawasan Bela Negara Quiz',
  'wawasan-bela-negara-quiz',
  'Gamified educational assessment platform with adaptive question difficulty and real-time national leaderboard.',
  '/images/wawasan_bela_negara-57eb80.png',
  'Wawasan Bela Negara Quiz gamified UI',
  'frontend',
  'WEB APPLICATION',
  'Fullstack Developer',
  '2023',
  'National Education Foundation',
  'Education / EdTech',
  '["Next.js","TypeScript","Tailwind CSS","Supabase","PostgreSQL"]'::jsonb,
  'https://belanegara-quiz.id',
  'https://github.com/ranggaprasetya/belanegara-quiz',
  'Traditional civic education tests suffered from low student engagement and lack of interactive formative feedback.',
  'Built a timed, interactive quiz app with animated progression bars, score multiplication streaks, and anti-cheat session validation.',
  'Engaged over 28,000 student quiz sessions in its first 3 months with 91% completion rates.',
  '[{"id":"m1","label":"Quizzes Completed","value":"28,000+"},{"id":"m2","label":"Completion Rate","value":"91%"}]'::jsonb,
  '["/images/wawasan_bela_negara-57eb80.png"]'::jsonb,
  false,
  4,
  'published',
  NULL,
  NULL,
  '2023-12-10'
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
INSERT INTO public.projects (id, title, slug, summary, cover_image, cover_alt, category, category_display, role, year, client_name, client_type, tech_stack, live_url, repo_url, problem, solution, result, metrics, gallery, featured, "order", status, seo_title, seo_description, updated_at)
VALUES (
  'proj-5',
  'Jabar Logistics Fleet Dispatch',
  'jabar-logistics-fleet-dispatch',
  'Centralized route optimization and delivery dispatch console handling multi-stop regional freight distribution.',
  '/images/jabar_logistics-1e5a98.png',
  'Jabar Logistics dispatch console overview',
  'backend',
  'ENTERPRISE LOGISTICS',
  'Backend Architect',
  '2023',
  'PT Logistik Jawa Barat',
  'Logistics Enterprise',
  '["Go","PostgreSQL","Redis","Docker","React","REST APIs"]'::jsonb,
  'https://dispatch.jabarlogistics.co.id',
  'https://github.com/ranggaprasetya/jabar-dispatch',
  'Regional couriers faced high fuel overheads due to manual static route planning across mountainous West Java regions.',
  'Engineered an automated traveling-salesperson route grouping microservice in Go, backed by Redis geo-spatial caches and async queue workers.',
  'Decreased average route mileage by 19% across 80 delivery vans operating out of 4 hub centers.',
  '[{"id":"m1","label":"Route Mileage Savings","value":"19%"},{"id":"m2","label":"Dispatch Latency","value":"< 120ms"}]'::jsonb,
  '["/images/jabar_logistics-1e5a98.png"]'::jsonb,
  false,
  5,
  'published',
  NULL,
  NULL,
  '2023-09-18'
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
INSERT INTO public.projects (id, title, slug, summary, cover_image, cover_alt, category, category_display, role, year, client_name, client_type, tech_stack, live_url, repo_url, problem, solution, result, metrics, gallery, featured, "order", status, seo_title, seo_description, updated_at)
VALUES (
  'proj-6',
  'EcoSense Environmental Telemetry',
  'ecosense-environmental-telemetry',
  'Solar-powered environmental monitoring station array streaming air quality, humidity, and temperature data.',
  '/images/ecosense-57eb80.png',
  'EcoSense weather telemetry station',
  'iot',
  'IOT & TELEMETRY',
  'Embedded Systems Developer',
  '2022',
  'Research Institute Bandung',
  'Environmental Research',
  '["ESP32","MQTT Protocol","Node.js","TimescaleDB","Sensor Telemetry"]'::jsonb,
  'https://ecosense.rangga.dev',
  'https://github.com/ranggaprasetya/ecosense-iot',
  'Micro-climate variations in highland agricultural plots required frequent localized humidity and particulate readings without reliable cellular wall power.',
  'Built solar-powered ESP32 nodes sleeping at 15uA, waking every 15 minutes to sample PMS5003 and BME280 sensors before beaming payloads via LoRaWAN/MQTT.',
  'Deployed 12 autonomous stations running non-stop for 18 months without battery replacement.',
  '[{"id":"m1","label":"Autonomous Operation","value":"18 Months"},{"id":"m2","label":"Telemetry Accuracy","value":"98.8%"}]'::jsonb,
  '["/images/ecosense-57eb80.png"]'::jsonb,
  false,
  6,
  'published',
  NULL,
  NULL,
  '2023-04-12'
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

-- Insert Media Items
INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  'med-1790711425465',
  'WhatsApp Image 2026-09-30 at 01.14.04.jpeg',
  '/uploads/1790711425440-WhatsApp_Image_2026-09-30_at_01.14.04.jpeg',
  '84.1 KB',
  'Auto',
  'Rangga Prasetya profile photo',
  NULL,
  '2026-09-29'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;
INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  'med-1790711425442',
  'WhatsApp Image 2026-09-30 at 01.14.04.jpeg',
  '/uploads/1790711425440-WhatsApp_Image_2026-09-30_at_01.14.04.jpeg',
  '84.1 KB',
  'Auto',
  'Rangga Prasetya profile photo',
  NULL,
  '2026-09-29'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;
INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  'med-1790710156756',
  'test_avatar_photo.png',
  '/uploads/1790710156751-test_avatar_photo.png',
  '0.1 KB',
  'Auto',
  'Test Avatar Photo',
  NULL,
  '2026-09-29'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;
INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  'med-1790710083499',
  'test_avatar_photo.png',
  '/uploads/1790710083497-test_avatar_photo.png',
  '0.1 KB',
  'Auto',
  'Test Avatar Photo',
  NULL,
  '2026-09-29'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;
INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  'med-1790663035888',
  'slide_1.png',
  '/uploads/1790663035862-slide_1.png',
  '561.1 KB',
  'Auto',
  'slide_1',
  NULL,
  '2026-09-29'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;
INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  'med-1790663035864',
  'slide_1.png',
  '/uploads/1790663035862-slide_1.png',
  '561.1 KB',
  'Auto',
  'slide_1',
  NULL,
  '2026-09-29'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;
INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  'med-1790662932923',
  'my-new-cover-test.png',
  '/uploads/1790662932921-my-new-cover-test.png',
  '0.1 KB',
  'Auto',
  'Modern Telematics Gateway Architecture Diagram',
  NULL,
  '2026-09-29'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;
INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  'med-1',
  'angkot_to_school-63d994.png',
  '/images/angkot_to_school-63d994.png',
  '194 KB',
  '1280x720',
  'Angkot To School public transit tracking dashboard preview',
  'Hero cover image for Angkot To School project',
  '2024-11-10'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;
INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  'med-2',
  'smart_parking-7bdf3b.png',
  '/images/smart_parking-7bdf3b.png',
  '216 KB',
  '1280x720',
  'Smart Parking IoT System occupancy monitoring console',
  'Dashboard view of multi-level slot occupancy',
  '2024-10-12'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;
INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  'med-3',
  'threadibility-63d994.png',
  '/images/threadibility-63d994.png',
  '154 KB',
  '1280x720',
  'Threadibility discussion parsing tool',
  'Chrome extension conversation tree visualizer',
  '2024-08-01'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;
INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  'med-4',
  'profile_rangga-7ca715.png',
  '/images/profile_rangga-7ca715.png',
  '133 KB',
  '800x800',
  'Rangga Prasetya portrait photo',
  'Official avatar and profile photo',
  '2024-07-15'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;
INSERT INTO public.media_items (id, file_name, url, size, dimensions, alt, caption, created_at)
VALUES (
  'med-5',
  'angkot_detail_hero-21d03b.png',
  '/images/angkot_detail_hero-21d03b.png',
  '188 KB',
  '1440x810',
  'Angkot To School Dishub telematics full dashboard',
  'Case study hero presentation banner',
  '2024-11-12'
)
ON CONFLICT (id) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  url = EXCLUDED.url,
  size = EXCLUDED.size,
  dimensions = EXCLUDED.dimensions,
  alt = EXCLUDED.alt,
  caption = EXCLUDED.caption;

-- Insert Inquiries
INSERT INTO public.inquiries (id, name, email, subject, message, status)
VALUES (
  'inq-1',
  'Ahmad Fauzi',
  'ahmad.fauzi@smartcity.id',
  'Municipal Bus Tracking Collaboration',
  'Halo Rangga, kami tertarik dengan implementasi sistem Angkot To School Anda untuk Dishub Bandung. Kami sedang mengembangkan inisiatif serupa di Jawa Timur dan ingin mendiskusikan peluang kolaborasi teknis atau konsultasi sistem.',
  'read'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  subject = EXCLUDED.subject,
  message = EXCLUDED.message,
  status = EXCLUDED.status;
INSERT INTO public.inquiries (id, name, email, subject, message, status)
VALUES (
  'inq-2',
  'Sarah Jenkins',
  'sarah.jenkins@techrecruiting.co',
  'Senior Fullstack Engineer Opportunity (Remote)',
  'Hi Rangga! I came across your portfolio and was very impressed with your work on Threadibility and your IoT projects. We have an exciting remote fullstack position focusing on Next.js and high-scale backends. Let''s connect!',
  'read'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  subject = EXCLUDED.subject,
  message = EXCLUDED.message,
  status = EXCLUDED.status;
INSERT INTO public.inquiries (id, name, email, subject, message, status)
VALUES (
  'inq-3',
  'Budi Santoso',
  'budi@indonesiakreatif.org',
  'Webinar Pembicara: Mengembangkan IoT dengan Edge Computing',
  'Selamat siang Mas Rangga, kami mengundang Anda untuk menjadi narasumber dalam webinar teknologi IoT kami bulan depan.',
  'read'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  subject = EXCLUDED.subject,
  message = EXCLUDED.message,
  status = EXCLUDED.status;
