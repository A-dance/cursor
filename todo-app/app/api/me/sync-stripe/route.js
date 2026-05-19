import { authenticateRequest } from "@/lib/authenticateRequest";
import { syncStripeCustomerForUser } from "@/lib/syncStripeCustomer";
import { NextResponse } from "next/server";

/** 決済後: メールアドレスから Stripe Customer を探して profiles に保存 */
export async function POST(request) {
  const { user, error } = await authenticateRequest(request);

  if (error || !user?.email) {
    return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  }

  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  try {
    const result = await syncStripeCustomerForUser(
      user.id,
      user.email,
      token || undefined,
    );

    if (!result.synced && !result.customerId) {
      return NextResponse.json({
        synced: false,
        message:
          "Stripe に顧客が見つかりません。決済時と同じメールでログインしているか確認してください。",
        isPaid: false,
        customerId: null,
      });
    }

    if (!result.synced && result.customerId) {
      const hint = result.saveError?.includes("does not exist")
        ? "profiles テーブルがありません。Supabase SQL Editor で supabase/setup-profiles-all.sql を実行してください（プロジェクト URL が .env と同じか確認）。"
        : result.saveError?.includes("SUPABASE_SERVICE_ROLE_KEY")
          ? "推奨: Supabase Dashboard → Settings → API の service_role キーを .env の SUPABASE_SERVICE_ROLE_KEY に追加して dev サーバーを再起動。"
          : "Supabase で setup-profiles-all.sql を実行するか、service_role キーを .env に追加してください。";

      return NextResponse.json({
        synced: false,
        message: `顧客は見つかりましたが DB に保存できませんでした。${hint}`,
        detail: result.saveError,
        isPaid: result.isPaid,
        customerId: result.customerId,
      });
    }

    return NextResponse.json({
      synced: true,
      isPaid: result.isPaid,
      customerId: result.customerId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "同期に失敗しました" },
      { status: 500 },
    );
  }
}
