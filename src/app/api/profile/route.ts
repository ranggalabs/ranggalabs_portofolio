import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { profileSchema } from "@/lib/validations";

// GET /api/profile
export async function GET() {
  try {
    const profile = await db.getProfile();
    return apiSuccess(profile);
  } catch (err: unknown) {
    console.error("GET /api/profile error:", err);
    return apiError("INTERNAL_ERROR", "Failed to retrieve profile data", 500);
  }
}

// PUT /api/profile
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return apiError("VALIDATION_ERROR", "Invalid profile data", 422, details);
    }

    const updated = await db.updateProfile(parsed.data);

    try {
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/admin/profile");
    } catch (e) {
      console.warn("Revalidate profile warning:", e);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    console.error("PUT /api/profile error:", err);
    return apiError("INTERNAL_ERROR", "Failed to update profile", 500);
  }
}
