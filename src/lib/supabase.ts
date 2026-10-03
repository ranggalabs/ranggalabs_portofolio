import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function normalizeSupabaseUrl(raw: string | undefined): string {
  if (!raw) return "";
  let url = raw.trim().replace(/^["']|["']$/g, "");
  url = url.replace(/\/+$/, "");
  url = url.replace(/\/rest\/v1\/?$/, "");
  url = url.replace(/\/+$/, "");
  return url;
}

export function normalizeSupabaseKey(raw: string | undefined): string {
  if (!raw) return "";
  return raw.trim().replace(/^["']|["']$/g, "");
}

function getResolvedConfig() {
  const url = normalizeSupabaseUrl(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const serviceKey = normalizeSupabaseKey(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  );
  const anonKey = normalizeSupabaseKey(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  );

  return { url, serviceKey, anonKey };
}

export const isSupabaseConfigured = (): boolean => {
  const { url, serviceKey, anonKey } = getResolvedConfig();
  return Boolean(
    url &&
    url.startsWith("http") &&
    (serviceKey || anonKey)
  );
};

// Server-side privileged client (uses SERVICE_ROLE_KEY when available to bypass RLS for CMS admin operations)
let supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseAdminInstance) {
    const { url, serviceKey, anonKey } = getResolvedConfig();
    const key = serviceKey || anonKey;
    supabaseAdminInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAdminInstance;
}

// Public anonymous client for client-side or public queries
let supabaseAnonInstance: SupabaseClient | null = null;

export function getSupabaseAnon(): SupabaseClient | null {
  const { url, anonKey } = getResolvedConfig();
  if (!url || !anonKey) return null;
  if (!supabaseAnonInstance) {
    supabaseAnonInstance = createClient(url, anonKey);
  }
  return supabaseAnonInstance;
}

/**
 * Upload a file to Supabase Storage and get its public URL
 */
export async function uploadToSupabaseStorage(
  bucketName: string,
  filePath: string,
  buffer: Buffer | Uint8Array,
  contentType?: string
): Promise<{ url: string; error?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { url: "", error: "Supabase is not configured" };
  }

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: contentType || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error(`Supabase Storage upload error (${filePath}):`, uploadError);
      return { url: "", error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error(`Supabase upload exception (${filePath}):`, err);
    return { url: "", error: err?.message || "Storage upload failed" };
  }
}
