import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { inquirySchema } from "@/lib/validations";

// GET /api/inquiries - Admin list of inquiries
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as "new" | "read" | "replied" | null;

    let inquiries = await db.getInquiries();
    if (status) {
      inquiries = inquiries.filter((inq) => inq.status === status);
    }

    return apiSuccess(inquiries);
  } catch (err: unknown) {
    console.error("GET /api/inquiries error:", err);
    return apiError("INTERNAL_ERROR", "Failed to retrieve inquiries", 500);
  }
}

// POST /api/inquiries - Direct inquiry creation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return apiError("VALIDATION_ERROR", "Validation failed for inquiry", 422, details);
    }

    if (parsed.data.honeypot && parsed.data.honeypot.length > 0) {
      // Spam honeypot triggered: return fake success
      return apiSuccess({ message: "Thank you for reaching out!" });
    }

    const newInquiry = await db.addInquiry({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    return apiSuccess(newInquiry, 201);
  } catch (err: unknown) {
    console.error("POST /api/inquiries error:", err);
    return apiError("INTERNAL_ERROR", "Failed to record inquiry", 500);
  }
}
