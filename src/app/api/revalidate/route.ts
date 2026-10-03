import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { apiSuccess, apiError } from "@/lib/api-response";

// POST /api/revalidate
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path: targetPath, secret } = body;

    const expectedSecret = process.env.REVALIDATE_SECRET || "cms-revalidate-secret-token";
    if (secret && secret !== expectedSecret) {
      return apiError("UNAUTHORIZED", "Invalid revalidation token", 401);
    }

    if (!targetPath) {
      return apiError("VALIDATION_ERROR", "Target 'path' is required for revalidation", 400);
    }

    revalidatePath(targetPath);

    return apiSuccess({
      revalidated: true,
      path: targetPath,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("POST /api/revalidate error:", err);
    return apiError("INTERNAL_ERROR", "Failed to execute revalidation", 500);
  }
}
