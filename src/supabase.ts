import { createClient, SupabaseClient } from "@supabase/supabase-js";

const env =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : (process.env as Record<string, string | undefined>);

const sanitize = (val: unknown): string => {
  if (typeof val !== "string") return "";
  return val.trim().replace(/^['"]+|['",]+$/g, "").trim();
};

export const SUPABASE_KNOWLEDGE_BUCKET =
  sanitize(env.VITE_SUPABASE_KNOWLEDGE_BUCKET) || "knowledge-vault";

const supabaseUrl = sanitize(env.VITE_SUPABASE_URL);
const supabaseAnonKey = sanitize(env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseClient: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("[URJAFLUX AI OS] Failed to initialize Supabase:", err);
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient;
}

export { supabaseClient as supabase };
