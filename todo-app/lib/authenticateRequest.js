import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/** API Route 用 — Cookie または Authorization ヘッダーでユーザーを特定 */
export async function authenticateRequest(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { user: null, error: new Error("Supabase の環境変数が未設定です") };
  }

  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  if (token) {
    const client = createClient(url, key);
    const { data, error } = await client.auth.getUser(token);
    if (data.user) return { user: data.user, error: null };
    if (error) return { user: null, error };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}
