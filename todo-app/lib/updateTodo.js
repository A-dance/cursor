import { supabase } from "./supabaseClient";

/**
 * id に一致する行の title を newTitle で更新する
 */
export const updateTodo = async (id, newTitle) => {
  const { data, error } = await supabase
    .from("todos")
    .update({ title: newTitle })
    .eq("id", id)
    .select();

  if (error) {
    console.warn("更新に失敗しました:", error.message);
    return false;
  }

  return Boolean(data && data.length > 0);
};
