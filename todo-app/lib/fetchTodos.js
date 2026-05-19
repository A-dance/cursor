import { supabase } from "./supabaseClient";

export const fetchTodos = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("TODO 取得失敗:", error.message);
    return [];
  }

  return data ?? [];
};
