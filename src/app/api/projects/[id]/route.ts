import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiResponse } from "@/lib/api-response";
import { projectSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await db.getProject(id);

    if (!project) {
      return apiResponse.notFound(`Project with id or slug '${id}' not found.`);
    }

    return apiResponse.success(project);
  } catch (e: any) {
    return apiResponse.error("INTERNAL_ERROR", e.message, undefined, 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { id } = await params;
    const existing = await db.getProject(id);

    if (!existing) {
      return apiResponse.notFound(`Project with id '${id}' not found.`);
    }

    const body = await req.json();
    const parseResult = projectSchema.partial().safeParse(body);

    if (!parseResult.success) {
      const details = parseResult.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return apiResponse.validationError(details);
    }

    const updated = await db.saveProject({
      ...existing,
      ...parseResult.data,
      id: existing.id,
    });

    try {
      revalidatePath("/");
      revalidatePath("/projects");
      revalidatePath(`/projects/${updated.slug}`);
      revalidatePath("/sitemap.xml");
    } catch (revalidateErr) {
      console.warn("ISR revalidation warning:", revalidateErr);
    }

    return apiResponse.success(updated);
  } catch (e: any) {
    return apiResponse.error("INTERNAL_ERROR", e.message, undefined, 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const { id } = await params;
    const existing = await db.getProject(id);

    if (!existing) {
      return apiResponse.notFound(`Project with id '${id}' not found.`);
    }

    const success = await db.deleteProject(existing.id);

    if (success) {
      try {
        revalidatePath("/");
        revalidatePath("/projects");
        revalidatePath("/sitemap.xml");
      } catch (revalidateErr) {
        console.warn("ISR revalidation warning:", revalidateErr);
      }
      return apiResponse.success({ deleted: true, id: existing.id });
    }

    return apiResponse.error("DELETE_FAILED", "Could not delete project.", undefined, 500);
  } catch (e: any) {
    return apiResponse.error("INTERNAL_ERROR", e.message, undefined, 500);
  }
}
