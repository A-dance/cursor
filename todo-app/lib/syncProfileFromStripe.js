import { isSubscriptionPaid } from "@/lib/subscriptionStatus";
import { tryGetSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Webhook 用: stripe_customer_id に紐づく profiles.is_paid を更新
 * （Express レッスンの User.findOneAndUpdate 相当）
 */
export async function updateProfilePaidByCustomerId(customerId, isPaid) {
  if (!customerId?.startsWith("cus_")) return { ok: false, error: "invalid customer id" };

  const admin = tryGetSupabaseAdmin();
  if (!admin) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY 未設定" };
  }

  const { data, error } = await admin
    .from("profiles")
    .update({ is_paid: isPaid })
    .eq("stripe_customer_id", customerId)
    .select("id");

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, updated: data?.length ?? 0 };
}

/** subscription オブジェクトから is_paid を同期 */
export async function syncProfileFromSubscription(subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  const isPaid = isSubscriptionPaid(subscription);
  return updateProfilePaidByCustomerId(customerId, isPaid);
}
