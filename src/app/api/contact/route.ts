import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { inquirySchema } from "@/lib/validations";

// POST /api/contact - Public contact submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return apiError("VALIDATION_ERROR", "Mohon isi semua field formulir dengan benar", 422, details);
    }

    // Anti-spam honeypot detection
    if (parsed.data.honeypot && parsed.data.honeypot.trim().length > 0) {
      // Fake 200 response to prevent bot learning
      return apiSuccess({ message: "Pesan Anda telah berhasil dikirim!" }, 200);
    }

    const createdInquiry = await db.addInquiry({
      name: parsed.data.name.trim(),
      email: parsed.data.email.trim(),
      subject: parsed.data.subject?.trim() || "Pesan dari Portfolio Website",
      message: parsed.data.message.trim(),
    });

    return apiSuccess(
      {
        id: createdInquiry.id,
        message: "Pesan Anda berhasil dikirim! Kami akan menghubungi Anda segera.",
      },
      201
    );
  } catch (err: unknown) {
    console.error("POST /api/contact error:", err);
    return apiError("INTERNAL_ERROR", "Gagal mengirim pesan. Silakan coba kembali nanti.", 500);
  }
}
