import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;

  if (session === "authenticated") {
    return apiResponse.success({
      authenticated: true,
      user: {
        email: "admin@rangga.dev",
        name: "Rangga Prasetya",
        role: "admin",
      },
    });
  }

  return apiResponse.success({
    authenticated: false,
    user: null,
  });
}
