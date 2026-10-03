import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { mediaSchema } from "@/lib/validations";
import { isSupabaseConfigured, uploadToSupabaseStorage } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth-guard";
import fs from "fs";
import path from "path";

// GET /api/media
export async function GET() {
  try {
    const items = await db.getMedia();
    return apiSuccess(items);
  } catch (err: unknown) {
    console.error("GET /api/media error:", err);
    return apiError("INTERNAL_ERROR", "Failed to retrieve media library items", 500);
  }
}

// POST /api/media
export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const alt = (formData.get("alt") as string) || "";
      const caption = (formData.get("caption") as string) || undefined;

      if (!file) {
        return apiError("VALIDATION_ERROR", "No file uploaded", 400);
      }

      if (!alt || alt.trim().length < 3) {
        return apiError("VALIDATION_ERROR", "Mandatory alt text must be at least 3 characters", 400);
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      let url = `/uploads/${safeName}`;

      if (isSupabaseConfigured()) {
        const storageRes = await uploadToSupabaseStorage(
          "portfolio",
          `uploads/${safeName}`,
          buffer,
          file.type || "image/png"
        );
        if (storageRes.url) {
          url = storageRes.url;
        }
      } else {
        // Local upload fallback
        try {
          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const filePath = path.join(uploadsDir, safeName);
          fs.writeFileSync(filePath, buffer);
        } catch (e) {
          console.warn("Could not save to local public/uploads (environment may be read-only):", e);
        }
      }

      const sizeKB = (file.size / 1024).toFixed(1);
      const size = `${sizeKB} KB`;

      const newItem = await db.addMedia({
        fileName: file.name,
        url,
        size,
        dimensions: "Auto",
        alt: alt.trim(),
        caption,
      });

      return apiSuccess(newItem, 201);
    } else {
      // JSON payload
      const body = await req.json();
      const parsed = mediaSchema.safeParse(body);
      if (!parsed.success) {
        const details = parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        return apiError("VALIDATION_ERROR", "Invalid media data", 422, details);
      }

      const newItem = await db.addMedia({
        fileName: parsed.data.fileName,
        url: parsed.data.url,
        size: parsed.data.size || "Unknown",
        dimensions: parsed.data.dimensions || "Auto",
        alt: parsed.data.alt,
        caption: parsed.data.caption,
      });

      return apiSuccess(newItem, 201);
    }
  } catch (err: unknown) {
    console.error("POST /api/media error:", err);
    return apiError("INTERNAL_ERROR", "Failed to upload media item", 500);
  }
}
