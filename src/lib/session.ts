export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecretKey(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "ranggalabs-secure-session-key-fallback-secret-2024"
  );
}

// Convert ArrayBuffer to URL-safe Base64
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Convert URL-safe Base64 to Uint8Array
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export interface SessionPayload {
  email: string;
  role: "admin";
  exp: number; // Unix timestamp in ms
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token
 */
export async function createSessionToken(email: string): Promise<string> {
  const payload: SessionPayload = {
    email,
    role: "admin",
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };

  const payloadJson = JSON.stringify(payload);
  const enc = new TextEncoder();
  const payloadB64 = bufferToBase64Url(enc.encode(payloadJson).buffer as ArrayBuffer);

  const key = await getHmacKey(getSecretKey());
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadB64)
  );
  const signatureB64 = bufferToBase64Url(signature);

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verifies the validity and expiration of an HMAC-SHA256 session token
 */
export async function verifySessionToken(
  token: string | null | undefined
): Promise<{ valid: boolean; email?: string }> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false };
  }

  try {
    const [payloadB64, signatureB64] = token.split(".");
    if (!payloadB64 || !signatureB64) {
      return { valid: false };
    }

    const key = await getHmacKey(getSecretKey());
    const enc = new TextEncoder();
    const sigBytes = base64UrlToUint8Array(signatureB64);

    const isValidSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer as ArrayBuffer,
      enc.encode(payloadB64)
    );

    if (!isValidSignature) {
      return { valid: false };
    }

    const payloadBytes = base64UrlToUint8Array(payloadB64);
    const dec = new TextDecoder();
    const payload: SessionPayload = JSON.parse(dec.decode(payloadBytes));

    if (payload.role !== "admin" || !payload.exp || Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch (err) {
    return { valid: false };
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const enc = new TextEncoder();
  const bufA = enc.encode(a);
  const bufB = enc.encode(b);

  if (bufA.byteLength !== bufB.byteLength) {
    // Process comparison anyway to avoid short-circuit timing leak
    let diff = 1;
    for (let i = 0; i < bufA.byteLength; i++) {
      diff |= bufA[i] ^ 0;
    }
    return false;
  }

  let diff = 0;
  for (let i = 0; i < bufA.byteLength; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}
