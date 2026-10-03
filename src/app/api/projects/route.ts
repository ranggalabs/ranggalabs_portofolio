import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiResponse } from "@/lib/api-response";
import { projectSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") as "published" | "draft" | "all" | null;
    const category = searchParams.get("category") || undefined;
    const featuredParam = searchParams.get("featured");
    const search = searchParams.get("search") || undefined;

    const featured =
      featuredParam === "true"
        ? true
        : featuredParam === "false"
        ? false
        : undefined;

    const projects = await db.getProjects({
      status: statusParam || undefined,
      category,
      featured,
      search,
    });

    const res = apiResponse.success(projects, { total: projects.length });
    res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return res;
  } catch (e: any) {
    return apiResponse.error("INTERNAL_ERROR", e.message, undefined, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const body = await req.json();

    const parseResult = projectSchema.safeParse(body);
    if (!parseResult.success) {
      const details = parseResult.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return apiResponse.validationError(details);
    }

    const newProject = await db.saveProject(parseResult.data);

    // Trigger on-demand ISR revalidation per PRD Section 8.1 FR-5
    try {
      revalidatePath("/");
      revalidatePath("/projects");
      revalidatePath(`/projects/${newProject.slug}`);
      revalidatePath("/sitemap.xml");
    } catch (revalidateErr) {
      console.warn("ISR revalidation warning:", revalidateErr);
    }

    return apiResponse.success(newProject, undefined, 201);
  } catch (e: any) {
    return apiResponse.error("INTERNAL_ERROR", e.message, undefined, 500);
  }
}
