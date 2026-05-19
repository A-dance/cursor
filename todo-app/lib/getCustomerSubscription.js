import { getStripe } from "@/lib/stripe";
import { subscriptionPeriodEndIso } from "@/lib/subscriptionPeriod";
import { canUsePaidFeatures } from "@/lib/subscriptionStatus";

/** Stripe から利用中サブスクの概要を取得 */
export async function getCustomerSubscription(customerId) {
  if (!customerId?.startsWith("cus_")) return null;

  const stripe = getStripe();
  const { data } = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
    expand: ["data.items"],
  });

  const sub = data.find((s) => canUsePaidFeatures(s));
  if (!sub) return null;

  return {
    subscriptionId: sub.id,
    status: sub.status,
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    currentPeriodEnd: subscriptionPeriodEndIso(sub),
  };
}

/** Customer ID から Stripe の Subscription オブジェクトを取得 */
export async function getActiveStripeSubscription(customerId) {
  if (!customerId?.startsWith("cus_")) return null;

  const stripe = getStripe();
  const { data } = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
    expand: ["data.items"],
  });

  return data.find((s) => canUsePaidFeatures(s)) ?? null;
}
