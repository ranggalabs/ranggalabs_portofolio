import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith("http") &&
    (supabaseServiceKey || supabaseAnonKey)
  );
};

// Server-side privileged client (uses SERVICE_ROLE_KEY when available to bypass RLS for CMS admin operations)
let supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseAdminInstance) {
    const key = supabaseServiceKey || supabaseAnonKey;
    supabaseAdminInstance = createClient(supabaseUrl, key, {
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
  if (!isSupabaseConfigured() || !supabaseAnonKey) return null;
  if (!supabaseAnonInstance) {
    supabaseAnonInstance = createClient(supabaseUrl, supabaseAnonKey);
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
