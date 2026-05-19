import { supabase } from "@/lib/supabaseClient";

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
}

export async function fetchTodosFromApi() {
  const res = await fetch("/api/todos", {
    credentials: "include",
    headers: await authHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 403) {
    throw new Error(json.error ?? "有料プランが必要です");
  }
  if (!res.ok) {
    throw new Error(json.error ?? "TODO の取得に失敗しました");
  }
  return json.todos ?? [];
}

export async function createTodoViaApi(title) {
  const res = await fetch("/api/todos", {
    method: "POST",
    credentials: "include",
    headers: await authHeaders(),
    body: JSON.stringify({ title }),
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 403) {
    throw new Error(json.error ?? "有料プランが必要です");
  }
  if (!res.ok) {
    throw new Error(json.error ?? "TODO の追加に失敗しました");
  }
  return json.todo;
}

export async function updateTodoViaApi(id, title) {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: await authHeaders(),
    body: JSON.stringify({ title }),
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 403) {
    throw new Error(json.error ?? "有料プランが必要です");
  }
  if (!res.ok) {
    throw new Error(json.error ?? "TODO の更新に失敗しました");
  }
  return json.todo;
}

export async function deleteTodoViaApi(id) {
  const res = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: await authHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 403) {
    throw new Error(json.error ?? "有料プランが必要です");
  }
  if (!res.ok) {
    throw new Error(json.error ?? "TODO の削除に失敗しました");
  }
  return true;
}
