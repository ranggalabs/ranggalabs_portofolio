import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { siteSettingsSchema } from "@/lib/validations";

// GET /api/settings
export async function GET() {
  try {
    const settings = await db.getSettings();
    return apiSuccess(settings);
  } catch (err: unknown) {
    console.error("GET /api/settings error:", err);
    return apiError("INTERNAL_ERROR", "Failed to retrieve site settings", 500);
  }
}

// PUT /api/settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = siteSettingsSchema.safeParse(body);

    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return apiError("VALIDATION_ERROR", "Invalid site settings data", 422, details);
    }

    const updated = await db.updateSettings(parsed.data);
    return apiSuccess(updated);
  } catch (err: unknown) {
    console.error("PUT /api/settings error:", err);
    return apiError("INTERNAL_ERROR", "Failed to update site settings", 500);
  }
}
