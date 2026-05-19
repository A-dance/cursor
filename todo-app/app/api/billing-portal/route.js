import { authenticateRequest } from "@/lib/authenticateRequest";
import { getStripe } from "@/lib/stripe";
import { tryGetSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/** Stripe Customer Portal（支払い方法・請求履歴など） */
export async function POST(request) {
  const { user, error } = await authenticateRequest(request);

  if (error || !user) {
    return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  }

  let customerId = null;

  const admin = tryGetSupabaseAdmin();
  if (admin) {
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();
    customerId = profile?.stripe_customer_id ?? null;
  }

  if (!customerId) {
    const token = request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "")
      .trim();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (token && url && key) {
      const supabase = createClient(url, key, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .maybeSingle();
      customerId = profile?.stripe_customer_id ?? null;
    }
  }

  if (!customerId) {
    return NextResponse.json(
      {
        error:
          "Stripe の顧客情報がありません。先に有料プランに登録するか、/?paid=success で同期してください。",
      },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const origin =
      request.headers.get("origin")?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard?billing=return`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "ポータルの作成に失敗しました。Stripe Dashboard で Customer Portal を有効化してください。",
      },
      { status: 500 },
    );
  }
}
