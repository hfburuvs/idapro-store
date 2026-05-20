import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof window !== "undefined" && (window as any).__SUPABASE_URL__) ||
  import.meta.env.VITE_SUPABASE_URL ||
  "";

const supabaseKey =
  (typeof window !== "undefined" && (window as any).__SUPABASE_KEY__) ||
  import.meta.env.VITE_SUPABASE_KEY ||
  "";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
