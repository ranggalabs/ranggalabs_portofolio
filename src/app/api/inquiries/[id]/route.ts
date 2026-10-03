import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const statusUpdateSchema = z.object({
  status: z.enum(["new", "read", "replied"]),
});

// PATCH /api/inquiries/[id]
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { id } = await params;
    const body = await req.json();

    const parsed = statusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Invalid status value. Must be 'new', 'read', or 'replied'", 400);
    }

    const updated = await db.updateInquiryStatus(id, parsed.data.status);
    if (!updated) {
      return apiError("NOT_FOUND", `Inquiry with ID '${id}' not found`, 404);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    console.error("PATCH /api/inquiries/[id] error:", err);
    return apiError("INTERNAL_ERROR", "Failed to update inquiry status", 500);
  }
}

// DELETE /api/inquiries/[id]
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { id } = await params;
    const deleted = await db.deleteInquiry(id);

    if (!deleted) {
      return apiError("NOT_FOUND", `Inquiry with ID '${id}' not found`, 404);
    }

    return apiSuccess({ deletedId: id, message: "Inquiry deleted successfully" });
  } catch (err: unknown) {
    console.error("DELETE /api/inquiries/[id] error:", err);
    return apiError("INTERNAL_ERROR", "Failed to delete inquiry", 500);
  }
}
