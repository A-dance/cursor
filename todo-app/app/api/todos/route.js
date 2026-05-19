import { requirePaidUser } from "@/lib/requirePaidUser";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

/** GET /api/todos — 有料ユーザーのみ */
export async function GET(request) {
  const gate = await requirePaidUser(request);
  if (!gate.ok) return gate.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", gate.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ todos: data ?? [] });
}

/** POST /api/todos — 有料ユーザーのみ */
export async function POST(request) {
  const gate = await requirePaidUser(request);
  if (!gate.ok) return gate.response;

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "タイトルを入力してください" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("todos")
    .insert([{ title, user_id: gate.user.id }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ todo: data });
}
