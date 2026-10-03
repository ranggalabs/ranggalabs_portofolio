import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import {
  createSessionToken,
  timingSafeEqualString,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/session";

// In-memory rate limiting map for failed login attempts
// Key: IP address, Value: { count: number, resetAt: number }
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) return { allowed: true };

  if (now > record.resetAt) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    record.count += 1;
  }
}

function clearRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return apiResponse.error(
        "RATE_LIMITED",
        `Terlalu banyak percobaan login yang gagal. Silakan coba kembali dalam ${Math.ceil(
          (rateCheck.retryAfterSeconds || 60) / 60
        )} menit.`,
        undefined,
        429
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return apiResponse.error(
        "INVALID_CREDENTIALS",
        "Email dan password wajib diisi.",
        undefined,
        400
      );
    }

    const expectedEmail = process.env.ADMIN_EMAIL || "admin@rangga.dev";
    const expectedPassword = process.env.ADMIN_PASSWORD || "portfolio-master-2024";

    const isEmailValid = timingSafeEqualString(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase());
    const isPasswordValid = timingSafeEqualString(password, expectedPassword);

    if (!isEmailValid || !isPasswordValid) {
      recordFailedAttempt(ip);
      return apiResponse.error(
        "INVALID_CREDENTIALS",
        "Email atau password admin tidak valid.",
        undefined,
        401
      );
    }

    // Login successful: clear rate limiting for this IP
    clearRateLimit(ip);

    // Create cryptographically signed HMAC-SHA256 session token
    const sessionToken = await createSessionToken(expectedEmail);

    const response = apiResponse.success(
      {
        user: {
          email: expectedEmail,
          name: "Rangga Prasetya",
          role: "admin",
        },
      },
      undefined,
      200
    );

    // Set hardened secure cookie
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (e: any) {
    console.error("Login route error:", e);
    return apiResponse.error("INTERNAL_ERROR", "Login gagal diproses.", undefined, 500);
  }
}
