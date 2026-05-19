import { supabase } from "./supabaseClient";

/**
 * id に一致する行を削除する
 */
export const deleteTodo = async (id) => {
  const { data, error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    console.warn("削除に失敗しました:", error.message);
    return false;
  }

  return Boolean(data && data.length > 0);
};
