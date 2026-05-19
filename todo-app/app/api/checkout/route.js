import { authenticateRequest } from "@/lib/authenticateRequest";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { user, error: authError } = await authenticateRequest(request);

    if (authError || !user) {
      console.error("checkout auth:", authError?.message);
      return NextResponse.json(
        {
          error:
            "ログインが必要です。トップページ（/）でログインしてから、もう一度お試しください。",
        },
        { status: 401 },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      return NextResponse.json(
        {
          error:
            "STRIPE_SECRET_KEY が未設定です。.env を保存（Cmd+S）して dev サーバーを再起動してください",
        },
        { status: 500 },
      );
    }

    const priceId = process.env.STRIPE_PRICE_ID?.trim();
    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "STRIPE_PRICE_ID が未設定です。.env を保存（Cmd+S）して dev サーバーを再起動してください",
        },
        { status: 500 },
      );
    }

    const stripe = getStripe();
    const origin =
      request.headers.get("origin")?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?paid=success`,
      cancel_url: `${origin}/subscribe?canceled=1`,
      client_reference_id: user.id,
      customer_email: user.email,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe の決済 URL を作成できませんでした" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout 失敗" },
      { status: 500 },
    );
  }
}
