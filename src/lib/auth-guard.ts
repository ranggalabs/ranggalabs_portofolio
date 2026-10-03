import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "./session";
import { apiError } from "./api-response";

/**
 * Validates the admin session cookie from an incoming NextRequest.
 */
export async function checkAdminSession(
  req: NextRequest
): Promise<{ authorized: boolean; email?: string }> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const result = await verifySessionToken(token);
  return {
    authorized: result.valid,
    email: result.email,
  };
}

/**
 * Helper to enforce admin authorization in API Route Handlers.
 * Returns an apiError NextResponse if unauthorized, or null if authorized.
 */
export async function requireAdmin(req: NextRequest) {
  const { authorized } = await checkAdminSession(req);
  if (!authorized) {
    return apiError(
      "UNAUTHORIZED",
      "Akses ditolak. Sesi autentikasi admin yang valid diperlukan untuk melakukan operasi ini.",
      401
    );
  }
  return null;
}
