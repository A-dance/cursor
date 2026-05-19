import { authenticateRequest } from "@/lib/authenticateRequest";
import { cancelSubscriptionAtPeriodEnd } from "@/lib/cancelSubscription";
import { subscriptionPeriodEndIso } from "@/lib/subscriptionPeriod";
import { createClient } from "@supabase/supabase-js";
import { tryGetSupabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

/** 請求期間末での解約を予約 */
export async function POST(request) {
  const { user, error } = await authenticateRequest(request);
  if (error || !user) {
    return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  }

  const customerId = await resolveCustomerId(user.id, request);
  if (!customerId) {
    return NextResponse.json(
      { error: "Stripe の顧客情報がありません" },
      { status: 400 },
    );
  }

  try {
    const result = await cancelSubscriptionAtPeriodEnd(customerId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const sub = result.subscription;
    return NextResponse.json({
      ok: true,
      alreadyCanceled: Boolean(result.alreadyCanceled),
      cancelAtPeriodEnd: true,
      currentPeriodEnd: subscriptionPeriodEndIso(sub),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "解約に失敗しました" },
      { status: 500 },
    );
  }
}

async function resolveCustomerId(userId, request) {
  const admin = tryGetSupabaseAdmin();
  if (admin) {
    const { data } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();
    if (data?.stripe_customer_id) return data.stripe_customer_id;
  }

  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return null;

  const supabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();
  return data?.stripe_customer_id ?? null;
}
