import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { resumeSchema } from "@/lib/validations";
import { isSupabaseConfigured, uploadToSupabaseStorage } from "@/lib/supabase";
import fs from "fs";
import path from "path";

// GET /api/resume
export async function GET() {
  try {
    const resume = await db.getResume();
    return apiSuccess(resume);
  } catch (err: unknown) {
    console.error("GET /api/resume error:", err);
    return apiError("INTERNAL_ERROR", "Failed to retrieve resume settings", 500);
  }
}

// PUT /api/resume
export async function PUT(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const versionLabel = (formData.get("versionLabel") as string) || "v2.4-Latest";

      let fileSize = "1.2 MB";
      let fileName = (formData.get("fileName") as string) || "CV_Rangga_Prasetya.pdf";
      let publicUrl = "/cv.pdf";

      if (file) {
        if (!formData.get("fileName")) {
          fileName = file.name;
        }
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        fileSize = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validate PDF magic number (%PDF-)
        const header = buffer.subarray(0, 5).toString("ascii");
        if (!header.startsWith("%PDF")) {
          return apiError("VALIDATION_ERROR", "File bukan dokumen PDF yang valid. Silakan unggah dokumen PDF standar.", 400);
        }

        if (isSupabaseConfigured()) {
          // Upload to Supabase Storage
          const storageRes = await uploadToSupabaseStorage(
            "portfolio",
            `resumes/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
            buffer,
            "application/pdf"
          );
          if (storageRes.url) {
            publicUrl = storageRes.url;
          }
        } else {
          // Local storage fallback
          try {
            const dataDir = path.join(process.cwd(), "data");
            if (!fs.existsSync(dataDir)) {
              fs.mkdirSync(dataDir, { recursive: true });
            }
            const filePath = path.join(dataDir, "cv.pdf");
            fs.writeFileSync(filePath, buffer);
          } catch (e) {
            console.warn("Could not write local cv.pdf (environment may be read-only):", e);
          }
        }
      }

      const updated = await db.updateResume({
        fileName,
        versionLabel,
        fileSize,
        publicUrl,
      });

      try {
        revalidatePath("/cv");
        revalidatePath("/cv.pdf");
      } catch (e) {
        console.warn("Revalidate warning:", e);
      }

      return apiSuccess(updated);
    } else {
      const body = await req.json();
      const parsed = resumeSchema.safeParse(body);
      if (!parsed.success) {
        const details = parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        return apiError("VALIDATION_ERROR", "Invalid resume metadata", 422, details);
      }

      const updated = await db.updateResume(parsed.data);

      try {
        revalidatePath("/cv");
        revalidatePath("/cv.pdf");
      } catch (e) {
        console.warn("Revalidate warning:", e);
      }

      return apiSuccess(updated);
    }
  } catch (err: unknown) {
    console.error("PUT /api/resume error:", err);
    return apiError("INTERNAL_ERROR", "Failed to update resume settings", 500);
  }
}
