import { isSubscriptionPaid } from "@/lib/subscriptionStatus";
import { getStripe } from "@/lib/stripe";
import { syncProfileFromSubscription } from "@/lib/syncProfileFromStripe";
import { tryGetSupabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

const SUBSCRIPTION_EVENTS = [
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
];

/** Stripe Webhook — 生 body 必須（bodyParser 無効） */
export async function POST(request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET 未設定" },
      { status: 500 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

    const admin = tryGetSupabaseAdmin();
    if (admin && userId) {
      await admin
        .from("profiles")
        .upsert({
          id: userId,
          is_paid: true,
          stripe_customer_id: customerId ?? null,
        });
    }
  }

  if (SUBSCRIPTION_EVENTS.includes(event.type)) {
    const sub = event.data.object;
    const result = await syncProfileFromSubscription(sub);
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Webhook] ${event.type} customer=${sub.customer} status=${sub.status} cancel_at_period_end=${sub.cancel_at_period_end} → is_paid=${isSubscriptionPaid(sub)} updated=${result.updated ?? 0}`,
      );
    }
    if (!result.ok) {
      console.warn("Webhook profiles 更新:", result.error);
    }
  }

  return NextResponse.json({ received: true });
}
