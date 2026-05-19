import { getActiveStripeSubscription } from "@/lib/getCustomerSubscription";
import { getStripe } from "@/lib/stripe";
import { syncProfileFromSubscription } from "@/lib/syncProfileFromStripe";

export async function cancelSubscriptionAtPeriodEnd(customerId) {
  const sub = await getActiveStripeSubscription(customerId);
  if (!sub) {
    return { ok: false, error: "有効なサブスクリプションが見つかりません" };
  }

  if (sub.cancel_at_period_end) {
    return {
      ok: true,
      alreadyCanceled: true,
      subscription: sub,
    };
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(sub.id, {
    cancel_at_period_end: true,
  });
  const updated = await stripe.subscriptions.retrieve(sub.id, {
    expand: ["items"],
  });

  await syncProfileFromSubscription(updated);

  return { ok: true, subscription: updated };
}

export async function resumeSubscription(customerId) {
  const sub = await getActiveStripeSubscription(customerId);
  if (!sub) {
    return { ok: false, error: "有効なサブスクリプションが見つかりません" };
  }

  if (!sub.cancel_at_period_end) {
    return { ok: true, alreadyActive: true, subscription: sub };
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(sub.id, {
    cancel_at_period_end: false,
  });
  const updated = await stripe.subscriptions.retrieve(sub.id, {
    expand: ["items"],
  });

  await syncProfileFromSubscription(updated);

  return { ok: true, subscription: updated };
}
