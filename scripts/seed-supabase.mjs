import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local or process.env
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const equalsIdx = trimmed.indexOf("=");
      if (equalsIdx > 0) {
        const key = trimmed.slice(0, equalsIdx).trim();
        const val = trimmed.slice(equalsIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) must be provided in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function seed() {
  console.log("🚀 Starting Supabase database seeding from data/db.json...");

  const dbPath = path.join(process.cwd(), "data", "db.json");
  if (!fs.existsSync(dbPath)) {
    console.error("❌ Error: data/db.json not found!");
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

  // 1. Seed Projects
  if (Array.isArray(rawData.projects) && rawData.projects.length > 0) {
    console.log(`📦 Seeding ${rawData.projects.length} projects...`);
    const projectRows = rawData.projects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: p.summary || "",
      cover_image: p.coverImage || "",
      cover_alt: p.coverAlt || p.title,
      category: p.category || "fullstack",
      category_display: p.categoryDisplay || (p.category || "fullstack").toUpperCase(),
      role: p.role || "Fullstack Developer",
      year: p.year || "2024",
      client_name: p.clientName || null,
      client_type: p.clientType || null,
      tech_stack: p.techStack || [],
      live_url: p.liveUrl || null,
      repo_url: p.repoUrl || null,
      problem: p.problem || "",
      solution: p.solution || "",
      result: p.result || "",
      metrics: p.metrics || [],
      gallery: p.gallery || [],
      featured: Boolean(p.featured),
      order: typeof p.order === "number" ? p.order : 1,
      status: p.status || "draft",
      seo_title: p.seoTitle || null,
      seo_description: p.seoDescription || null,
      updated_at: p.updatedAt || new Date().toISOString().split("T")[0],
    }));

    const { error: projErr } = await supabase
      .from("projects")
      .upsert(projectRows, { onConflict: "id" });

    if (projErr) {
      console.error("⚠️ Failed to seed projects:", projErr.message);
    } else {
      console.log("✅ Projects seeded successfully!");
    }
  }

  // 2. Seed Profile
  if (rawData.profile) {
    console.log("👤 Seeding profile...");
    const profileRow = {
      id: "default",
      name: rawData.profile.name,
      headline: rawData.profile.headline,
      bio: rawData.profile.bio,
      photo: rawData.profile.photo,
      location: rawData.profile.location,
      availability: rawData.profile.availability,
      is_available: rawData.profile.isAvailable,
      email: rawData.profile.email,
      phone: rawData.profile.phone,
      github: rawData.profile.github,
      linkedin: rawData.profile.linkedin,
      social_links: rawData.profile.socialLinks || [],
      experiences: rawData.profile.experiences || [],
      education: rawData.profile.education || [],
      certifications: rawData.profile.certifications || [],
    };

    const { error: profErr } = await supabase
      .from("profile")
      .upsert(profileRow, { onConflict: "id" });

    if (profErr) {
      console.error("⚠️ Failed to seed profile:", profErr.message);
    } else {
      console.log("✅ Profile seeded successfully!");
    }
  }

  // 3. Seed Resume Settings
  if (rawData.resumeSettings) {
    console.log("📄 Seeding resume settings...");
    const resumeRow = {
      id: "default",
      file_name: rawData.resumeSettings.fileName,
      version_label: rawData.resumeSettings.versionLabel,
      file_size: rawData.resumeSettings.fileSize,
      updated_at: rawData.resumeSettings.updatedAt,
      public_url: rawData.resumeSettings.publicUrl,
    };

    const { error: resErr } = await supabase
      .from("resume_settings")
      .upsert(resumeRow, { onConflict: "id" });

    if (resErr) {
      console.error("⚠️ Failed to seed resume settings:", resErr.message);
    } else {
      console.log("✅ Resume settings seeded successfully!");
    }
  }

  // 4. Seed Site Settings
  if (rawData.siteSettings) {
    console.log("⚙️ Seeding site settings...");
    const siteRow = {
      id: "default",
      site_name: rawData.siteSettings.siteName,
      site_url: rawData.siteSettings.siteUrl,
      default_seo_title: rawData.siteSettings.defaultSeoTitle,
      default_seo_description: rawData.siteSettings.defaultSeoDescription,
      default_og_image: rawData.siteSettings.defaultOgImage,
      contact_email: rawData.siteSettings.contactEmail,
      analytics_id: rawData.siteSettings.analyticsId || "",
    };

    const { error: setErr } = await supabase
      .from("site_settings")
      .upsert(siteRow, { onConflict: "id" });

    if (setErr) {
      console.error("⚠️ Failed to seed site settings:", setErr.message);
    } else {
      console.log("✅ Site settings seeded successfully!");
    }
  }

  // 5. Seed Media Items
  if (Array.isArray(rawData.mediaItems) && rawData.mediaItems.length > 0) {
    console.log(`🖼️ Seeding ${rawData.mediaItems.length} media items...`);
    const mediaRows = rawData.mediaItems.map((m) => ({
      id: m.id,
      file_name: m.fileName,
      url: m.url,
      size: m.size,
      dimensions: m.dimensions,
      alt: m.alt,
      caption: m.caption || null,
      created_at: m.createdAt,
    }));

    const { error: medErr } = await supabase
      .from("media_items")
      .upsert(mediaRows, { onConflict: "id" });

    if (medErr) {
      console.error("⚠️ Failed to seed media items:", medErr.message);
    } else {
      console.log("✅ Media items seeded successfully!");
    }
  }

  // 6. Seed Inquiries
  if (Array.isArray(rawData.inquiries) && rawData.inquiries.length > 0) {
    console.log(`✉️ Seeding ${rawData.inquiries.length} inquiries...`);
    const inqRows = rawData.inquiries.map((i) => ({
      id: i.id,
      name: i.name,
      email: i.email,
      subject: i.subject || null,
      message: i.message,
      created_at: i.createdAt,
      status: i.status || "new",
    }));

    const { error: inqErr } = await supabase
      .from("inquiries")
      .upsert(inqRows, { onConflict: "id" });

    if (inqErr) {
      console.error("⚠️ Failed to seed inquiries:", inqErr.message);
    } else {
      console.log("✅ Inquiries seeded successfully!");
    }
  }

  console.log("\n🎉 Database seeding process completed!");
}

seed().catch((err) => {
  console.error("Unhandled seeding error:", err);
  process.exit(1);
});
