import { getStripe } from "@/lib/stripe";
import { canUsePaidFeatures, PAID_SUBSCRIPTION_STATUSES } from "@/lib/subscriptionStatus";

export { PAID_SUBSCRIPTION_STATUSES };

/**
 * 指定 Customer が有料プランか Stripe の Subscription で判定
 * @param {string} customerId - cus_...
 * @returns {Promise<boolean>}
 */
export async function isPaidUser(customerId) {
  if (!customerId?.startsWith("cus_")) {
    return false;
  }

  const stripe = getStripe();
  const { data } = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
  });

  return data.some((sub) => canUsePaidFeatures(sub));
}
