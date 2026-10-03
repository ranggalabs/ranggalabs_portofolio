import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { mediaUpdateSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/media/[id]
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const mediaList = await db.getMedia();
    const item = mediaList.find((m) => m.id === id);

    if (!item) {
      return apiError("NOT_FOUND", `Media item with ID '${id}' was not found`, 404);
    }

    return apiSuccess(item);
  } catch (err: unknown) {
    console.error("GET /api/media/[id] error:", err);
    return apiError("INTERNAL_ERROR", "Failed to retrieve media item", 500);
  }
}

// PATCH /api/media/[id]
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = mediaUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return apiError("VALIDATION_ERROR", "Validation failed for media update", 422, details);
    }

    const updated = await db.updateMedia(id, parsed.data);
    if (!updated) {
      return apiError("NOT_FOUND", `Media item with ID '${id}' was not found`, 404);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    console.error("PATCH /api/media/[id] error:", err);
    return apiError("INTERNAL_ERROR", "Failed to update media item", 500);
  }
}

// DELETE /api/media/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const deleted = await db.deleteMedia(id);

    if (!deleted) {
      return apiError("NOT_FOUND", `Media item with ID '${id}' was not found`, 404);
    }

    return apiSuccess({ deletedId: id, message: "Media item deleted successfully" });
  } catch (err: unknown) {
    console.error("DELETE /api/media/[id] error:", err);
    return apiError("INTERNAL_ERROR", "Failed to delete media item", 500);
  }
}
