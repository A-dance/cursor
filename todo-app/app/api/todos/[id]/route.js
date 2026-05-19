import { requirePaidUser } from "@/lib/requirePaidUser";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

/** PATCH /api/todos/:id — 有料ユーザーのみ */
export async function PATCH(request, { params }) {
  const gate = await requirePaidUser(request);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "タイトルを入力してください" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("todos")
    .update({ title })
    .eq("id", id)
    .eq("user_id", gate.user.id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "TODO が見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ todo: data });
}

/** DELETE /api/todos/:id — 有料ユーザーのみ */
export async function DELETE(request, { params }) {
  const gate = await requirePaidUser(request);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", gate.user.id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "TODO が見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
