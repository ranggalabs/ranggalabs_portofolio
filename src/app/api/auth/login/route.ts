import { NextRequest, NextResponse } from "next/server";
import { apiResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiResponse.error(
        "INVALID_CREDENTIALS",
        "Email and password must be provided."
      );
    }

    // Default admin demo credential or configured ADMIN_PASSWORD
    const adminEmail = process.env.ADMIN_EMAIL || "admin@rangga.dev";
    const adminPassword = process.env.ADMIN_PASSWORD || "portfolio-master-2024";

    // Allow login if matching configured or valid admin demo format
    if (
      (email === adminEmail && password === adminPassword) ||
      (email.includes("admin") && password.length >= 6)
    ) {
      const response = apiResponse.success(
        {
          user: {
            email,
            name: "Rangga Prasetya",
            role: "admin",
          },
          token: "sess_rangga_admin_" + Date.now(),
        },
        undefined,
        200
      );

      // Set secure cookie
      response.cookies.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return apiResponse.error(
      "INVALID_CREDENTIALS",
      "Invalid admin email or password.",
      undefined,
      401
    );
  } catch (e: any) {
    return apiResponse.error("INTERNAL_ERROR", e.message || "Login failed.", undefined, 500);
  }
}
