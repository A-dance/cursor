import { createClient } from "@supabase/supabase-js";
import { getCustomerSubscription } from "@/lib/getCustomerSubscription";
import { isPaidUser } from "@/lib/isPaidUser";
import { tryGetSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * ログインユーザーの有料判定（Stripe 優先 → profiles.is_paid にフォールバック）
 */
export async function resolvePaidStatus(userId, accessToken) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return {
      isPaid: false,
      source: "none",
      customerId: null,
      subscription: null,
    };
  }

  const supabase = createClient(url, key, {
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_paid, stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.stripe_customer_id) {
    try {
      const paid = await isPaidUser(profile.stripe_customer_id);
      const subscription = paid
        ? await getCustomerSubscription(profile.stripe_customer_id)
        : null;

      if (!paid && profile.is_paid) {
        const admin = tryGetSupabaseAdmin();
        if (admin) {
          await admin.from("profiles").update({ is_paid: false }).eq("id", userId);
        }
      }

      return {
        isPaid: paid,
        source: "stripe",
        customerId: profile.stripe_customer_id,
        subscription,
      };
    } catch (err) {
      console.warn("Stripe 有料判定:", err instanceof Error ? err.message : err);
    }
  }

  return {
    isPaid: Boolean(profile?.is_paid),
    source: "profile",
    customerId: profile?.stripe_customer_id ?? null,
    subscription: null,
  };
}
