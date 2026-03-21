import { createClient } from '@supabase/supabase-js';

/**
 * Server-side client for Storage. Prefer SUPABASE_SERVICE_ROLE_KEY in .env
 * so uploads work without Supabase Auth; never expose that key to the browser.
 * Create a public bucket (e.g. "gallery") in Supabase Dashboard → Storage.
 *
 * Env is read when getSupabase() runs (after dotenv.config() in index.js).
 */
export function getGalleryBucket() {
  return process.env.SUPABASE_GALLERY_BUCKET || 'gallery';
}

export function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
