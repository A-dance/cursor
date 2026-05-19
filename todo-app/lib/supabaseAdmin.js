import { createClient } from "@supabase/supabase-js";

/** service_role クライアント（未設定なら null） */
export function tryGetSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Webhook などサーバー専用（service_role）。未設定時は throw */
export function getSupabaseAdmin() {
  const client = tryGetSupabaseAdmin();
  if (!client) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY が .env に設定されていません",
    );
  }
  return client;
}
