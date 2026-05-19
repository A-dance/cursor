import { authenticateRequest } from "@/lib/authenticateRequest";
import { resolvePaidStatus } from "@/lib/resolvePaidStatus";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

/**
 * API Route 用ガード — ログイン + isPaidUser 判定（マニュアル通り）
 * @returns {{ ok: true, user, accessToken, status } | { ok: false, response: NextResponse }}
 */
export async function requirePaidUser(request) {
  const { user, error } = await authenticateRequest(request);

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "未ログイン" }, { status: 401 }),
    };
  }

  let accessToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  if (!accessToken) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    accessToken = session?.access_token;
  }

  const status = await resolvePaidStatus(user.id, accessToken || undefined);

  if (!status.isPaid) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "有料プランが必要です", source: status.source },
        { status: 403 },
      ),
    };
  }

  return { ok: true, user, accessToken, status };
}
