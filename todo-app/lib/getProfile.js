import { supabase } from "./supabaseClient";

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, is_paid, stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    const missingTable =
      error.code === "PGRST205" ||
      error.message.includes("Could not find the table");
    if (!missingTable) {
      // dev では console.error が画面の「アプリケーションエラー」になるため warn のみ
      console.warn("プロフィール取得:", error.message);
    }
    return null;
  }

  return data;
}
