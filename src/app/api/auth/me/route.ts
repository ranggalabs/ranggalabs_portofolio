import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { valid, email } = await verifySessionToken(token);

  if (valid && email) {
    return apiResponse.success({
      authenticated: true,
      user: {
        email,
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
