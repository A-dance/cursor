import { supabase } from "./supabaseClient";

export const insertTodo = async (title) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("ログインしていません");
  }

  const { data, error } = await supabase
    .from("todos")
    .insert([{ title, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.warn("TODO 追加失敗:", error.message);
    return null;
  }

  return data;
};
