/**
 * Cliente Supabase (browser). Usa las API keys del sistema nuevo:
 * la publishable actúa como anon key. Solo instanciar en cliente
 * (localStorage para la sesión) — las rutas admin son client-rendered.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }
  return client;
}
